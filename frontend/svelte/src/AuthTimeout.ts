/**
 * Logs out if the user doesn't watch any NNS tabs.
 */
export class AuthTimeout {
  timeoutInterval: number = 5 * 60 * 1000;
  timeout: number = 0;

  browserHiddenAttribute: string;

  static VISIBLE = "visible";
  static HIDDEN = "hidden";

  constructor(logoutCallback) {
    this.logout = logoutCallback;
    this.shareVisibilityInfo();
    this.watchVisibility();
  }

  /**
   * Communicates visibility with other tabs, so we don't log out if the user is visible in another tab.
   */
  shareVisibilityInfo() {
    this.broadcastChannel = new BroadcastChannel("nns-auth-idle");
    this.broadcastChannel.onmessage = (event) => {
      console.log({ visibilityChannel: event.data });
      if (!event.isTrusted) return;
      if (event.data === AuthTimeout.VISIBLE) {
        this.onVisibleAnywhere();
      }
      if (event.data === AuthTimeout.HIDDEN) {
        this.onHiddenAnywhere();
      }
    };
  }

  /**
   * Listens for visibility change events on the current page.
   */
  watchVisibility() {
    // Browser compatibility:  Set the name of the hidden property and the change event for visibility
    var hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") {
      // Opera 12.10 and Firefox 18 and later support
      hidden = "hidden";
      visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      hidden = "msHidden";
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      hidden = "webkitHidden";
      visibilityChange = "webkitvisibilitychange";
    }

    if (
      typeof document.addEventListener === "undefined" ||
      hidden === undefined
    ) {
      console.info("No visibility API.  Will simply log out after a while.");
      this.onHiddenAnywhere();
    } else {
      console.info("Will log out after a period of invisibility");
      this.browserHiddenAttribute = hidden;
      document.addEventListener(
        visibilityChange,
        () => this.handleVisibilityChange(),
        false
      );
    }
  }

  /**
   * Sets a logout timer if all tabs become invisible.  Clears the timer if any tab becomes visible for a meaningful period of time.  Flipping past a tab doesn't count.
   */
  handleVisibilityChange() {
    console.log(
      "handleVisibilityChange",
      document[this.browserHiddenAttribute]
    );
    if (document[this.browserHiddenAttribute]) {
      this.broadcastChannel.postMessage(AuthTimeout.HIDDEN);
      this.onHiddenAnywhere();
    } else {
      this.onVisibleHere();
    }
  }

  /**
   * The user visited the current tab!
   */
  onVisibleHere() {
    // Wait to see whether the user stays.
    setTimeout(() => {
      if (!document[this.browserHiddenAttribute]) {
        this.broadcastChannel.postMessage(AuthTimeout.VISIBLE);
        this.onVisibleAnywhere();
      }
    }, 500);
  }

  /**
   * The user went to and stayed on a tab!
   */
  onVisibleAnywhere() {
    clearTimeout(this.timeout);
    console.log("Cleared timeout", this.timeout);
  }

  /**
   * The user left a tab; starts countdown to log out.
   */
  onHiddenAnywhere() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.logout, this.timeoutInterval);
    console.log("Set timeout", this.timeout);
  }
}
