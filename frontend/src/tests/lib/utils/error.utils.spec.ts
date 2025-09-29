import { LedgerErrorKey } from "$lib/types/ledger.errors";

import { HardwareWalletAttachError } from "$lib/canisters/nns-dapp/nns-dapp.errors";
import {
  errorToString,
  isCanisterOutOfCyclesError,
  isMethodNotSupportedError,
  isPayloadSizeError,
  toToastError,
} from "$lib/utils/error.utils";
import en from "$tests/mocks/i18n.mock";
import {
  AgentError,
  CertifiedRejectErrorCode,
  ErrorKindEnum,
  ReplicaRejectCode,
  requestIdOf,
  UncertifiedRejectErrorCode,
} from "@dfinity/agent";
import { UnsupportedMethodError } from "@dfinity/sns";

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

  describe("to toast", () => {
    it("should use fallback message", () => {
      expect(
        toToastError({
          fallbackErrorLabelKey: "test.test",
          err: undefined,
        })
      ).toEqual({ labelKey: "test.test", renderAsHtml: false });

      const err = new HardwareWalletAttachError("test");

      expect(
        toToastError({
          fallbackErrorLabelKey: "test.test",
          err,
        })
      ).toEqual({ labelKey: "test.test", err, renderAsHtml: false });

      expect(
        toToastError({
          fallbackErrorLabelKey: "test.test",
          err,
        })
      ).toEqual({ labelKey: "test.test", err, renderAsHtml: false });
    });

    it("should use error message key", () => {
      const err = new HardwareWalletAttachError("error.rename_subaccount");

      expect(
        toToastError({
          fallbackErrorLabelKey: "test.test",
          err,
        })
      ).toEqual({ labelKey: "error.rename_subaccount", renderAsHtml: false });
    });

    it("should pass on renderAsHtml", () => {
      const err = new LedgerErrorKey({
        message: "error__ledger.app_version_not_supported",
        renderAsHtml: true,
      });

      expect(
        toToastError({
          fallbackErrorLabelKey: "test.test",
          err,
        })
      ).toEqual({
        labelKey: "error__ledger.app_version_not_supported",
        renderAsHtml: true,
      });
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

  describe("isMethodNotSupportedError", () => {
    it("returns true for method is not supported", () => {
      const err = new UnsupportedMethodError("get_auto_finalization_status");
      expect(isMethodNotSupportedError(err)).toBe(true);
    });

    it("returns false for other errors and non errors", () => {
      expect(isMethodNotSupportedError(new Error("another error"))).toBe(false);
      expect(isMethodNotSupportedError(undefined)).toBe(false);
      expect(isMethodNotSupportedError({})).toBe(false);
    });
  });

  describe("isCanisterOutOfCycles", () => {
    it("should return true for query error with IC0 codes", () => {
      let queryErrorCode = new UncertifiedRejectErrorCode(
        requestIdOf({}),
        ReplicaRejectCode.CanisterError,
        "There was an error",
        "IC0207",
        []
      );
      let queryError = new AgentError(queryErrorCode, ErrorKindEnum.Unknown);
      expect(isCanisterOutOfCyclesError(queryError)).toBe(true);

      queryErrorCode = new UncertifiedRejectErrorCode(
        requestIdOf({}),
        ReplicaRejectCode.CanisterError,
        "There was an error",
        "IC0503",
        []
      );
      queryError = new AgentError(queryErrorCode, ErrorKindEnum.Unknown);
      expect(isCanisterOutOfCyclesError(queryError)).toBe(true);

      queryErrorCode = new UncertifiedRejectErrorCode(
        requestIdOf({}),
        ReplicaRejectCode.CanisterError,
        "There was an error",
        "IC0",
        []
      );
      queryError = new AgentError(queryErrorCode, ErrorKindEnum.Unknown);
      expect(isCanisterOutOfCyclesError(queryError)).toBe(true);
    });

    it("should return true for update error with IC0207 code", () => {
      let updateErrorCode = new CertifiedRejectErrorCode(
        requestIdOf({}),
        ReplicaRejectCode.CanisterError,
        "There was an error",
        "IC0207"
      );
      let updateError = new AgentError(updateErrorCode, ErrorKindEnum.Unknown);
      expect(isCanisterOutOfCyclesError(updateError)).toBe(true);

      updateErrorCode = new CertifiedRejectErrorCode(
        requestIdOf({}),
        ReplicaRejectCode.CanisterError,
        "There was an error",
        "IC0503"
      );

      updateError = new AgentError(updateErrorCode, ErrorKindEnum.Unknown);
      expect(isCanisterOutOfCyclesError(updateError)).toBe(true);

      updateErrorCode = new CertifiedRejectErrorCode(
        requestIdOf({}),
        ReplicaRejectCode.CanisterError,
        "There was an error",
        "IC0"
      );
      updateError = new AgentError(updateErrorCode, ErrorKindEnum.Unknown);
      expect(isCanisterOutOfCyclesError(updateError)).toBe(true);
    });

    it("should return false for invalid inputs", () => {
      expect(isCanisterOutOfCyclesError(null)).toBe(false);
      expect(isCanisterOutOfCyclesError(undefined)).toBe(false);
      expect(isCanisterOutOfCyclesError("string error")).toBe(false);
      expect(isCanisterOutOfCyclesError(123)).toBe(false);
      expect(isCanisterOutOfCyclesError({})).toBe(false);
      expect(isCanisterOutOfCyclesError({ type: "unknown" })).toBe(false);
    });
  });
});
