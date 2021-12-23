/**
 * Syncs login status across tabs
 */
export class AuthSync {
  broadcastChannel;
  lastStoredState;
  static NAME = "AuthSync";
  static SIGN_OUT = "signOut";
  static SIGN_IN = "signIn";

  /**
   * Creates a login sync.
   *
   * @param {Function} callback - invoked whenever login status may have changed in another tab.
   */
  constructor(callback: Function) {
    // Use localStorage rather than BroadcastChannel because of Safari and IE.  (Safari is expected to have BroadcastChannels soon.)
    window.addEventListener("storage", () => {
      let currentStoredState = window.localStorage.getItem(AuthSync.NAME);
      if (currentStoredState !== this.lastStoredState) {
        this.lastStoredState = currentStoredState;
        callback();
      }
    });
  }

  /**
   * Communicates to other tabs that we have signed in.
   */
  onSignIn() {
    this.#onChange(AuthSync.SIGN_IN);
  }

  /**
   * Communicates to other tabs that we have signed out.
   */
  onSignOut() {
    this.#onChange(AuthSync.SIGN_OUT);
  }

  /**
   * Gets the currently stored action.
   */
  #getStoredAction() {
    try {
      return JSON.parse(window.localStorage.getItem(AuthSync.NAME)).action;
    } catch (_) {
      return undefined;
    }
  }

  /**
   * Communicates to other tabs that the login state has changed.
   *
   * @param {string} action - login or logout action.
   */
  #onChange(action) {
    if (action !== this.#getStoredAction()) {
      localStorage.setItem(
        AuthSync.NAME,
        JSON.stringify({
          action,
          timestamp: Date.now(),
        })
      );
    }
  }
}
