import * as api from "$lib/api/sns-ledger.api";
import * as services from "$lib/services/sns-accounts.services";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import { tick } from "svelte";
import { get } from "svelte/store";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import { mockSnsMainAccount } from "../../mocks/sns-accounts.mock";

describe("sns-accounts-services", () => {
  describe("loadSnsAccounts", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      snsAccountsStore.reset();
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });
    it("should call api.getSnsAccounts and load neurons in store", async () => {
      const spyQuery = jest
        .spyOn(api, "getSnsAccounts")
        .mockImplementation(() => Promise.resolve([mockSnsMainAccount]));

      await services.loadSnsAccounts(mockPrincipal);

      await tick();
      const store = get(snsAccountsStore);
      expect(store[mockPrincipal.toText()]?.accounts).toHaveLength(1);
      expect(spyQuery).toBeCalled();
    });

    it("should empty store if update call fails", async () => {
      snsAccountsStore.setAccounts({
        rootCanisterId: mockPrincipal,
        accounts: [mockSnsMainAccount],
        certified: true,
      });
      const spyQuery = jest
        .spyOn(api, "getSnsAccounts")
        .mockImplementation(() => Promise.reject(undefined));

      await services.loadSnsAccounts(mockPrincipal);

      await tick();
      const store = get(snsAccountsStore);
      expect(store[mockPrincipal.toText()]).toBeUndefined();
      expect(spyQuery).toBeCalled();
    });
  });

  describe("syncSnsAccounts", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      snsAccountsStore.reset();
    });
    it("should call sns accounts and transaction fee and load them in store", async () => {
      const spyAccountsQuery = jest
        .spyOn(api, "getSnsAccounts")
        .mockImplementation(() => Promise.resolve([mockSnsMainAccount]));
      const fee = BigInt(10_000);
      const spyFeeQuery = jest
        .spyOn(api, "transactionFee")
        .mockImplementation(() => Promise.resolve(fee));

      await services.syncSnsAccounts(mockPrincipal);

      await tick();
      expect(spyAccountsQuery).toBeCalled();
      expect(spyFeeQuery).toBeCalled();

      const store = get(snsAccountsStore);
      expect(store[mockPrincipal.toText()]?.accounts).toHaveLength(1);

      const feeStore = get(transactionsFeesStore);
      expect(feeStore.projects[mockPrincipal.toText()]?.fee).toEqual(fee);
    });
  });

  describe("snsTransferTokens", () => {
    const spyAccounts = jest
      .spyOn(api, "getSnsAccounts")
      .mockImplementation(() => Promise.resolve([mockSnsMainAccount]));

    beforeEach(() => {
      jest.clearAllMocks();
      snsAccountsStore.reset();
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });
    it("should call sns transfer tokens", async () => {
      const spyTransfer = jest
        .spyOn(api, "transfer")
        .mockResolvedValue(undefined);

      const { success } = await services.snsTransferTokens({
        rootCanisterId: mockPrincipal,
        source: mockSnsMainAccount,
        destinationAddress: "aaaaa-aa",
        e8s: BigInt(10_000_000),
      });

      expect(success).toBe(true);
      expect(spyTransfer).toBeCalled();
      expect(spyAccounts).toBeCalled();
    });

    it("should show toast and return success false if transfer fails", async () => {
      const spyTransfer = jest
        .spyOn(api, "transfer")
        .mockRejectedValue(new Error("test error"));
      const spyOnToastsError = jest.spyOn(toastsStore, "toastsError");

      const { success } = await services.snsTransferTokens({
        rootCanisterId: mockPrincipal,
        source: mockSnsMainAccount,
        destinationAddress: "aaaaa-aa",
        e8s: BigInt(10_000_000),
      });

      expect(success).toBe(false);
      expect(spyTransfer).toBeCalled();
      expect(spyAccounts).not.toBeCalled();
      expect(spyOnToastsError).toBeCalled();
    });
  });
});
