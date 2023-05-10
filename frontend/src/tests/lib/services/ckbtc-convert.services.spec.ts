import * as ledgerApi from "$lib/api/ckbtc-ledger.api";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import {
  convertCkBTCToBtc,
  retrieveBtc,
} from "$lib/services/ckbtc-convert.services";
import { loadCkBTCAccountTransactions } from "$lib/services/ckbtc-transactions.services";
import { loadCkBTCWithdrawalAccount } from "$lib/services/ckbtc-withdrawal-accounts.services";
import { bitcoinConvertBlockIndexes } from "$lib/stores/bitcoin.store";
import { ckBTCWithdrawalAccountsStore } from "$lib/stores/ckbtc-withdrawal-accounts.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { nowInBigIntNanoSeconds } from "$lib/utils/date.utils";
import { numberToE8s } from "$lib/utils/token.utils";
import { mockSubAccountArray } from "$tests/mocks/accounts.store.mock";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockCkBTCAdditionalCanisters } from "$tests/mocks/canisters.mock";
import {
  mockBTCAddressTestnet,
  mockCkBTCMainAccount,
  mockCkBTCToken,
  mockCkBTCWithdrawalAccount,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockTokens } from "$tests/mocks/tokens.mock";
import { CkBTCMinterCanister, type RetrieveBtcOk } from "@dfinity/ckbtc";
import {
  IcrcLedgerCanister,
  decodeIcrcAccount,
  encodeIcrcAccount,
} from "@dfinity/ledger";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/services/ckbtc-transactions.services", () => {
  return {
    loadCkBTCAccountTransactions: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/services/ckbtc-withdrawal-accounts.services", () => {
  return {
    loadCkBTCWithdrawalAccount: vi.fn().mockResolvedValue(undefined),
  };
});

describe("ckbtc-convert-services", () => {
  const minterCanisterMock = mock<CkBTCMinterCanister>();

  const params = {
    source: mockCkBTCMainAccount,
    destinationAddress: mockBTCAddressTestnet,
    amount: 1,
    universeId: CKBTC_UNIVERSE_CANISTER_ID,
    canisters: mockCkBTCAdditionalCanisters,
  };

  const convert = async (updateProgressSpy: () => void) =>
    await convertCkBTCToBtc({
      ...params,
      updateProgress: updateProgressSpy,
    });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();

    vi.spyOn(CkBTCMinterCanister, "create").mockImplementation(
      () => minterCanisterMock
    );

    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const now = Date.now();
    vi.useFakeTimers().setSystemTime(now);
  });

  describe("convert flow", () => {
    const mockWithdrawalAccount = {
      owner: mockPrincipal,
      subaccount: [Uint8Array.from(mockSubAccountArray)] as [Uint8Array],
    };

    describe("withdrawal account succeed", () => {
      const getWithdrawalAccountSpy =
        minterCanisterMock.getWithdrawalAccount.mockResolvedValue(
          mockWithdrawalAccount
        );

      beforeAll(() => {
        vi.spyOn(IcrcLedgerCanister, "create").mockImplementation(
          () => ledgerCanisterMock
        );
      });

      const ledgerCanisterMock = mock<IcrcLedgerCanister>();

      it("should get a withdrawal account", async () => {
        const updateProgressSpy = vi.fn();

        await convert(updateProgressSpy);

        expect(getWithdrawalAccountSpy).toBeCalledWith();

        expect(updateProgressSpy).toBeCalledTimes(2);
      });

      describe("transfer tokens succeed", () => {
        vi.spyOn(ledgerApi, "getCkBTCAccount").mockImplementation(() =>
          Promise.resolve(mockCkBTCMainAccount)
        );

        const transferSpy = ledgerCanisterMock.transfer.mockResolvedValue(123n);

        beforeAll(() => tokensStore.setTokens(mockTokens));

        const amountE8s = numberToE8s(params.amount);

        it("should transfer tokens to ledger", async () => {
          const blockIndexAddSpy = vi.spyOn(
            bitcoinConvertBlockIndexes,
            "addBlockIndex"
          );

          const updateProgressSpy = vi.fn();

          await convert(updateProgressSpy);

          const to = decodeIcrcAccount(
            encodeIcrcAccount({
              owner: mockWithdrawalAccount.owner,
              subaccount: mockWithdrawalAccount.subaccount[0],
            })
          );

          expect(transferSpy).toBeCalledWith({
            amount: amountE8s,
            created_at_time: nowInBigIntNanoSeconds(),
            fee: mockCkBTCToken.fee,
            from_subaccount: undefined,
            to: {
              owner: to.owner,
              subaccount: [to.subaccount],
            },
          });

          // We test ledger here but the all test go through therefore all steps performed
          expect(updateProgressSpy).toBeCalledTimes(5);

          // Should have added the block index to local storage
          expect(blockIndexAddSpy).toHaveBeenCalledWith(123n);
        });

        describe("retrieve btc succeed", () => {
          const ok: RetrieveBtcOk = {
            block_index: 1n,
          };

          const retrieveBtcSpy =
            minterCanisterMock.retrieveBtc.mockResolvedValue(ok);

          it("should retrieve btc", async () => {
            const updateProgressSpy = vi.fn();

            await convert(updateProgressSpy);

            expect(retrieveBtcSpy).toBeCalledWith({
              address: mockBTCAddressTestnet,
              amount: amountE8s,
            });

            // We test ledger here but the all test go through therefore all steps performed
            expect(updateProgressSpy).toBeCalledTimes(5);
          });

          it("should load transactions and withdrawal account", async () => {
            const updateProgressSpy = vi.fn();

            await convert(updateProgressSpy);

            // We only test that the call is made here. Test should be covered by its respective service.
            expect(loadCkBTCAccountTransactions).toBeCalled();
            expect(loadCkBTCWithdrawalAccount).toBeCalled();

            expect(updateProgressSpy).toBeCalledTimes(5);
          });

          it("should remove block index from local storage", async () => {
            const blockIndexRemoveSpy = vi.spyOn(
              bitcoinConvertBlockIndexes,
              "removeBlockIndex"
            );

            const updateProgressSpy = vi.fn();

            await convert(updateProgressSpy);

            expect(blockIndexRemoveSpy).toHaveBeenCalledWith(123n);
          });
        });

        describe("retrieve btc fails", () => {
          it("should display an error if retrieve btc fails", async () => {
            minterCanisterMock.retrieveBtc.mockImplementation(async () => {
              throw new Error();
            });

            const spyOnToastsError = vi.spyOn(toastsStore, "toastsError");

            const updateProgressSpy = vi.fn();

            await convert(updateProgressSpy);

            expect(spyOnToastsError).toBeCalled();

            expect(updateProgressSpy).toBeCalledTimes(4);
          });

          it("should remove the block index from local storage because ui is still active", async () => {
            const blockIndexRemoveSpy = vi.spyOn(
              bitcoinConvertBlockIndexes,
              "removeBlockIndex"
            );

            minterCanisterMock.retrieveBtc.mockImplementation(async () => {
              throw new Error();
            });

            const updateProgressSpy = vi.fn();

            await convert(updateProgressSpy);

            expect(blockIndexRemoveSpy).toHaveBeenCalledWith(123n);
          });
        });
      });

      describe("transfer tokens fails", () => {
        it("should display an error transfer to ledger fails", async () => {
          ledgerCanisterMock.transfer.mockImplementation(async () => {
            throw new Error();
          });

          const spyOnToastsError = vi.spyOn(toastsStore, "toastsError");

          const updateProgressSpy = vi.fn();

          await convert(updateProgressSpy);

          expect(spyOnToastsError).toBeCalled();

          expect(updateProgressSpy).toBeCalledTimes(2);
        });

        it("should not add block index to local storage", async () => {
          const blockIndexAddSpy = vi.spyOn(
            bitcoinConvertBlockIndexes,
            "addBlockIndex"
          );

          ledgerCanisterMock.transfer.mockImplementation(async () => {
            throw new Error();
          });

          const updateProgressSpy = vi.fn();

          await convert(updateProgressSpy);

          expect(blockIndexAddSpy).not.toBeCalled();
        });
      });
    });

    describe("withdrawal account already loaded in store", () => {
      const getWithdrawalAccountSpy =
        minterCanisterMock.getWithdrawalAccount.mockResolvedValue(
          mockWithdrawalAccount
        );

      beforeEach(() => ckBTCWithdrawalAccountsStore.reset);

      it("should not call to get a withdrawal account", async () => {
        const updateProgressSpy = vi.fn();

        ckBTCWithdrawalAccountsStore.set({
          account: {
            account: mockCkBTCWithdrawalAccount,
            certified: true,
          },
          universeId: CKBTC_UNIVERSE_CANISTER_ID,
        });

        await convert(updateProgressSpy);

        expect(getWithdrawalAccountSpy).not.toBeCalledWith();
      });

      it("should get a withdrawal account if store value is not certified", async () => {
        const updateProgressSpy = vi.fn();

        ckBTCWithdrawalAccountsStore.set({
          account: {
            account: mockCkBTCWithdrawalAccount,
            certified: false,
          },
          universeId: CKBTC_UNIVERSE_CANISTER_ID,
        });

        await convert(updateProgressSpy);

        expect(getWithdrawalAccountSpy).toBeCalledWith();
      });
    });

    describe("withdrawal account fails", () => {
      it("should display an error if no withdrawal account can be fetched", async () => {
        minterCanisterMock.getWithdrawalAccount.mockImplementation(async () => {
          throw new Error();
        });

        const spyOnToastsError = vi.spyOn(toastsStore, "toastsError");

        const updateProgressSpy = vi.fn();

        await convert(updateProgressSpy);

        expect(spyOnToastsError).toBeCalled();

        expect(updateProgressSpy).toBeCalledTimes(1);
      });
    });
  });

  describe("retrieve BTC", () => {
    const ok: RetrieveBtcOk = {
      block_index: 1n,
    };

    const retrieveBtcSpy = minterCanisterMock.retrieveBtc.mockResolvedValue(ok);

    it("should retrieve btc", async () => {
      const updateProgressSpy = vi.fn();

      await retrieveBtc({
        ...params,
        updateProgress: updateProgressSpy,
      });

      expect(retrieveBtcSpy).toBeCalledWith({
        address: mockBTCAddressTestnet,
        amount: numberToE8s(params.amount),
      });

      // We only test that the call is made here. Test should be covered by its respective service.
      expect(loadCkBTCAccountTransactions).not.toBeCalled();
      expect(loadCkBTCWithdrawalAccount).toBeCalled();

      // SEND_BTC + RELOAD + DONE
      expect(updateProgressSpy).toBeCalledTimes(3);
    });

    it("should display an error if retrieve btc fails", async () => {
      minterCanisterMock.retrieveBtc.mockImplementation(async () => {
        throw new Error();
      });

      const spyOnToastsError = vi.spyOn(toastsStore, "toastsError");

      const updateProgressSpy = vi.fn();

      await retrieveBtc({
        ...params,
        updateProgress: updateProgressSpy,
      });

      expect(spyOnToastsError).toBeCalled();

      // SEND_BTC + RELOAD + DONE - i.e.
      expect(updateProgressSpy).toBeCalledTimes(3);
    });

    it("should reload withdrawal account on retrieve btc success", async () => {
      await retrieveBtc({
        ...params,
        updateProgress: vi.fn(),
      });

      expect(loadCkBTCWithdrawalAccount).toBeCalled();
    });

    it("should not reload transaction on retrieve btc success", async () => {
      await retrieveBtc({
        ...params,
        updateProgress: vi.fn(),
      });

      expect(loadCkBTCAccountTransactions).not.toBeCalled();
    });

    it("should reload withdrawal account on retrieve btc error too", async () => {
      minterCanisterMock.retrieveBtc.mockImplementation(async () => {
        throw new Error();
      });

      await retrieveBtc({
        ...params,
        updateProgress: vi.fn(),
      });

      expect(loadCkBTCWithdrawalAccount).toBeCalled();
    });

    it("should not reload transaction on retrieve btc error too", async () => {
      minterCanisterMock.retrieveBtc.mockImplementation(async () => {
        throw new Error();
      });

      await retrieveBtc({
        ...params,
        updateProgress: vi.fn(),
      });

      expect(loadCkBTCAccountTransactions).not.toBeCalled();
    });
  });
});
