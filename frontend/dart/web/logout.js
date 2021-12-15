// Listen for v2 login status events.
// If the user logs out on one tab, they should be logged out on all tabs.
// Svelte implements login and logout sync across tabs.  Here we have a minimal integration
// with the svelte signalling channel so that flutter also logs out.
(() => {
    let loggingOut = false; // Debounce to protect against multiple simultaneous reload calls interfering with each other.
    let checkLoginStatus = () => {
      let currentStoredState = window.localStorage.getItem("AuthSync");
      try {
         const {action} = JSON.parse(currentStoredState);
         if ((action !== "signIn") && (!loggingOut)) {
             loggingOut = true;
             window.location.assign('/v2/');
         }
      } catch(e) {
         // Login status was not present and well formed.
         console.info(e);
         window.location.assign('/v2/');
      }
    }
    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
})();
