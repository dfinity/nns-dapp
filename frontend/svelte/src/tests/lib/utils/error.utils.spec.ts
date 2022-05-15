import { HardwareWalletAttachError } from "../../../lib/canisters/nns-dapp/nns-dapp.errors";
import { errorToString, toToastError } from "../../../lib/utils/error.utils";

class TestError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

describe("error-utils", () => {
  describe("to string", () => {
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

  describe("to toast", () => {
    it("should use fallback message", () => {
      expect(
        toToastError({
          fallbackErrorLabelKey: "test.test",
          err: undefined,
        })
      ).toEqual({ labelKey: "test.test" });

      const err = new HardwareWalletAttachError("test");

      expect(
        toToastError({
          fallbackErrorLabelKey: "test.test",
          err,
        })
      ).toEqual({ labelKey: "test.test", err });

      expect(
        toToastError({
          fallbackErrorLabelKey: "test.test",
          err,
        })
      ).toEqual({ labelKey: "test.test", err });
    });

    it("should use error message key", () => {
      const err = new HardwareWalletAttachError("error.rename_subaccount");

      expect(
        toToastError({
          fallbackErrorLabelKey: "test.test",
          err,
        })
      ).toEqual({ labelKey: "error.rename_subaccount" });
    });
  });
});
