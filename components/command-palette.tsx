"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { SearchIcon } from "@/components/icons";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    const handleOpenEvent = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleOpenEvent);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleOpenEvent);
    };
  }, []);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/#projects" },
    { label: "Stack", href: "/stack" },
    { label: "Movies", href: "/movies" },
    { label: "Quotes", href: "/quotes" },
    { label: "Achievements", href: "/achievements" },
    { label: "About", href: "/about" },
  ];

  const actionItems = [
    { label: "Open GitHub", href: "https://github.com/Czar-16", external: true },
    { label: "Open X", href: "https://x.com", external: true },
    { label: "Open LinkedIn", href: "https://linkedin.com", external: true },
    { label: "Contact Me", href: "mailto:anoopjha@example.com", external: true },
  ];

  const filteredNav = navItems.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));
  const filteredActions = actionItems.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card w-full max-w-lg bg-card overflow-hidden shadow-pop"
          >
            <div className="flex items-center px-4 border-b">
              <SearchIcon className="w-5 h-5 text-fg-muted mr-3" />
              <input
                type="text"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent py-4 text-fg focus:outline-none"
                autoFocus
              />
            </div>
            <div className="p-4 max-h-80 overflow-y-auto space-y-4">
              {filteredNav.length > 0 && (
                <div>
                  <p className="text-xs text-fg-muted uppercase tracking-wider mb-2">Navigation</p>
                  <div className="space-y-1">
                    {filteredNav.map((item) => (
                      <button
                        key={item.href}
                        onClick={() => {
                          setIsOpen(false);
                          router.push(item.href);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent/10 hover:text-accent transition-colors text-sm"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredActions.length > 0 && (
                <div>
                  <p className="text-xs text-fg-muted uppercase tracking-wider mb-2">Actions</p>
                  <div className="space-y-1">
                    {filteredActions.map((item) => (
                      <button
                        key={item.href}
                        onClick={() => {
                          setIsOpen(false);
                          if (item.external) {
                            window.open(item.href, "_blank");
                          } else {
                            router.push(item.href);
                          }
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent/10 hover:text-accent transition-colors text-sm"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
