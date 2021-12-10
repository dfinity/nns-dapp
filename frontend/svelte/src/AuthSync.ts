/**
 * Syncs login status across tabs
 */
export class AuthSync {
  broadcastChannel;
  static SIGN_OUT = "signOut";
  static SIGN_IN = "signIn";
  static INTERVAL = 10000;

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
