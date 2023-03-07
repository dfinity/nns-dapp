/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/ckbtc-ledger.api";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { convertCkBTCToBtc } from "$lib/services/ckbtc-convert.services";
import { loadCkBTCAccountTransactions } from "$lib/services/ckbtc-transactions.services";
import * as toastsStore from "$lib/stores/toasts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { nowInBigIntNanoSeconds } from "$lib/utils/date.utils";
import { numberToE8s } from "$lib/utils/token.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockCkBTCAdditionalCanisters } from "$tests/mocks/canisters.mock";
import {
  mockCkBTCAddress,
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockTokens } from "$tests/mocks/tokens.mock";
import { CkBTCMinterCanister, type RetrieveBtcOk } from "@dfinity/ckbtc";
import {
  decodeIcrcAccount,
  encodeIcrcAccount,
  IcrcLedgerCanister,
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
    destinationAddress: mockCkBTCAddress,
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
      subaccount: [Uint8Array.from([0, 0, 1])] as [Uint8Array],
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
        .spyOn(ledgerApi, "getCkBTCAccounts")
        .mockImplementation(() => Promise.resolve([mockCkBTCMainAccount]));

      const transferSpy =
        ledgerCanisterMock.transfer.mockResolvedValue(undefined);

      beforeAll(() => tokensStore.setTokens(mockTokens));

      const amountE8s = numberToE8s(params.amount);

      it("should transfer tokens to ledger", async () => {
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
            address: mockCkBTCAddress,
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
