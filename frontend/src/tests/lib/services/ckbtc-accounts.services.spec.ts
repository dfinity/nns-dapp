import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import * as ckbtcLedgerApi from "$lib/api/wallet-ledger.api";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import * as services from "$lib/services/ckbtc-accounts.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockTokens } from "$tests/mocks/tokens.mock";

vi.mock("$lib/services/wallet-transactions.services", () => {
  return {
    loadCkBTCAccountTransactions: vi.fn().mockResolvedValue(undefined),
  };
});

describe("ckbtc-accounts-services", () => {
  beforeEach(() => {
    resetIdentity();
  });

  describe("ckBTCTransferTokens", () => {
    let spyAccounts;

    beforeEach(() => {
      vi.clearAllMocks();
      icrcAccountsStore.reset();

      spyAccounts = vi
        .spyOn(ckbtcLedgerApi, "getAccount")
        .mockImplementation(() => Promise.resolve(mockCkBTCMainAccount));
    });

    afterEach(() => {
      tokensStore.reset();
    });

    it("should call ckBTC transfer tokens", async () => {
      tokensStore.setTokens(mockTokens);

      const spyTransfer = vi
        .spyOn(icrcLedgerApi, "icrcTransfer")
        .mockResolvedValue(456n);

      const { blockIndex } = await services.ckBTCTransferTokens({
        source: mockCkBTCMainAccount,
        destinationAddress: "aaaaa-aa",
        amount: 1,
        token: mockCkBTCToken,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      });

      expect(blockIndex).toEqual(456n);
      expect(spyTransfer).toBeCalled();
      expect(spyAccounts).toBeCalled();
    });

    it("should show toast and return success false if transfer fails", async () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      tokensStore.setTokens(mockTokens);

      const spyTransfer = vi
        .spyOn(icrcLedgerApi, "icrcTransfer")
        .mockRejectedValue(new Error("test error"));

      const spyOnToastsError = vi.spyOn(toastsStore, "toastsError");

      const { blockIndex } = await services.ckBTCTransferTokens({
        source: mockCkBTCMainAccount,
        destinationAddress: "aaaaa-aa",
        amount: 1,
        token: mockCkBTCToken,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      });

      expect(blockIndex).toBeUndefined();
      expect(spyTransfer).toBeCalled();
      expect(spyAccounts).not.toBeCalled();
      expect(spyOnToastsError).toBeCalled();
    });

    it("should show toast and return success false if there is no transaction fee", async () => {
      tokensStore.reset();

      const spyTransfer = vi
        .spyOn(icrcLedgerApi, "icrcTransfer")
        .mockRejectedValue(new Error("test error"));

      const spyOnToastsError = vi.spyOn(toastsStore, "toastsError");

      const { blockIndex } = await services.ckBTCTransferTokens({
        source: mockCkBTCMainAccount,
        destinationAddress: "aaaaa-aa",
        amount: 1,
        token: mockCkBTCToken,
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      });

      expect(blockIndex).toBeUndefined();
      expect(spyTransfer).not.toBeCalled();
      expect(spyAccounts).not.toBeCalled();
      expect(spyOnToastsError).toBeCalled();
    });
  });
});
