/**
 * Syncs login status across tabs
 */
export class AuthSync {
  broadcastChannel;
  static SIGN_OUT = "signOut";
  static SIGN_IN = "signIn";
  static FAST_INTERVAL = 10000;
  static SLOW_INTERVAL = 60000;

  constructor(callback: Function) {
    if (typeof BroadcastChannel === "undefined") {
      // Safari, IE.  (Safari is expected to have BroadcastChannels soon.)
      setInterval(callback, AuthSync.FAST_INTERVAL);
    } else {
      // Chrome, Firefox, Edge.
      setInterval(callback, AuthSync.SLOW_INTERVAL);
      this.broadcastChannel = new BroadcastChannel("nns-auth");
      this.broadcastChannel.onmessage = function (event) {
        callback();
      };
    }
  }

  onSignIn() {
    if (undefined !== this.broadcastChannel) {
      this.broadcastChannel.postMessage(AuthSync.SIGN_IN);
    }
  }
  onSignOut() {
    if (undefined !== this.broadcastChannel) {
      this.broadcastChannel.postMessage(AuthSync.SIGN_OUT);
    }
  }
}
