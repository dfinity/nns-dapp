// Listen for v2 login status events
(() => {
    let loggingOut = false; // Debounce to protect against multiple simultaneous reload calls interfering with each other.
    let checkLoginStatus = () => {
      console.log("Checking login status");
      let currentStoredState = window.localStorage.getItem("AuthSync");
      try {
         const {action} = JSON.parse(currentStoredState);
         if ((action !== "signIn") && (!loggingOut)) {
             loggingOut = true;
             window.open('/v2/index.html',"_self");
         } else {
             console.log("Is logged in");
         }
      } catch(e) {
         console.info(e);
         // Login status was not present and well formed.
         window.open('/v2/index.html',"_self");
      }
    }
    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
})();
