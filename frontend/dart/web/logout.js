/* If ever there is no delegation, go to the svelte login page. */
(() => {
     function checkLoginStatus() {
       if (null === window.localStorage.getItem("ic-delegation")) {
         window.location.assign('/v2/');
       }
     }
     window.addEventListener('storage', checkLoginStatus);
     checkLoginStatus();
})();
