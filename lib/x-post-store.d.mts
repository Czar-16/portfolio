import type { XPost } from "./x-posts";
export function hasXPostStore(): boolean;
export function readStoredXPosts(signal?: AbortSignal): Promise<unknown[]>;
export function persistXPosts(posts: XPost[], signal?: AbortSignal): Promise<void>;
