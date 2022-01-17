// A simple jest config

export default {
  preset: "ts-jest", // make sure tests are transpiled
  testEnvironment: "jsdom", // otherwise jest complains that the test hasn't returned (TODO: investigate)
};
