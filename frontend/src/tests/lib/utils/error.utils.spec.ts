import { HardwareWalletAttachError } from "$lib/canisters/nns-dapp/nns-dapp.errors";
import {
  errorToString,
  isPayloadSizeError,
  toToastError,
} from "$lib/utils/error.utils";
import en from "$tests/mocks/i18n.mock";

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

    it("should translate error", () => {
      expect(errorToString(new Error("error__sns.undefined_project"))).toEqual(
        en.error__sns.undefined_project
      );
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

  describe("isPayloadSizeError", () => {
    it("returns true for payload size error", () => {
      const message = `Call failed:
       Canister: rrkah-fqaaa-aaaaa-aaaaq-cai
       Method: list_proposals (query)
       "Status": "rejected"
       "Code": "CanisterError"
       "Message": "IC0504: Canister rrkah-fqaaa-aaaaa-aaaaq-cai violated contract: ic0.msg_reply_data_append: application payload size (3824349) cannot be larger than 3145728"`;
      const err = new Error(message);
      expect(isPayloadSizeError(err)).toBe(true);
    });

    it("returns false for other errors and non errors", () => {
      expect(isPayloadSizeError(new Error("test"))).toBe(false);
      expect(isPayloadSizeError(undefined)).toBe(false);
      expect(isPayloadSizeError({})).toBe(false);
    });
  });
});
