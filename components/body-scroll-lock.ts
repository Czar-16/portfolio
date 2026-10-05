let locks = 0;
let previousOverflow = "";

/** Keep overlapping menus/dialogs from releasing each other's scroll lock. */
export function lockBodyScroll() {
  if (locks === 0) previousOverflow = document.body.style.overflow;
  locks += 1;
  document.body.style.overflow = "hidden";
  let released = false;

  return () => {
    if (released) return;
    released = true;
    locks -= 1;
    if (locks === 0) document.body.style.overflow = previousOverflow;
  };
}
