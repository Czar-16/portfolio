let locks = 0;
let previousRootOverflow = "";

/** Keep overlapping menus/dialogs from releasing each other's scroll lock. */
export function lockBodyScroll() {
  if (locks === 0) {
    previousRootOverflow = document.documentElement.style.overflow;
  }
  locks += 1;
  // Lock the viewport without making body a scroll container: that would
  // move the sticky navigation offscreen when opened after scrolling.
  document.documentElement.style.overflow = "hidden";
  let released = false;

  return () => {
    if (released) return;
    released = true;
    locks -= 1;
    if (locks === 0) {
      document.documentElement.style.overflow = previousRootOverflow;
    }
  };
}
