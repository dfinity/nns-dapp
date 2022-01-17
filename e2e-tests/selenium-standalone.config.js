module.exports = {
  drivers: {
    chrome: {
      // This version needs to match the chrome version on GitHub Actions, make
      // sure it is used everywhere (when installing the webdrivers and when
      // running the tests)
      version: "96.0.4664.45",
      arch: process.arch,
      baseURL: "https://chromedriver.storage.googleapis.com",
    },
  },
};
