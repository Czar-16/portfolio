"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { socials } from "@/data/site";
import snapshot from "@/data/x-posts.json";
import { SELECTED_X_POST_IDS } from "@/data/x-post-selection";
import { XIcon } from "@/components/icons";
import { GracefulImage } from "@/components/graceful-image";
import { useReducedMotion } from "@/components/use-reduced-motion";
import { useDocumentVisible } from "@/components/use-document-visible";
import { isXPost, mergeXPosts, selectXPosts, shufflePostIds, type XPost } from "@/lib/x-posts";
import styles from "./x-posts-card.module.css";

const STORAGE_KEY = "portfolio:x-posts:itsCzar16:selected:v2";
const ROTATION_MS = 6000;
const DEFAULT_VIEWPORT_HEIGHT = 384;
const FALLBACK_POSTS = selectXPosts(snapshot.filter(isXPost), SELECTED_X_POST_IDS);
type Deck = { posts: XPost[]; order: string[]; index: number; cycle: number };

function makeDeck(collection: XPost[]): Deck {
  const posts = selectXPosts(collection, SELECTED_X_POST_IDS);
  return { posts, order: posts.length ? [posts[0].id, ...shufflePostIds(posts.slice(1).map(post => post.id))] : [], index: 0, cycle: 0 };
}

function PostAvatar({ post }: { post: XPost }) {
  const [failed, setFailed] = useState(false);
  return <Image src={!failed && post.author.avatarUrl ? post.author.avatarUrl : "/profile/profile.jpg"} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full border border-line object-cover" onError={() => setFailed(true)} />;
}

function PostContent({ post }: { post: XPost }) {
  return (
    <>
      <div className="flex items-center gap-3">
        <PostAvatar post={post} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-fg">{post.author.name}</p>
          <a href={socials.x} target="_blank" rel="noopener noreferrer" className={`${styles.textLink} mt-0.5 inline-block font-mono text-xs text-fg-secondary`}>@{post.author.handle}<span className="sr-only"> (opens in a new tab)</span></a>
        </div>
        <time dateTime={post.createdAt} className="ml-auto shrink-0 font-mono text-[10px] text-fg-secondary">
          {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
        </time>
      </div>
      <a href={post.url} target="_blank" rel="noopener noreferrer" className={styles.postText}>{post.text}<span className="sr-only"> (opens in a new tab)</span></a>
      {post.image && (
        <a href={post.url} target="_blank" rel="noopener noreferrer" className={styles.media} aria-label="View this post and its image on X (opens in a new tab)">
          <GracefulImage src={post.image.url} alt={post.image.alt} className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" fallbackLabel="Image unavailable · View on X" />
        </a>
      )}
    </>
  );
}

function PostSkeleton() {
  return (
    <div className={styles.post} aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className={`${styles.shimmer} h-10 w-10 rounded-full`} />
        <div className="space-y-2"><div className={`${styles.shimmer} h-3 w-20`} /><div className={`${styles.shimmer} h-2.5 w-28`} /></div>
      </div>
      <div className="mt-4 space-y-3"><div className={`${styles.shimmer} h-3 w-full`} /><div className={`${styles.shimmer} h-3 w-11/12`} /><div className={`${styles.shimmer} h-3 w-3/4`} /></div>
      <div className={`${styles.media} ${styles.shimmer}`} />
    </div>
  );
}

function PostSlide({ post, index, count, reduce, onHeightChange }: {
  post: XPost;
  index: number;
  count: number;
  reduce: boolean;
  onHeightChange: (height: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (post.image) {
      onHeightChange(DEFAULT_VIEWPORT_HEIGHT);
      return;
    }

    const measure = () => onHeightChange(Math.ceil(element.getBoundingClientRect().height));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [post, onHeightChange]);

  return (
    <motion.div
      ref={ref}
      data-post-id={post.id}
      className={`${styles.post} ${post.image ? "" : styles.textOnlyPost}`}
      role="group"
      aria-roledescription="slide"
      aria-label={`Post ${index + 1} of ${count}`}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduce ? 0 : -8 }}
      transition={{ duration: reduce ? 0 : 0.175, ease: "easeOut" }}
    ><PostContent post={post} /></motion.div>
  );
}

export function XPostsCard() {
  const cardRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const entered = useInView(cardRef, { once: true, amount: 0.2 });
  const inView = useInView(cardRef, { amount: 0.2 });
  const visible = useDocumentVisible();
  const reduce = useReducedMotion();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(DEFAULT_VIEWPORT_HEIGHT);
  const canRotate = Boolean(!reduce && !hovered && !focused && inView && visible && deck && deck.order.length > 1);
  const post = deck?.posts.find(item => item.id === deck.order[deck.index]);

  useEffect(() => {
    let disposed = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    async function load() {
      try {
        const response = await fetch("/api/x-posts", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Feed unavailable");
        const feed = await response.json();
        if (!Array.isArray(feed?.posts) || !feed.posts.every(isXPost)) throw new Error("Invalid feed");
        let cached: XPost[] = [];
        try {
          const collection: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
          if (Array.isArray(collection)) cached = collection.filter(isXPost);
        } catch { /* Browser storage is optional. */ }
        const posts = selectXPosts(mergeXPosts(FALLBACK_POSTS, cached, feed.posts), SELECTED_X_POST_IDS);
        if (disposed) return;
        setDeck(makeDeck(posts));
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); } catch { /* Browser storage may be disabled or full. */ }
      } catch {
        if (disposed) return;
        let posts: XPost[] = [];
        try {
          const collection: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
          if (Array.isArray(collection)) posts = collection.filter(isXPost);
        } catch { /* Show a profile link if no saved collection is available. */ }
        setDeck(makeDeck(mergeXPosts(FALLBACK_POSTS, posts)));
      } finally { window.clearTimeout(timeout); }
    }
    void load();
    return () => { disposed = true; controller.abort(); window.clearTimeout(timeout); };
  }, []);

  const next = useCallback(() => {
    setDeck(current => {
      if (!current || current.order.length < 2) return current;
      if (current.index < current.order.length - 1) return { ...current, index: current.index + 1 };
      return { ...current, order: shufflePostIds(current.posts.map(item => item.id), current.order[current.index]), index: 0, cycle: current.cycle + 1 };
    });
  }, []);

  useEffect(() => {
    if (!canRotate) return;
    const timer = window.setTimeout(next, ROTATION_MS);
    return () => window.clearTimeout(timer);
  }, [canRotate, next, deck?.index, deck?.cycle]);

  return (
    <motion.div
      className="card-lift-host min-w-0 self-start"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={entered || reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: reduce ? 0 : 0.4, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    >
      <article ref={cardRef} className={`card card-lift rounded-2xl ${styles.card}`} aria-labelledby={titleId} aria-busy={deck === null} data-cursor-glow-border>
        <header className="flex h-7 items-center justify-between gap-4">
          <div className="flex items-center gap-2.5"><XIcon size={19} /><h3 id={titleId} className="text-sm font-semibold tracking-tight">Posts on X</h3></div>
          <a href={socials.x} target="_blank" rel="noopener noreferrer" className={styles.profileLink} aria-label="View itsCzar16 on X (opens in a new tab)"><span aria-hidden="true">↗</span></a>
        </header>
        <motion.div
          className={styles.viewport}
          initial={false}
          animate={{ height: post ? viewportHeight : DEFAULT_VIEWPORT_HEIGHT }}
          transition={{ duration: reduce ? 0 : 0.3, ease: "easeInOut" }}
          role="region"
          aria-roledescription="carousel"
          aria-label="My X posts"
          aria-live="off"
        >
          {deck === null ? <PostSkeleton /> : !post ? (
            <div className={styles.empty}><XIcon size={32} /><p className="mt-5 text-sm text-fg-secondary">My posts are taking a little longer to load.</p><a href={socials.x} target="_blank" rel="noopener noreferrer" className={styles.postLink}>Explore my posts on X ↗</a></div>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <PostSlide
                key={post.id}
                post={post}
                index={deck.index}
                count={deck.order.length}
                reduce={reduce}
                onHeightChange={setViewportHeight}
              />
            </AnimatePresence>
          )}
        </motion.div>
        <footer className={styles.footer}>
          <p className="text-xs text-fg-secondary">For more, visit <a href={socials.x} target="_blank" rel="noopener noreferrer" className={`${styles.textLink} font-mono text-fg`}>@itsCzar16 <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a></p>
        </footer>
        <span className="sr-only" role="status">{deck === null ? "Loading X posts" : deck.order.length ? `${deck.order.length} selected X posts available. ${reduce ? "Automatic rotation disabled for reduced motion." : "Rotation pauses while hovered or focused."}` : "X posts unavailable. Visit my X profile to read them."}</span>
      </article>
    </motion.div>
  );
}
