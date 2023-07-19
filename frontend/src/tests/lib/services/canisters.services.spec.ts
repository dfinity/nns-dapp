import * as api from "$lib/api/canisters.api";
import * as ledgerApi from "$lib/api/icp-ledger.api";
import { UserNotTheControllerError } from "$lib/canisters/ic-management/ic-management.errors";
import {
  addController,
  attachCanister,
  createCanister,
  detachCanister,
  getCanisterDetails,
  getIcpToCyclesExchangeRate,
  listCanisters,
  removeController,
  renameCanister,
  topUpCanister,
  updateSettings,
} from "$lib/services/canisters.services";
import { canistersStore } from "$lib/stores/canisters.store";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import {
  mockIdentity,
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import {
  mockCanisterDetails,
  mockCanisterSettings,
  mockCanisters,
} from "$tests/mocks/canisters.mock";
import en from "$tests/mocks/i18n.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { get } from "svelte/store";
import type { SpyInstance } from "vitest";
import { vi } from "vitest";

vi.mock("$lib/api/icp-ledger.api");
vi.mock("$lib/api/canisters.api");
const blockedApiPaths = ["$lib/api/canisters.api", "$lib/api/icp-ledger.api"];

describe("canisters-services", () => {
  blockAllCallsTo(blockedApiPaths);

  const newBalanceE8s = BigInt(100_000_000);
  const exchangeRate = BigInt(10_000);
  let spyQueryCanisters: SpyInstance;
  let spyQueryAccountBalance: SpyInstance;
  let spyAttachCanister: SpyInstance;
  let spyRenameCanister: SpyInstance;
  let spyDetachCanister: SpyInstance;
  let spyUpdateSettings: SpyInstance;
  let spyCreateCanister: SpyInstance;
  let spyTopUpCanister: SpyInstance;
  let spyQueryCanisterDetails: SpyInstance;
  let spyGetExchangeRate: SpyInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    toastsStore.reset();
    canistersStore.setCanisters({ canisters: [], certified: true });

    spyQueryCanisters = vi
      .spyOn(api, "queryCanisters")
      .mockImplementation(() => Promise.resolve(mockCanisters));
    spyQueryAccountBalance = vi
      .spyOn(ledgerApi, "queryAccountBalance")
      .mockResolvedValue(newBalanceE8s);
    spyAttachCanister = vi
      .spyOn(api, "attachCanister")
      .mockImplementation(() => Promise.resolve(undefined));

    spyRenameCanister = vi
      .spyOn(api, "renameCanister")
      .mockImplementation(() => Promise.resolve(undefined));

    spyDetachCanister = vi
      .spyOn(api, "detachCanister")
      .mockImplementation(() => Promise.resolve(undefined));

    spyUpdateSettings = vi
      .spyOn(api, "updateSettings")
      .mockImplementation(() => Promise.resolve(undefined));

    spyCreateCanister = vi
      .spyOn(api, "createCanister")
      .mockImplementation(() => Promise.resolve(mockCanisterDetails.id));

    spyTopUpCanister = vi
      .spyOn(api, "topUpCanister")
      .mockImplementation(() => Promise.resolve(undefined));

    spyQueryCanisterDetails = vi
      .spyOn(api, "queryCanisterDetails")
      .mockImplementation(() => Promise.resolve(mockCanisterDetails));

    spyGetExchangeRate = vi
      .spyOn(api, "getIcpToCyclesExchangeRate")
      .mockImplementation(() => Promise.resolve(exchangeRate));
  });

  describe("listCanisters", () => {
    it("should list canisters", async () => {
      await listCanisters({});

      expect(spyQueryCanisters).toHaveBeenCalled();

      const store = get(canistersStore);
      expect(store.canisters).toEqual(mockCanisters);
    });

    it("should not list canisters if no identity", async () => {
      setNoIdentity();

      const call = async () => await listCanisters({});

      await expect(call).rejects.toThrow(Error(mockIdentityErrorMsg));

      resetIdentity();
    });
  });

  describe("attachCanister", () => {
    it("should call api to attach canister and list canisters again", async () => {
      const response = await attachCanister({
        canisterId: mockCanisters[0].canister_id,
        name: mockCanisters[0].name,
      });
      expect(response.success).toBe(true);
      expect(spyAttachCanister).toBeCalledWith({
        canisterId: mockCanisters[0].canister_id,
        name: mockCanisters[0].name,
        identity: mockIdentity,
      });
      expect(spyQueryCanisters).toBeCalled();

      const store = get(canistersStore);
      expect(store.canisters).toEqual(mockCanisters);
    });

    it("should not attach canister if no identity", async () => {
      setNoIdentity();

      const response = await attachCanister({
        canisterId: mockCanisterDetails.id,
      });
      expect(response.success).toBe(false);
      expect(spyAttachCanister).not.toBeCalled();
      expect(spyQueryCanisters).not.toBeCalled();
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
        text: expect.stringContaining(en.error.missing_identity),
      });

      resetIdentity();
    });
  });

  describe("renameCanister", () => {
    it("should call api to rename canister and list canisters again", async () => {
      const response = await renameCanister({
        canisterId: mockCanisterDetails.id,
        name: "test",
      });
      expect(response.success).toBe(true);
      expect(spyRenameCanister).toBeCalled();
      expect(spyQueryCanisters).toBeCalled();

      const store = get(canistersStore);
      expect(store.canisters).toEqual(mockCanisters);
    });

    it("should not attach canister if no identity", async () => {
      setNoIdentity();

      const response = await renameCanister({
        canisterId: mockCanisterDetails.id,
        name: "test",
      });
      expect(response.success).toBe(false);
      expect(spyAttachCanister).not.toBeCalled();
      expect(spyQueryCanisters).not.toBeCalled();
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
        text: expect.stringContaining(en.error.missing_identity),
      });

      resetIdentity();
    });
  });

  describe("detachCanister", () => {
    it("should call api to attach canister and list canisters again", async () => {
      const response = await detachCanister(mockCanisterDetails.id);
      expect(response.success).toBe(true);
      expect(spyDetachCanister).toBeCalled();
      expect(spyQueryCanisters).toBeCalled();

      const store = get(canistersStore);
      expect(store.canisters).toEqual(mockCanisters);
    });

    it("should not detach canister if no identity", async () => {
      setNoIdentity();

      const response = await detachCanister(mockCanisterDetails.id);
      expect(response.success).toBe(false);
      expect(spyDetachCanister).not.toBeCalled();
      expect(spyQueryCanisters).not.toBeCalled();
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
        text: expect.stringContaining(en.error.missing_identity),
      });

      resetIdentity();
    });
  });

  describe("updateSettings", () => {
    it("should call api to update settings", async () => {
      const response = await updateSettings({
        canisterId: mockCanisterDetails.id,
        settings: mockCanisterSettings,
      });
      expect(response.success).toBe(true);
      expect(spyUpdateSettings).toBeCalled();
    });

    it("should not update settings if no identity", async () => {
      setNoIdentity();

      const response = await updateSettings({
        canisterId: mockCanisterDetails.id,
        settings: mockCanisterSettings,
      });
      expect(response.success).toBe(false);
      expect(spyUpdateSettings).not.toBeCalled();
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
        text: expect.stringContaining(en.error.missing_identity),
      });

      resetIdentity();
    });
  });

  describe("addController", () => {
    it("should call api to update the settings", async () => {
      const response = await addController({
        controller: "some-controller",
        canisterDetails: mockCanisterDetails,
      });
      expect(response.success).toBe(true);
      expect(spyUpdateSettings).toBeCalled();
    });

    it("should not update settings if controller is already present", async () => {
      const controller = "some-controller";
      const canisterDetails = {
        ...mockCanisterDetails,
        settings: {
          ...mockCanisterDetails.settings,
          controllers: [controller],
        },
      };

      const response = await addController({
        controller,
        canisterDetails: canisterDetails,
      });
      expect(response.success).toBe(false);
      expect(spyUpdateSettings).not.toBeCalled();
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
        text: expect.stringContaining(
          replacePlaceholders(en.error.controller_already_present, {
            $principal: controller,
          })
        ),
      });
    });

    it("should not update settings if no identity", async () => {
      setNoIdentity();

      const response = await addController({
        controller: "some-controller",
        canisterDetails: mockCanisterDetails,
      });
      expect(response.success).toBe(false);
      expect(spyUpdateSettings).not.toBeCalled();
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
        text: expect.stringContaining(en.error.missing_identity),
      });

      resetIdentity();
    });
  });

  describe("removeController", () => {
    it("should call api to update the settings", async () => {
      const controller = "aaaaa-aa";
      const canisterDetails = {
        ...mockCanisterDetails,
        settings: {
          ...mockCanisterDetails.settings,
          controllers: [controller],
        },
      };
      const response = await removeController({
        controller,
        canisterDetails,
      });
      expect(response.success).toBe(true);
      expect(spyUpdateSettings).toBeCalled();
    });

    it("should not call api if controller is not in the list of current controllers", async () => {
      const controller = "aaaaa-aa";
      const canisterDetails = {
        ...mockCanisterDetails,
        settings: {
          ...mockCanisterDetails.settings,
          controllers: [controller],
        },
      };
      const response = await removeController({
        controller: "not-a-controller",
        canisterDetails,
      });
      expect(response.success).toBe(false);
      expect(spyUpdateSettings).not.toBeCalled();
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
        text: expect.stringContaining(en.error.controller_not_present),
      });
    });

    it("should not update settings if no identity", async () => {
      setNoIdentity();
      const controller = "aaaaa-aa";
      const canisterDetails = {
        ...mockCanisterDetails,
        settings: {
          ...mockCanisterDetails.settings,
          controllers: [controller],
        },
      };

      const response = await removeController({
        controller,
        canisterDetails,
      });
      expect(response.success).toBe(false);
      expect(spyUpdateSettings).not.toBeCalled();
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
        text: expect.stringContaining(en.error.missing_identity),
      });

      resetIdentity();
    });
  });

  describe("getCanisterDetails", () => {
    it("should fetch canister details", async () => {
      const canister = await getCanisterDetails(mockCanisterDetails.id);

      expect(spyQueryCanisterDetails).toBeCalled();
      expect(canister).toEqual(mockCanisterDetails);
    });

    it("should not fetch canister details if no identity", async () => {
      setNoIdentity();

      const call = () => getCanisterDetails(mockCanisterDetails.id);

      await expect(call).rejects.toThrow(Error(mockIdentityErrorMsg));
      resetIdentity();
    });

    it("should throw if getCanisterDetails api throws", async () => {
      spyQueryCanisterDetails.mockRejectedValue(
        new UserNotTheControllerError()
      );

      const call = () => getCanisterDetails(mockCanisterDetails.id);

      await expect(call).rejects.toThrow(UserNotTheControllerError);
      spyQueryCanisterDetails.mockRestore();
    });
  });

  describe("getIcpToCyclesExchangeRate", () => {
    it("should call api to get conversion rate", async () => {
      const response = await getIcpToCyclesExchangeRate();
      expect(response).toBe(exchangeRate);
      expect(spyGetExchangeRate).toBeCalled();
    });

    it("should return undefined if no identity", async () => {
      setNoIdentity();

      const response = await getIcpToCyclesExchangeRate();
      expect(response).toBeUndefined();
      expect(spyGetExchangeRate).not.toBeCalled();
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
        text: expect.stringContaining(en.error.missing_identity),
      });

      resetIdentity();
    });
  });

  describe("createCanister", () => {
    it("should call api to create a canister", async () => {
      const account = {
        ...mockMainAccount,
        balanceE8s: 500000000n,
      };
      const canisterId = await createCanister({
        amount: 3,
        account,
      });
      expect(canisterId).not.toBeUndefined();
      expect(spyCreateCanister).toBeCalled();
      expect(spyQueryCanisters).toBeCalled();
      expect(spyQueryAccountBalance).toBeCalled();
    });

    it("should not call api if account doesn't have enough funds", async () => {
      const account = {
        ...mockMainAccount,
        balanceE8s: 200000000n,
      };
      const canisterId = await createCanister({
        amount: 3,
        account,
      });
      expect(canisterId).toBeUndefined();
      expect(spyCreateCanister).not.toBeCalled();
      expect(spyQueryCanisters).not.toBeCalled();
      expect(spyQueryAccountBalance).not.toBeCalled();
    });

    it("should show toast error if account doesn't have enough funds", async () => {
      const account = {
        ...mockMainAccount,
        balanceE8s: 200000000n,
      };
      const canisterId = await createCanister({
        amount: 3,
        account,
      });
      expect(canisterId).toBeUndefined();
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
        text: expect.stringContaining(en.error.insufficient_funds),
      });
    });

    it("should return undefined if no identity", async () => {
      setNoIdentity();

      const canisterId = await createCanister({
        amount: 3,
        account: mockMainAccount,
      });
      expect(canisterId).toBeUndefined();
      expect(spyCreateCanister).not.toBeCalled();
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
        text: expect.stringContaining(en.error.missing_identity),
      });

      resetIdentity();
    });
  });

  describe("topUpCanister", () => {
    it("should call api to top up a canister", async () => {
      const account = {
        ...mockMainAccount,
        balanceE8s: 500000000n,
      };
      const { success } = await topUpCanister({
        amount: 3,
        canisterId: mockCanisterDetails.id,
        account,
      });
      expect(success).toBe(true);
      expect(spyTopUpCanister).toBeCalled();
      expect(spyQueryAccountBalance).toBeCalled();
    });

    it("should not call api if account doesn't have enough funds", async () => {
      const account = {
        ...mockMainAccount,
        balanceE8s: 200000000n,
      };
      const { success } = await topUpCanister({
        amount: 3,
        canisterId: mockCanisterDetails.id,
        account,
      });
      expect(success).toBe(false);
      expect(spyTopUpCanister).not.toBeCalled();
      expect(spyQueryAccountBalance).not.toBeCalled();
    });

    it("should show toast error if account doesn't have enough funds", async () => {
      const account = {
        ...mockMainAccount,
        balanceE8s: 200000000n,
      };
      const { success } = await topUpCanister({
        amount: 3,
        canisterId: mockCanisterDetails.id,
        account,
      });
      expect(success).toBe(false);
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
        text: expect.stringContaining(en.error.insufficient_funds),
      });
    });

    it("should return success false if no identity", async () => {
      setNoIdentity();

      const { success } = await topUpCanister({
        amount: 3,
        account: mockMainAccount,
        canisterId: mockCanisterDetails.id,
      });
      expect(success).toBe(false);
      expect(spyTopUpCanister).not.toBeCalled();
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
        text: expect.stringContaining(en.error.missing_identity),
      });

      resetIdentity();
    });
  });
});
