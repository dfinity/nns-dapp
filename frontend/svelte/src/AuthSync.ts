/**
 * Syncs login status across tabs
 */
export class AuthSync {
  broadcastChannel;
  static SIGN_OUT = "signOut";
  static SIGN_IN = "signIn";
  static INTERVAL = 10000;

  /**
   * Creates a login sync.
   *
   * @param {Function} callback - invoked whenever login status may have changed in another tab.
   */
  constructor(callback: Function) {
    if (typeof BroadcastChannel === "undefined") {
      // Safari, IE.  (Safari is expected to have BroadcastChannels soon.)
      setInterval(callback, AuthSync.INTERVAL);
    } else {
      // Chrome, Firefox, Edge.
      this.broadcastChannel = new BroadcastChannel("nns-auth");
      this.broadcastChannel.onmessage = function (event) {
        callback();
      };
    }
  }

  /**
   * Communicates to other tabs that we have signed in.
   */
  onSignIn() {
    if (undefined !== this.broadcastChannel) {
      this.broadcastChannel.postMessage(AuthSync.SIGN_IN);
    }
  }

  /**
   * Communicates to other tabs that we have signed out.
   */
  onSignOut() {
    if (undefined !== this.broadcastChannel) {
      this.broadcastChannel.postMessage(AuthSync.SIGN_OUT);
    }
  }
}
