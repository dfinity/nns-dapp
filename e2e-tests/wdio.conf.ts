const { existsSync, mkdirSync } = require("fs");
const { NNS_DAPP_URL } = require("./common/constants");

export const config: WebdriverIO.Config = {
  baseUrl: NNS_DAPP_URL,

  before: (_capabilities, _spec) => {
    browser["screenshots-taken"] = new Set();
    browser["screenshot-prefix"] = "before";
    browser["screenshot-count"] = 0;

    browser.addCommand("screenshot", async (name) => {
      const countStr: string = (browser["screenshot-count"]++)
        .toFixed()
        .padStart(2, "0");
      const unsafeFilename = `${browser["screenshot-prefix"]}_${countStr}_${name}`;
      // Filesystem-safe characters: ASCII alnum and hyphen.
      // Underscore may be used to separate the components of the path.
      const filename = unsafeFilename.replace(/[^a-zA-Z0-9_]+/g, "-");

      if (true === browser["screenshots-taken"].has(filename)) {
        throw Error(`A screenshot with this name was already taken: '${filename}'`);
      }
      browser["screenshots-taken"].add(filename);

      const SCREENSHOTS_DIR = "screenshots";
      if (!(existsSync(SCREENSHOTS_DIR) as boolean)) {
        mkdirSync(SCREENSHOTS_DIR);
      }

      await browser.saveScreenshot(
        `${SCREENSHOTS_DIR}/${filename}.png`
      );
    });
  },

  beforeSuite: (suite) => {
    browser["screenshot-prefix"] = suite.fullTitle;
    browser["screenshot-count"] = 0;
  },

  afterTest: function (test, context, {error}) {
    // Take a screenshot anytime a test fails and throws an error.
    // Note: We could also use `result !== 0` or `passed === true`.
    //       The reason for conditioning on an error is that if
    //       no error is thrown, the code follows its normal flow
    //       so it is possible to take a screenshot in the test itself.
    //       This hook here captures "sudden" death that may be hard
    //       or tedious to capture otherwise.
    if (undefined !== error) {
      // Filenames containing spaces are painful to work with on the command line,
      // so we replace any spaces in the test name when we create the screenshot.
      browser["screenshot"](`test-fail_${test.title}`);
    }
  },

  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      transpileOnly: true,
      project: "tsconfig.json",
    },
  },
  specs: ["./specs/**/*.ts"],
  exclude: [],
  capabilities: [
    {
      browserName: "chrome",
      "goog:chromeOptions": {
        args: ["headless", "disable-gpu"],
      },
      acceptInsecureCerts: true,
    },
  ],
  logLevel:
    process.env.LOG_LEVEL === undefined ? "info" : process.env.LOG_LEVEL,
  services: ["chromedriver"],

  framework: "mocha",
  reporters: ["spec"],

  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },

  maxInstances: 1,
};
