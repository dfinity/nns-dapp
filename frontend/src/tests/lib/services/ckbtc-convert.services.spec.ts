/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/ckbtc-ledger.api";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { convertCkBTCToBtc } from "$lib/services/ckbtc-convert.services";
import { loadCkBTCAccountTransactions } from "$lib/services/ckbtc-transactions.services";
import { bitcoinConvertBlockIndexes } from "$lib/stores/bitcoin.store";
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
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockTokens } from "$tests/mocks/tokens.mock";
import { CkBTCMinterCanister, type RetrieveBtcOk } from "@dfinity/ckbtc";
import {
  IcrcLedgerCanister,
  decodeIcrcAccount,
  encodeIcrcAccount,
} from "@dfinity/ledger";
import mock from "jest-mock-extended/lib/Mock";

jest.mock("$lib/services/ckbtc-transactions.services", () => {
  return {
    loadCkBTCAccountTransactions: jest.fn().mockResolvedValue(undefined),
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
    jest.clearAllMocks();
    jest.clearAllTimers();

    jest
      .spyOn(CkBTCMinterCanister, "create")
      .mockImplementation(() => minterCanisterMock);

    jest.spyOn(console, "error").mockImplementation(() => undefined);

    const now = Date.now();
    jest.useFakeTimers().setSystemTime(now);
  });

  describe("withdrawal account succeed", () => {
    const mockAccount = {
      owner: mockPrincipal,
      subaccount: [Uint8Array.from(mockSubAccountArray)] as [Uint8Array],
    };

    const getWithdrawalAccountSpy =
      minterCanisterMock.getWithdrawalAccount.mockResolvedValue(mockAccount);

    beforeAll(() => {
      jest
        .spyOn(IcrcLedgerCanister, "create")
        .mockImplementation(() => ledgerCanisterMock);
    });

    const ledgerCanisterMock = mock<IcrcLedgerCanister>();

    it("should get a withdrawal account", async () => {
      const updateProgressSpy = jest.fn();

      await convert(updateProgressSpy);

      expect(getWithdrawalAccountSpy).toBeCalledWith();

      expect(updateProgressSpy).toBeCalledTimes(2);
    });

    describe("transfer tokens succeed", () => {
      jest
        .spyOn(ledgerApi, "getCkBTCAccount")
        .mockImplementation(() => Promise.resolve(mockCkBTCMainAccount));

      const transferSpy = ledgerCanisterMock.transfer.mockResolvedValue(123n);

      beforeAll(() => tokensStore.setTokens(mockTokens));

      const amountE8s = numberToE8s(params.amount);

      it("should transfer tokens to ledger", async () => {
        const blockIndexAddSpy = jest.spyOn(
          bitcoinConvertBlockIndexes,
          "addBlockIndex"
        );

        const updateProgressSpy = jest.fn();

        await convert(updateProgressSpy);

        const to = decodeIcrcAccount(
          encodeIcrcAccount({
            owner: mockAccount.owner,
            subaccount: mockAccount.subaccount[0],
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
          const updateProgressSpy = jest.fn();

          await convert(updateProgressSpy);

          expect(retrieveBtcSpy).toBeCalledWith({
            address: mockBTCAddressTestnet,
            amount: amountE8s,
          });

          // We test ledger here but the all test go through therefore all steps performed
          expect(updateProgressSpy).toBeCalledTimes(5);
        });

        it("should load transactions", async () => {
          const updateProgressSpy = jest.fn();

          await convert(updateProgressSpy);

          // We only test that the call is made here. Test should be covered by its respective service.
          expect(loadCkBTCAccountTransactions).toBeCalled();

          expect(updateProgressSpy).toBeCalledTimes(5);
        });

        it("should remove block index from local storage", async () => {
          const blockIndexRemoveSpy = jest.spyOn(
            bitcoinConvertBlockIndexes,
            "removeBlockIndex"
          );

          const updateProgressSpy = jest.fn();

          await convert(updateProgressSpy);

          expect(blockIndexRemoveSpy).toHaveBeenCalledWith(123n);
        });
      });

      describe("retrieve btc fails", () => {
        it("should display an error if retrieve btc fails", async () => {
          minterCanisterMock.retrieveBtc.mockImplementation(async () => {
            throw new Error();
          });

          const spyOnToastsError = jest.spyOn(toastsStore, "toastsError");

          const updateProgressSpy = jest.fn();

          await convert(updateProgressSpy);

          expect(spyOnToastsError).toBeCalled();

          expect(updateProgressSpy).toBeCalledTimes(4);
        });

        it("should remove the block index from local storage because ui is still active", async () => {
          const blockIndexRemoveSpy = jest.spyOn(
            bitcoinConvertBlockIndexes,
            "removeBlockIndex"
          );

          minterCanisterMock.retrieveBtc.mockImplementation(async () => {
            throw new Error();
          });

          const updateProgressSpy = jest.fn();

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

        const spyOnToastsError = jest.spyOn(toastsStore, "toastsError");

        const updateProgressSpy = jest.fn();

        await convert(updateProgressSpy);

        expect(spyOnToastsError).toBeCalled();

        expect(updateProgressSpy).toBeCalledTimes(2);
      });

      it("should not add block index to local storage", async () => {
        const blockIndexAddSpy = jest.spyOn(
          bitcoinConvertBlockIndexes,
          "addBlockIndex"
        );

        ledgerCanisterMock.transfer.mockImplementation(async () => {
          throw new Error();
        });

        const updateProgressSpy = jest.fn();

        await convert(updateProgressSpy);

        expect(blockIndexAddSpy).not.toBeCalled();
      });
    });
  });

  describe("withdrawal account fails", () => {
    it("should display an error if no withdrawal account can be fetched", async () => {
      minterCanisterMock.getWithdrawalAccount.mockImplementation(async () => {
        throw new Error();
      });

      const spyOnToastsError = jest.spyOn(toastsStore, "toastsError");

      const updateProgressSpy = jest.fn();

      await convert(updateProgressSpy);

      expect(spyOnToastsError).toBeCalled();

      expect(updateProgressSpy).toBeCalledTimes(1);
    });
  });
});
