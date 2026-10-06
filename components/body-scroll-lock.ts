let locks = 0;
let previousOverflow = "";
let previousRootOverflow = "";

/** Keep overlapping menus/dialogs from releasing each other's scroll lock. */
export function lockBodyScroll() {
  if (locks === 0) {
    previousOverflow = document.body.style.overflow;
    previousRootOverflow = document.documentElement.style.overflow;
  }
  locks += 1;
  // An explicit root lock keeps the stable scrollbar gutter reserved.
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  let released = false;

  return () => {
    if (released) return;
    released = true;
    locks -= 1;
    if (locks === 0) {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    }
  };
}
