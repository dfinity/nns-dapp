// Listen for v2 login status events
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
