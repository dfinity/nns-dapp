import { existsSync, mkdirSync, writeFileSync } from "fs";
import { NNS_DAPP_URL } from "./common/constants";
import { Options as WebDriverOptions } from "@wdio/types";

export const config: WebdriverIO.Config = {
  baseUrl: NNS_DAPP_URL,

  before: (_capabilities, _spec) => {
    browser["screenshot-prefix"] = "before"; // Suite name
    browser["screenshot-count"] = 0; // Counter restarted with each new suite
    browser["screenshots-taken"] = new Set(); // Set of all screenshot names

    browser.addCommand(
      "screenshot",
      async (name: string, options?: { saveDom?: boolean }) => {
        // Safe increment.  If you see screenshot counts this high, think why.
        browser["screenshot-count"] =
          (Number.isNaN(browser["screenshot-count"])
            ? 1000
            : Number(browser["screenshot-count"])) + 1;
        const countStr: string = browser["screenshot-count"]
          .toFixed()
          .padStart(2, "0");
        const unsafeFilename = `${browser["screenshot-prefix"]}_${countStr}_${name}`;
        // Filesystem-safe characters: ASCII alnum and hyphen.
        // Underscore may be used to separate the components of the path.
        const filename = unsafeFilename.replace(/[^a-zA-Z0-9_]+/g, "-");

        if (true === browser["screenshots-taken"].has(filename)) {
          throw Error(
            `A screenshot with this name was already taken: '${filename}'`
          );
        }
        browser["screenshots-taken"].add(filename);

        const SCREENSHOTS_DIR = "screenshots";
        if (!(existsSync(SCREENSHOTS_DIR) as boolean)) {
          mkdirSync(SCREENSHOTS_DIR);
        }

        // Make screenshots deterministic by removing the spinner and other unstable elements, if they exist.
        await browser.execute(() =>
          document
            .querySelectorAll('[data-tid="spinner"], .toast')
            .forEach((element) => element.remove())
        );
        // Make the screenshot.
        await browser.saveScreenshot(`${SCREENSHOTS_DIR}/${filename}.png`);

        if (options?.saveDom === true) {
          writeFileSync(
            `${SCREENSHOTS_DIR}/${filename}.html`,
            await $(":root").getHTML(),
            { encoding: "utf8" }
          );
        }
      }
    );
  },

  beforeSuite: (suite) => {
    browser["screenshot-prefix"] = suite.fullTitle;
    browser["screenshot-count"] = 0;
  },

  afterTest: async function (test, context, { error }) {
    // Take a screenshot anytime a test fails and throws an error.
    // Note: We could also use `result !== 0` or `passed === true`.
    //       The reason for conditioning on an error is that if
    //       no error is thrown, the code follows its normal flow
    //       so it is possible to take a screenshot in the test itself.
    //       This hook here captures "sudden" death that may be hard
    //       or tedious to capture otherwise.
    if (undefined !== error) {
      await browser["screenshot"](`test-fail_${test.title}`, { saveDom: true });
    }
  },

  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      transpileOnly: true,
      project: "tsconfig.json",
    },
  },
  specs: ["./specs/**/*.e2e.ts"],
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
  logLevel: (process.env.LOG_LEVEL ??
    "warn") as WebDriverOptions.WebDriverLogTypes,
  services: ["chromedriver"],

  framework: "mocha",
  reporters: ["spec"],

  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },

  maxInstances: 1,
};
