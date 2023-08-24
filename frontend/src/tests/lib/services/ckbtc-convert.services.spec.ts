/**
 * @jest-environment jsdom
 */

import * as agent from "$lib/api/agent.api";
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
import { ConvertBtcStep } from "$lib/types/ckbtc-convert";
import { nowInBigIntNanoSeconds } from "$lib/utils/date.utils";
import { numberToE8s } from "$lib/utils/token.utils";
import { mockPrincipal, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockCkBTCAdditionalCanisters } from "$tests/mocks/canisters.mock";
import {
  mockBTCAddressTestnet,
  mockCkBTCMainAccount,
  mockCkBTCToken,
  mockCkBTCWithdrawalAccount,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockSubAccountArray } from "$tests/mocks/icp-accounts.store.mock";
import { mockTokens } from "$tests/mocks/tokens.mock";
import type { HttpAgent } from "@dfinity/agent";
import { CkBTCMinterCanister, type RetrieveBtcOk } from "@dfinity/ckbtc";
import {
  IcrcLedgerCanister,
  decodeIcrcAccount,
  encodeIcrcAccount,
} from "@dfinity/ledger";
import { mock } from "jest-mock-extended";

jest.mock("$lib/services/ckbtc-transactions.services");
jest.mock("$lib/services/ckbtc-withdrawal-accounts.services");

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

  const expectStepsPerformed = ({
    updateProgressSpy,
    steps,
  }: {
    updateProgressSpy: jest.Mock;
    steps: ConvertBtcStep[];
  }) => {
    steps.forEach((step, index) => {
      expect(updateProgressSpy).toHaveBeenNthCalledWith(index + 1, step);
    });
    expect(updateProgressSpy).toBeCalledTimes(steps.length);
  };

  const expectAllStepsPerformed = (updateProgressSpy: jest.Mock) => {
    expectStepsPerformed({
      updateProgressSpy,
      steps: [
        ConvertBtcStep.INITIALIZATION,
        ConvertBtcStep.LOCKING_CKBTC,
        ConvertBtcStep.SEND_BTC,
        ConvertBtcStep.RELOAD,
        ConvertBtcStep.DONE,
      ],
    });
  };

  beforeEach(() => {
    resetIdentity();
    jest.restoreAllMocks();
    jest.clearAllTimers();

    ckBTCWithdrawalAccountsStore.reset();

    jest
      .spyOn(CkBTCMinterCanister, "create")
      .mockImplementation(() => minterCanisterMock);
    jest.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());

    jest.spyOn(console, "error").mockImplementation(() => undefined);

    const now = Date.now();
    jest.useFakeTimers().setSystemTime(now);
  });

  describe("convert flow", () => {
    const mockWithdrawalAccount = {
      owner: mockPrincipal,
      subaccount: [Uint8Array.from(mockSubAccountArray)] as [Uint8Array],
    };

    describe("withdrawal account succeed", () => {
      const getWithdrawalAccountSpy = minterCanisterMock.getWithdrawalAccount;
      const ledgerCanisterMock = mock<IcrcLedgerCanister>();

      beforeEach(() => {
        jest
          .spyOn(IcrcLedgerCanister, "create")
          .mockImplementation(() => ledgerCanisterMock);
        getWithdrawalAccountSpy.mockResolvedValue(mockWithdrawalAccount);
      });

      it("should get a withdrawal account", async () => {
        const updateProgressSpy = jest.fn();

        await convert(updateProgressSpy);

        expect(getWithdrawalAccountSpy).toBeCalledWith();

        expectStepsPerformed({
          updateProgressSpy,
          steps: [ConvertBtcStep.INITIALIZATION, ConvertBtcStep.LOCKING_CKBTC],
        });
      });

      describe("transfer tokens succeed", () => {
        const transferSpy = ledgerCanisterMock.transfer;
        const amountE8s = numberToE8s(params.amount);

        beforeEach(() => {
          minterCanisterMock.retrieveBtc.mockReset();
          tokensStore.setTokens(mockTokens);
          transferSpy.mockResolvedValue(123n);
          jest
            .spyOn(ledgerApi, "getCkBTCAccount")
            .mockImplementation(() => Promise.resolve(mockCkBTCMainAccount));
        });

        it("should transfer tokens to ledger", async () => {
          const blockIndexAddSpy = jest.spyOn(
            bitcoinConvertBlockIndexes,
            "addBlockIndex"
          );

          const updateProgressSpy = jest.fn();

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
          expectAllStepsPerformed(updateProgressSpy);

          // Should have added the block index to local storage
          expect(blockIndexAddSpy).toHaveBeenCalledWith(123n);
        });

        describe("retrieve btc succeed", () => {
          const ok: RetrieveBtcOk = {
            block_index: 1n,
          };

          const retrieveBtcSpy = minterCanisterMock.retrieveBtc;

          beforeEach(() => {
            retrieveBtcSpy.mockResolvedValue(ok);
          });

          it("should retrieve btc", async () => {
            const updateProgressSpy = jest.fn();

            await convert(updateProgressSpy);

            expect(retrieveBtcSpy).toBeCalledWith({
              address: mockBTCAddressTestnet,
              amount: amountE8s,
            });

            // We test ledger here but the all test go through therefore all steps performed
            expectAllStepsPerformed(updateProgressSpy);
          });

          it("should load transactions and withdrawal account", async () => {
            const updateProgressSpy = jest.fn();

            await convert(updateProgressSpy);

            // We only test that the call is made here. Test should be covered by its respective service.
            expect(loadCkBTCAccountTransactions).toBeCalled();
            expect(loadCkBTCWithdrawalAccount).toBeCalled();

            expectAllStepsPerformed(updateProgressSpy);
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

            expectStepsPerformed({
              updateProgressSpy,
              steps: [
                ConvertBtcStep.INITIALIZATION,
                ConvertBtcStep.LOCKING_CKBTC,
                ConvertBtcStep.SEND_BTC,
                ConvertBtcStep.RELOAD,
              ],
            });
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

          expectStepsPerformed({
            updateProgressSpy,
            steps: [
              ConvertBtcStep.INITIALIZATION,
              ConvertBtcStep.LOCKING_CKBTC,
            ],
          });
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

    describe("withdrawal account already loaded in store", () => {
      const getWithdrawalAccountSpy = minterCanisterMock.getWithdrawalAccount;

      beforeEach(() => {
        getWithdrawalAccountSpy.mockResolvedValue(mockWithdrawalAccount);
      });

      it("should not call to get a withdrawal account", async () => {
        const updateProgressSpy = jest.fn();

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
        const updateProgressSpy = jest.fn();

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

        const spyOnToastsError = jest.spyOn(toastsStore, "toastsError");

        const updateProgressSpy = jest.fn();

        await convert(updateProgressSpy);

        expect(spyOnToastsError).toBeCalled();

        expectStepsPerformed({
          updateProgressSpy,
          steps: [ConvertBtcStep.INITIALIZATION],
        });
      });
    });
  });

  describe("retrieve BTC", () => {
    const ok: RetrieveBtcOk = {
      block_index: 1n,
    };

    const retrieveBtcSpy = minterCanisterMock.retrieveBtc;

    beforeEach(() => {
      retrieveBtcSpy.mockResolvedValue(ok);
    });

    it("should retrieve btc", async () => {
      const updateProgressSpy = jest.fn();

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

      expectStepsPerformed({
        updateProgressSpy,
        steps: [
          ConvertBtcStep.INITIALIZATION,
          ConvertBtcStep.SEND_BTC,
          ConvertBtcStep.RELOAD,
          ConvertBtcStep.DONE,
        ],
      });
    });

    it("should display an error if retrieve btc fails", async () => {
      minterCanisterMock.retrieveBtc.mockImplementation(async () => {
        throw new Error();
      });

      const spyOnToastsError = jest.spyOn(toastsStore, "toastsError");

      const updateProgressSpy = jest.fn();

      await retrieveBtc({
        ...params,
        updateProgress: updateProgressSpy,
      });

      expect(spyOnToastsError).toBeCalled();

      expectStepsPerformed({
        updateProgressSpy,
        steps: [
          ConvertBtcStep.INITIALIZATION,
          ConvertBtcStep.SEND_BTC,
          ConvertBtcStep.RELOAD,
        ],
      });
    });

    it("should reload withdrawal account on retrieve btc success", async () => {
      await retrieveBtc({
        ...params,
        updateProgress: jest.fn(),
      });

      expect(loadCkBTCWithdrawalAccount).toBeCalled();
    });

    it("should not reload transaction on retrieve btc success", async () => {
      await retrieveBtc({
        ...params,
        updateProgress: jest.fn(),
      });

      expect(loadCkBTCAccountTransactions).not.toBeCalled();
    });

    it("should reload withdrawal account on retrieve btc error too", async () => {
      minterCanisterMock.retrieveBtc.mockImplementation(async () => {
        throw new Error();
      });

      await retrieveBtc({
        ...params,
        updateProgress: jest.fn(),
      });

      expect(loadCkBTCWithdrawalAccount).toBeCalled();
    });

    it("should not reload transaction on retrieve btc error too", async () => {
      minterCanisterMock.retrieveBtc.mockImplementation(async () => {
        throw new Error();
      });

      await retrieveBtc({
        ...params,
        updateProgress: jest.fn(),
      });

      expect(loadCkBTCAccountTransactions).not.toBeCalled();
    });
  });
});
