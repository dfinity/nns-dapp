import * as api from "$lib/api/canisters.api";
import * as icpIndexApi from "$lib/api/icp-index.api";
import * as ledgerApi from "$lib/api/icp-ledger.api";
import { UserNotTheControllerError } from "$lib/canisters/ic-management/ic-management.errors";
import type { CanisterDetails as CanisterInfo } from "$lib/canisters/nns-dapp/nns-dapp.types";
import * as authServices from "$lib/services/auth.services";
import {
  addController,
  attachCanister,
  createCanister,
  detachCanister,
  getCanisterDetails,
  getIcpToCyclesExchangeRate,
  listCanisters,
  notifyAndAttachCanisterIfNeeded,
  notifyTopUpIfNeeded,
  removeController,
  renameCanister,
  topUpCanister,
  updateSettings,
} from "$lib/services/canisters.services";
import { canistersStore } from "$lib/stores/canisters.store";
import { getCanisterCreationCmcAccountIdentifierHex } from "$lib/utils/canisters.utils";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import {
  mockGetIdentity,
  mockIdentity,
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import {
  mockCanister,
  mockCanisterDetails,
  mockCanisterSettings,
  mockCanisters,
} from "$tests/mocks/canisters.mock";
import en from "$tests/mocks/i18n.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { createTransactionWithId } from "$tests/mocks/icp-transactions.mock";
import { AnonymousIdentity } from "@dfinity/agent";
import { toastsStore } from "@dfinity/gix-components";
import { Principal } from "@dfinity/principal";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import type { MockInstance } from "vitest";

vi.mock("$lib/api/icp-ledger.api");
vi.mock("$lib/api/canisters.api");

describe("canisters-services", () => {
  const newBalanceE8s = 100_000_000n;
  const exchangeRate = 10_000n;
  let spyQueryCanisters: MockInstance;
  let spyQueryAccountBalance: MockInstance;
  let spyAttachCanister: MockInstance;
  let spyRenameCanister: MockInstance;
  let spyDetachCanister: MockInstance;
  let spyUpdateSettings: MockInstance;
  let spyCreateCanister: MockInstance;
  let spyTopUpCanister: MockInstance;
  let spyNotifyTopUpCanister: MockInstance;
  let spyQueryCanisterDetails: MockInstance;
  let spyGetExchangeRate: MockInstance;

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

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

    spyNotifyTopUpCanister = vi
      .spyOn(api, "notifyTopUpCanister")
      .mockImplementation(() => Promise.resolve(undefined));

    spyQueryCanisterDetails = vi
      .spyOn(api, "queryCanisterDetails")
      .mockImplementation(() => Promise.resolve(mockCanisterDetails));

    spyGetExchangeRate = vi
      .spyOn(api, "getIcpToCyclesExchangeRate")
      .mockImplementation(() => Promise.resolve(exchangeRate));

    resetIdentity();
    vi.spyOn(authServices, "getAuthenticatedIdentity").mockImplementation(
      mockGetIdentity
    );
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

    it("should reset canister and show toast on error", async () => {
      const errorMessage = "no canisters found";
      spyQueryCanisters = vi
        .spyOn(api, "queryCanisters")
        .mockRejectedValue(new Error(errorMessage));

      canistersStore.setCanisters({
        canisters: mockCanisters,
        certified: true,
      });

      expect(get(canistersStore).canisters).not.toEqual([]);
      expect(get(toastsStore)).toEqual([]);

      await listCanisters({});

      expect(get(canistersStore).canisters).toEqual([]);
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
        text: `There was an unexpected issue while searching for the canisters.`,
      });
    });

    it("should not reset canisters or show toast on uncertified error", async () => {
      const errorMessage = "no canisters found";
      spyQueryCanisters = vi
        .spyOn(api, "queryCanisters")
        .mockImplementation(async ({ certified }) => {
          if (!certified) {
            throw new Error(errorMessage);
          }
          return mockCanisters;
        });

      canistersStore.setCanisters({
        canisters: mockCanisters,
        certified: true,
      });

      expect(get(canistersStore).canisters).not.toEqual([]);
      expect(get(toastsStore)).toEqual([]);

      await listCanisters({});

      expect(get(canistersStore).canisters).not.toEqual([]);
      expect(get(toastsStore)).toEqual([]);
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
      });

      resetIdentity();
    });
  });

  describe("createCanister", () => {
    it("should call api to create a canister", async () => {
      const account = {
        ...mockMainAccount,
        balanceUlps: 500000000n,
      };
      const canisterId = await createCanister({
        amount: 3,
        account,
      });
      expect(canisterId).not.toBeUndefined();
      expect(spyCreateCanister).toBeCalled();
      expect(spyQueryCanisters).toBeCalled();
      await waitFor(() => expect(spyQueryAccountBalance).toBeCalled());
    });

    it("should not call api if account doesn't have enough funds", async () => {
      const account = {
        ...mockMainAccount,
        balanceUlps: 200000000n,
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
        balanceUlps: 200000000n,
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
        balanceUlps: 500000000n,
      };
      const { success } = await topUpCanister({
        amount: 3,
        canisterId: mockCanisterDetails.id,
        account,
      });
      expect(success).toBe(true);
      expect(spyTopUpCanister).toBeCalled();
      await waitFor(() => expect(spyQueryAccountBalance).toBeCalled());
    });

    it("should not call api if account doesn't have enough funds", async () => {
      const account = {
        ...mockMainAccount,
        balanceUlps: 200000000n,
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
        balanceUlps: 200000000n,
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

  describe("notifyTopUpIfNeeded", () => {
    const canisterId = Principal.fromText("mkam6-f4aaa-aaaaa-qablq-cai");
    // Can be reconstructed with:
    // CMC_ID=rkp4c-7iaaa-aaaaa-aaaca-cai
    // CANISTER_ID=mkam6-f4aaa-aaaaa-qablq-cai
    // scripts/convert-id --input text --subaccount_format text --output account_identifier $CMC_ID $CANISTER_ID
    const cmcAccountIdentifierHex =
      "addb464aaaa06f2e7dabf929fb5f729519848fdce636894806797859d23724eb";

    it("should notify if there is a non-zero balance from an unburned top-up", async () => {
      const blockHeight = 34n;
      const memo = 0x50555054n; // TPUP
      const topUpTransaction = createTransactionWithId({
        id: blockHeight,
        memo,
      });

      const spyGetTransactions = vi.spyOn(icpIndexApi, "getTransactions");
      spyGetTransactions.mockResolvedValue({
        balance: 100_000_000n,
        transactions: [topUpTransaction],
      });

      const result = await notifyTopUpIfNeeded({
        canisterId,
      });

      expect(result).toBe(true);

      expect(spyNotifyTopUpCanister).toBeCalledTimes(1);
      expect(spyNotifyTopUpCanister).toBeCalledWith({
        canisterId,
        blockHeight,
        identity: new AnonymousIdentity(),
      });

      expect(spyGetTransactions).toBeCalledTimes(1);
      expect(spyGetTransactions).toBeCalledWith({
        accountIdentifier: cmcAccountIdentifierHex,
        identity: new AnonymousIdentity(),
        maxResults: 1n,
      });
    });

    it("should not notify if there is a zero balance in the cmc account", async () => {
      const balance = 0n;

      const spyGetTransactions = vi.spyOn(icpIndexApi, "getTransactions");
      spyGetTransactions.mockResolvedValue({
        balance,
        transactions: [],
      });

      const result = await notifyTopUpIfNeeded({
        canisterId,
      });

      expect(result).toBe(false);

      expect(spyNotifyTopUpCanister).toBeCalledTimes(0);
    });

    it("should not notify if there is a non-zero balance from a non-top-up transaction", async () => {
      const blockHeight = 34n;
      const memo = 0n;
      const nonTopUpTransaction = createTransactionWithId({
        id: blockHeight,
        memo,
      });
      const balance = 100_000_000n;

      const spyConsoleWarn = vi.spyOn(console, "warn").mockReturnValue();

      const spyGetTransactions = vi.spyOn(icpIndexApi, "getTransactions");
      spyGetTransactions.mockResolvedValue({
        balance,
        transactions: [nonTopUpTransaction],
      });

      const result = await notifyTopUpIfNeeded({
        canisterId,
      });

      expect(result).toBe(false);

      expect(spyNotifyTopUpCanister).toBeCalledTimes(0);

      expect(spyConsoleWarn).toBeCalledTimes(1);
      expect(spyConsoleWarn).toBeCalledWith(
        "CMC subaccount has non-zero balance but the most recent transaction is not a top-up",
        {
          balance,
          canisterId: canisterId.toText(),
          cmcAccountIdentifierHex,
          transaction: nonTopUpTransaction,
        }
      );
    });

    it("should ignore errors on notifying", async () => {
      const blockHeight = 34n;
      const memo = 0x50555054n; // TPUP
      const topUpTransaction = createTransactionWithId({
        id: blockHeight,
        memo,
      });

      const spyConsoleError = vi.spyOn(console, "error").mockReturnValue();

      const spyGetTransactions = vi.spyOn(icpIndexApi, "getTransactions");
      spyGetTransactions.mockResolvedValue({
        balance: 100_000_000n,
        transactions: [topUpTransaction],
      });

      const error = new Error("Notify in progress");
      spyNotifyTopUpCanister.mockRejectedValue(error);

      const result = await notifyTopUpIfNeeded({
        canisterId,
      });

      expect(result).toBe(true);

      expect(spyConsoleError).toBeCalledTimes(1);
      expect(spyConsoleError).toBeCalledWith(error);
    });
  });

  describe("notifyAndAttachCanisterIfNeeded", () => {
    const createCanisterMemo = 0x41455243n;
    const cmcAccountIdentifierHex = getCanisterCreationCmcAccountIdentifierHex({
      controller: mockIdentity.getPrincipal(),
    });
    const blockIndex = 2255n;
    const fundingTransaction = createTransactionWithId({
      memo: createCanisterMemo,
      id: blockIndex,
      operation: {
        Transfer: {
          to: cmcAccountIdentifierHex,
          fee: { e8s: 10_000n },
          from: mockMainAccount.identifier,
          amount: { e8s: 100_000_000n },
          spender: [],
        },
      },
    });
    const attachedCanister: CanisterInfo = {
      ...mockCanister,
      block_index: [blockIndex],
    };

    beforeEach(() => {
      vi.spyOn(api, "notifyAndAttachCanister").mockResolvedValue(undefined);
    });

    it("should notify and attach canister for funding transaction", async () => {
      await notifyAndAttachCanisterIfNeeded({
        transactions: [fundingTransaction],
        canisters: [],
      });

      expect(api.notifyAndAttachCanister).toBeCalledWith({
        blockIndex,
        identity: mockIdentity,
      });
      expect(api.notifyAndAttachCanister).toBeCalledTimes(1);
    });

    it("should notify if canister with different block index is already attached", async () => {
      await notifyAndAttachCanisterIfNeeded({
        transactions: [fundingTransaction],
        canisters: [
          {
            ...attachedCanister,
            block_index: [blockIndex + 1n],
          },
        ],
      });

      expect(api.notifyAndAttachCanister).toBeCalledWith({
        blockIndex,
        identity: mockIdentity,
      });
      expect(api.notifyAndAttachCanister).toBeCalledTimes(1);
    });

    it("should notify for multiple canister creations", async () => {
      const blockIndex2 = blockIndex + 1n;
      const fundingTransaction2 = createTransactionWithId({
        memo: createCanisterMemo,
        id: blockIndex2,
        operation: fundingTransaction.transaction.operation,
      });

      await notifyAndAttachCanisterIfNeeded({
        transactions: [fundingTransaction2, fundingTransaction],
        canisters: [],
      });

      expect(api.notifyAndAttachCanister).toBeCalledWith({
        blockIndex,
        identity: mockIdentity,
      });
      expect(api.notifyAndAttachCanister).toBeCalledWith({
        blockIndex: blockIndex2,
        identity: mockIdentity,
      });
      expect(api.notifyAndAttachCanister).toBeCalledTimes(2);
    });

    it("should not notify if canister is already attached", async () => {
      await notifyAndAttachCanisterIfNeeded({
        transactions: [fundingTransaction],
        canisters: [attachedCanister],
      });

      expect(api.notifyAndAttachCanister).toBeCalledTimes(0);
    });

    it("should not notify if transaction has wrong memo", async () => {
      const transaction = createTransactionWithId({
        memo: createCanisterMemo + 1n,
        id: blockIndex,
        operation: fundingTransaction.transaction.operation,
      });

      await notifyAndAttachCanisterIfNeeded({
        transactions: [transaction],
        canisters: [],
      });

      expect(api.notifyAndAttachCanister).toBeCalledTimes(0);
    });

    it("should not notify for transaction not to CMC subaccount", async () => {
      const transaction = createTransactionWithId({
        memo: createCanisterMemo,
        id: blockIndex,
      });

      await notifyAndAttachCanisterIfNeeded({
        transactions: [transaction],
        canisters: [],
      });

      expect(api.notifyAndAttachCanister).toBeCalledTimes(0);
    });

    it("should notify only once per session", async () => {
      await notifyAndAttachCanisterIfNeeded({
        transactions: [fundingTransaction],
        canisters: [],
      });

      expect(api.notifyAndAttachCanister).toBeCalledWith({
        blockIndex,
        identity: mockIdentity,
      });
      expect(api.notifyAndAttachCanister).toBeCalledTimes(1);

      await notifyAndAttachCanisterIfNeeded({
        transactions: [fundingTransaction],
        canisters: [],
      });
      // Still only called once.
      expect(api.notifyAndAttachCanister).toBeCalledTimes(1);
    });
  });
});
