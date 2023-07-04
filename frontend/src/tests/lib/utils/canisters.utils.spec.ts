import { CanisterStatus } from "$lib/canisters/ic-management/ic-management.canister.types";
import { MAX_CANISTER_NAME_LENGTH } from "$lib/constants/canisters.constants";
import {
  canisterStatusToText,
  errorCanisterNameMessage,
  formatCyclesToTCycles,
  getCanisterFromStore,
  isController,
  isUserController,
} from "$lib/utils/canisters.utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockCanisterDetails,
  mockCanisters,
} from "$tests/mocks/canisters.mock";
import en from "$tests/mocks/i18n.mock";
import { Principal } from "@dfinity/principal";

describe("canister-utils", () => {
  describe("getCanisterFromStore", () => {
    it("should return the canister info if present", () => {
      const store = {
        canisters: mockCanisters,
        certified: true,
      };
      const canister = getCanisterFromStore({
        canisterId: mockCanisters[0].canister_id.toText(),
        canistersStore: store,
      });
      expect(canister).toBe(mockCanisters[0]);
    });

    it("should return undefined if not present", () => {
      const store = {
        canisters: mockCanisters,
        certified: true,
      };
      const canister = getCanisterFromStore({
        canisterId: Principal.fromText("aaaaa-aa").toText(),
        canistersStore: store,
      });
      expect(canister).toBeUndefined();
    });

    it("should return undefined if no canisters in the store", () => {
      const store = {
        canisters: undefined,
        certified: true,
      };
      const canister = getCanisterFromStore({
        canisterId: mockCanisters[0].canister_id.toText(),
        canistersStore: store,
      });
      expect(canister).toBeUndefined();
    });

    it("should return undefined if no id", () => {
      const store = {
        canisters: mockCanisters,
        certified: true,
      };
      const canister = getCanisterFromStore({
        canisterId: undefined,
        canistersStore: store,
      });
      expect(canister).toBeUndefined();
    });
  });

  describe("formatCyclesToTCycles", () => {
    it("formats cycles into T Cycles with three decimals of accuracy", () => {
      expect(formatCyclesToTCycles(BigInt(1_000_000_000_000))).toBe("1.000");
      expect(formatCyclesToTCycles(BigInt(876_500_000_000))).toBe("0.877");
      expect(formatCyclesToTCycles(BigInt(876_400_000_000))).toBe("0.876");
      expect(formatCyclesToTCycles(BigInt(10_120_000_000_000))).toBe("10.120");
    });
  });

  describe("isController", () => {
    it("returns true if controller is a controller of a canister", () => {
      const controller = "aaaaa-aa";
      const canisterDetails = {
        ...mockCanisterDetails,
        settings: {
          ...mockCanisterDetails.settings,
          controllers: [controller],
        },
      };
      expect(isController({ controller, canisterDetails })).toBe(true);
    });

    it("returns false if controller is not a controller of a canister", () => {
      const controller = "aaaaa-aa";
      const canisterDetails = {
        ...mockCanisterDetails,
        settings: {
          ...mockCanisterDetails.settings,
          controllers: ["another-controller", "even-another-one"],
        },
      };
      expect(isController({ controller, canisterDetails })).toBe(false);
    });

    it("returns false if canister has no controllers", () => {
      const controller = "aaaaa-aa";
      const canisterDetails = {
        ...mockCanisterDetails,
        settings: {
          ...mockCanisterDetails.settings,
          controllers: [],
        },
      };
      expect(isController({ controller, canisterDetails })).toBe(false);
    });
  });

  describe("isUserController", () => {
    it("returns true if controller is the same in auth store", () => {
      const authStore = {
        identity: mockIdentity,
      };
      const controller = mockIdentity.getPrincipal().toText();
      expect(
        isUserController({
          controller,
          authStore,
        })
      ).toBe(true);
    });

    it("returns false if controller is not the same in auth store", () => {
      const authStore = {
        identity: mockIdentity,
      };
      expect(
        isUserController({
          controller: "not-same",
          authStore,
        })
      ).toBe(false);
    });

    it("returns false if identity is undefined or null", () => {
      const authStoreNull = {
        identity: null,
      };
      const authStoreNotDefined = {
        identity: undefined,
      };
      expect(
        isUserController({
          controller: "some-controller",
          authStore: authStoreNull,
        })
      ).toBe(false);
      expect(
        isUserController({
          controller: "some-controller",
          authStore: authStoreNotDefined,
        })
      ).toBe(false);
    });
  });

  describe("canisterStatusToText", () => {
    it("should map stopped", () =>
      expect(canisterStatusToText(CanisterStatus.Stopped)).toEqual(
        en.canister_detail.status_stopped
      ));
    it("should map stopping", () =>
      expect(canisterStatusToText(CanisterStatus.Stopping)).toEqual(
        en.canister_detail.status_stopping
      ));
    it("should map running", () =>
      expect(canisterStatusToText(CanisterStatus.Running)).toEqual(
        en.canister_detail.status_running
      ));
  });

  describe("errorCanisterNameMessage", () => {
    it("returns undefined if no canister name", () => {
      expect(errorCanisterNameMessage(undefined)).toBeUndefined();
      expect(errorCanisterNameMessage("")).toBeUndefined();
    });

    it("returns undefined if valid canister name", () => {
      expect(errorCanisterNameMessage("My favorite dapp")).toBeUndefined();
      expect(
        errorCanisterNameMessage("a".repeat(MAX_CANISTER_NAME_LENGTH))
      ).toBeUndefined();
    });

    it("returns an error message if canister name longer than max", () => {
      expect(
        errorCanisterNameMessage(
          "My favorite dapp with a super duper long name"
        )
      ).toBe("Canister name too long. Maximum of 24 characters allowed.");
      expect(
        errorCanisterNameMessage("a".repeat(MAX_CANISTER_NAME_LENGTH + 1))
      ).toBe("Canister name too long. Maximum of 24 characters allowed.");
    });
  });
});
