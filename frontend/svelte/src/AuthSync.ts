/**
 * Syncs login status across tabs
 */
export class AuthSync {
  broadcastChannel;
  lastStoredState;
  static NAME = "AuthSync";
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
      window.addEventListener('storage', () => {
        let currentStoredState = window.localStorage.getItem(AuthSync.NAME);
        if (currentStoredState !== this.lastStoredState) {
            this.lastStoredState = currentStoredState;
            callback();
        }
      });
      setInterval(callback, AuthSync.INTERVAL);
    } else {
      // Chrome, Firefox, Edge.
      this.broadcastChannel = new BroadcastChannel(AuthSync.NAME);
      this.broadcastChannel.onmessage = function (event) {
        callback();
      };
    }
  }

  /**
   * Communicates to other tabs that we have signed in.
   */
  onSignIn() {
    if (undefined === this.broadcastChannel) {
      localStorage.setItem(AuthSync.NAME, AuthSync.SIGN_IN);
    } else {
      this.broadcastChannel.postMessage(AuthSync.SIGN_IN);
    }
  }

  /**
   * Communicates to other tabs that we have signed out.
   */
  onSignOut() {
    if (undefined === this.broadcastChannel) {
      localStorage.setItem(AuthSync.NAME, AuthSync.SIGN_OUT);
    } else {
      this.broadcastChannel.postMessage(AuthSync.SIGN_OUT);
    }
  }
}
