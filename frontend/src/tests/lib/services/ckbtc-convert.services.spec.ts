/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/ckbtc-ledger.api";
import * as toastsStore from "$lib/stores/toasts.store";
import { CkBTCMinterCanister, type RetrieveBtcOk } from "@dfinity/ckbtc";
import { IcrcLedgerCanister } from "@dfinity/ledger";
import mock from "jest-mock-extended/lib/Mock";
import { convertCkBTCToBtc } from "../../../lib/services/ckbtc-convert.services";
import { loadCkBTCAccountTransactions } from "../../../lib/services/ckbtc-transactions.services";
import { tokensStore } from "../../../lib/stores/tokens.store";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import {
  mockCkBTCAddress,
  mockCkBTCMainAccount,
} from "../../mocks/ckbtc-accounts.mock";
import { mockTokens } from "../../mocks/tokens.mock";

jest.mock("$lib/services/ckbtc-transactions.services", () => {
  return {
    loadCkBTCAccountTransactions: jest.fn().mockResolvedValue(undefined),
  };
});

describe("ckbtc-convert-services", () => {
  const minterCanisterMock = mock<CkBTCMinterCanister>();

  beforeAll(() => {
    jest
      .spyOn(CkBTCMinterCanister, "create")
      .mockImplementation(() => minterCanisterMock);

    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  beforeEach(() => jest.clearAllMocks());

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
      await convertCkBTCToBtc({
        source: mockCkBTCMainAccount,
        destinationAddress: mockCkBTCAddress,
        amount: 1,
      });

      expect(getWithdrawalAccountSpy).toBeCalled();
    });

    describe("transfer tokens succeed", () => {
      jest
        .spyOn(ledgerApi, "getCkBTCAccounts")
        .mockImplementation(() => Promise.resolve([mockCkBTCMainAccount]));

      const transferSpy =
        ledgerCanisterMock.transfer.mockResolvedValue(undefined);

      beforeAll(() => tokensStore.setTokens(mockTokens));

      it("should transfer tokens to ledger", async () => {
        await convertCkBTCToBtc({
          source: mockCkBTCMainAccount,
          destinationAddress: mockCkBTCAddress,
          amount: 1,
        });

        expect(transferSpy).toBeCalled();
      });

      describe("retrieve btc succeed", () => {
        const ok: RetrieveBtcOk = {
          block_index: 1n,
        };

        const retrieveBtcSpy =
          minterCanisterMock.retrieveBtc.mockResolvedValue(ok);

        it("should retrieve btc", async () => {
          await convertCkBTCToBtc({
            source: mockCkBTCMainAccount,
            destinationAddress: mockCkBTCAddress,
            amount: 1,
          });

          expect(retrieveBtcSpy).toBeCalled();
        });

        it("should load transactions", async () => {
          await convertCkBTCToBtc({
            source: mockCkBTCMainAccount,
            destinationAddress: mockCkBTCAddress,
            amount: 1,
          });

          expect(loadCkBTCAccountTransactions).toBeCalled();
        });
      });

      describe("retrieve btc fails", () => {
        it("should display an error if retrieve btc fails", async () => {
          minterCanisterMock.retrieveBtc.mockImplementation(async () => {
            throw new Error();
          });

          const spyOnToastsError = jest.spyOn(toastsStore, "toastsError");

          await convertCkBTCToBtc({
            source: mockCkBTCMainAccount,
            destinationAddress: mockCkBTCAddress,
            amount: 1,
          });

          expect(spyOnToastsError).toBeCalled();
        });
      });
    });

    describe("transfer tokens fails", () => {
      it("should display an error transfer to ledger fails", async () => {
        ledgerCanisterMock.transfer.mockImplementation(async () => {
          throw new Error();
        });

        const spyOnToastsError = jest.spyOn(toastsStore, "toastsError");

        await convertCkBTCToBtc({
          source: mockCkBTCMainAccount,
          destinationAddress: mockCkBTCAddress,
          amount: 1,
        });

        expect(spyOnToastsError).toBeCalled();
      });
    });
  });

  describe("withdrawal account fails", () => {
    it("should display an error if no withdrawal account can be fetched", async () => {
      minterCanisterMock.getWithdrawalAccount.mockImplementation(async () => {
        throw new Error();
      });

      const spyOnToastsError = jest.spyOn(toastsStore, "toastsError");

      await convertCkBTCToBtc({
        source: mockCkBTCMainAccount,
        destinationAddress: mockCkBTCAddress,
        amount: 1,
      });

      expect(spyOnToastsError).toBeCalled();
    });
  });
});
