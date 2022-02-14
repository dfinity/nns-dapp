import { errorToString } from "../../../lib/utils/error.utils";

class TestError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

describe("error-utils", () => {
  it("should parse error", () => {
    expect(errorToString("test")).toEqual("test");

    const error = new Error("test");
    expect(errorToString(error)).toEqual("test");

    const error2 = new TestError("test");
    expect(errorToString(error2)).toEqual("test");
  });

  it("should not parse error", () => {
    expect(errorToString(undefined)).toBeUndefined();
  });
});
