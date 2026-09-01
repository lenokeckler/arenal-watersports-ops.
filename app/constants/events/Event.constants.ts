export const WINDOW_EVENTS = {
  RESIZE: "resize",
};

export const RECAPTCHA_EVENTS = {
  RESIZE: "resize",
  IFRAME_LOAD: "load",
};

export const BROWSER_EVENTS = {
  POPSTATE: "popstate",
  BEFORE_UNLOAD: "beforeunload",
  PAGE_HIDDEN: "pagehide",
  CLICK: "click",
  KEYDOWN: "keydown",
  MOUSEDOWN: "mousedown",
  MOUSEMOVE: "mousemove",
  KEYPRESS: "keypress",
  SCROLL: "scroll",
  TOUCHSTART: "touchstart",
} as const;
