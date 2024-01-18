import * as agent from "$lib/api/agent.api";
import * as minterApi from "$lib/api/ckbtc-minter.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import * as ckbtcAccountsServices from "$lib/services/ckbtc-accounts.services";
import { convertCkBTCToBtcIcrc2 } from "$lib/services/ckbtc-convert.services";
import { loadWalletTransactions } from "$lib/services/wallet-transactions.services";
import * as toastsStore from "$lib/stores/toasts.store";
import { ConvertBtcStep } from "$lib/types/ckbtc-convert";
import { numberToE8s } from "$lib/utils/token.utils";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockCkBTCAdditionalCanisters } from "$tests/mocks/canisters.mock";
import {
  mockBTCAddressTestnet,
  mockCkBTCMainAccount,
} from "$tests/mocks/ckbtc-accounts.mock";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { HttpAgent } from "@dfinity/agent";
import {
  CkBTCMinterCanister,
  MinterInsufficientFundsError,
  type RetrieveBtcOk,
} from "@dfinity/ckbtc";
import type { Mock } from "vitest";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/services/wallet-transactions.services");

describe("ckbtc-convert-services", () => {
  const now = new Date("2019-02-03T12:34:56.789Z").getTime();
  const minterCanisterMock = mock<CkBTCMinterCanister>();
  let loadCkBTCAccountsSpy;

  const params = {
    source: mockCkBTCMainAccount,
    destinationAddress: mockBTCAddressTestnet,
    amount: 1,
    universeId: CKBTC_UNIVERSE_CANISTER_ID,
    canisters: mockCkBTCAdditionalCanisters,
  };

  const expectStepsPerformed = ({
    updateProgressSpy,
    steps,
  }: {
    updateProgressSpy: Mock;
    steps: ConvertBtcStep[];
  }) => {
    steps.forEach((step, index) => {
      expect(updateProgressSpy).toHaveBeenNthCalledWith(index + 1, step);
    });
    expect(updateProgressSpy).toBeCalledTimes(steps.length);
  };

  beforeEach(() => {
    resetIdentity();
    vi.restoreAllMocks();
    vi.clearAllTimers();

    vi.spyOn(CkBTCMinterCanister, "create").mockImplementation(
      () => minterCanisterMock
    );
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());

    vi.spyOn(console, "error").mockImplementation(() => undefined);
    loadCkBTCAccountsSpy = vi
      .spyOn(ckbtcAccountsServices, "loadCkBTCAccounts")
      .mockResolvedValue(undefined);

    vi.useFakeTimers().setSystemTime(now);
  });

  describe("convert with ICRC-2", () => {
    let approveTransferSpy;
    let resolveApproveTransfer;
    let retrieveBtcSpy;
    let resolveRetrieveBtc;
    let rejectRetrieveBtc;
    let resolveLoadWalletTransactions;
    let spyOnToastsError;

    beforeEach(() => {
      resolveApproveTransfer = undefined;
      resolveRetrieveBtc = undefined;
      resolveLoadWalletTransactions = undefined;

      approveTransferSpy = vi
        .spyOn(icrcLedgerApi, "approveTransfer")
        .mockImplementation(
          () =>
            new Promise<bigint>((resolve) => {
              resolveApproveTransfer = resolve;
            })
        );
      retrieveBtcSpy = vi
        .spyOn(minterApi, "retrieveBtcWithApproval")
        .mockImplementation(
          () =>
            new Promise<RetrieveBtcOk>((resolve, reject) => {
              resolveRetrieveBtc = resolve;
              rejectRetrieveBtc = reject;
            })
        );
      vi.mocked(loadWalletTransactions).mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveLoadWalletTransactions = resolve;
          })
      );
      spyOnToastsError = vi.spyOn(toastsStore, "toastsError");
    });

    it("should approve the transfer", async () => {
      const updateProgressSpy = vi.fn();

      // No await because the call doesn't finish during this test.
      convertCkBTCToBtcIcrc2({
        ...params,
        updateProgress: updateProgressSpy,
      });

      await runResolvedPromises();

      expectStepsPerformed({
        updateProgressSpy,
        steps: [ConvertBtcStep.APPROVE_TRANSFER],
      });

      expect(approveTransferSpy).toBeCalledWith({
        identity: mockIdentity,
        canisterId: params.universeId,
        amount: numberToE8s(params.amount),
        expiresAt: BigInt(now) * 1_000_000n + 5n * 60n * 1_000_000_000n,
        spender: mockCkBTCAdditionalCanisters.minterCanisterId,
      });

      expect(approveTransferSpy).toBeCalledTimes(1);
      expect(retrieveBtcSpy).toBeCalledTimes(0);
      expect(loadWalletTransactions).toBeCalledTimes(0);
      expect(loadCkBTCAccountsSpy).toBeCalledTimes(0);
    });

    it("should retrieve BTC with approval", async () => {
      const updateProgressSpy = vi.fn();

      // No await because the call doesn't finish during this test.
      convertCkBTCToBtcIcrc2({
        ...params,
        updateProgress: updateProgressSpy,
      });

      await runResolvedPromises();
      resolveApproveTransfer(123n);
      await runResolvedPromises();

      expectStepsPerformed({
        updateProgressSpy,
        steps: [ConvertBtcStep.APPROVE_TRANSFER, ConvertBtcStep.SEND_BTC],
      });

      expect(retrieveBtcSpy).toBeCalledWith({
        identity: mockIdentity,
        canisterId: mockCkBTCAdditionalCanisters.minterCanisterId,
        address: params.destinationAddress,
        amount: numberToE8s(params.amount),
      });

      expect(approveTransferSpy).toBeCalledTimes(1);
      expect(retrieveBtcSpy).toBeCalledTimes(1);
      expect(loadWalletTransactions).toBeCalledTimes(0);
      expect(loadCkBTCAccountsSpy).toBeCalledTimes(0);
    });

    it("should reload account and transactions", async () => {
      const updateProgressSpy = vi.fn();

      // No await because the call doesn't finish during this test.
      convertCkBTCToBtcIcrc2({
        ...params,
        updateProgress: updateProgressSpy,
      });

      await runResolvedPromises();
      resolveApproveTransfer(123n);
      await runResolvedPromises();
      resolveRetrieveBtc({ block_index: 125 });
      await runResolvedPromises();

      expectStepsPerformed({
        updateProgressSpy,
        steps: [
          ConvertBtcStep.APPROVE_TRANSFER,
          ConvertBtcStep.SEND_BTC,
          ConvertBtcStep.RELOAD,
        ],
      });

      expect(loadWalletTransactions).toBeCalledWith({
        account: params.source,
        canisterId: params.universeId,
        indexCanisterId: mockCkBTCAdditionalCanisters.indexCanisterId,
      });

      expect(loadCkBTCAccountsSpy).toBeCalledWith({
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      });

      expect(approveTransferSpy).toBeCalledTimes(1);
      expect(retrieveBtcSpy).toBeCalledTimes(1);
      expect(loadWalletTransactions).toBeCalledTimes(1);
      expect(loadCkBTCAccountsSpy).toBeCalledTimes(1);
    });

    it("succeeds", async () => {
      const updateProgressSpy = vi.fn();

      const convertPromise = convertCkBTCToBtcIcrc2({
        ...params,
        updateProgress: updateProgressSpy,
      });

      await runResolvedPromises();
      resolveApproveTransfer(123n);
      await runResolvedPromises();
      resolveRetrieveBtc({ block_index: 125 });
      await runResolvedPromises();
      resolveLoadWalletTransactions(undefined);
      await runResolvedPromises();

      expectStepsPerformed({
        updateProgressSpy,
        steps: [
          ConvertBtcStep.APPROVE_TRANSFER,
          ConvertBtcStep.SEND_BTC,
          ConvertBtcStep.RELOAD,
          ConvertBtcStep.DONE,
        ],
      });

      expect(approveTransferSpy).toBeCalledTimes(1);
      expect(retrieveBtcSpy).toBeCalledTimes(1);
      expect(loadWalletTransactions).toBeCalledTimes(1);
      expect(loadCkBTCAccountsSpy).toBeCalledTimes(1);

      expect(await convertPromise).toEqual({ success: true });
      expect(spyOnToastsError).toBeCalledTimes(0);
    });

    it("fails when minter throws", async () => {
      const updateProgressSpy = vi.fn();

      const convertPromise = convertCkBTCToBtcIcrc2({
        ...params,
        updateProgress: updateProgressSpy,
      });

      await runResolvedPromises();
      resolveApproveTransfer(123n);
      await runResolvedPromises();
      rejectRetrieveBtc(new MinterInsufficientFundsError());
      await runResolvedPromises();
      resolveLoadWalletTransactions(undefined);
      await runResolvedPromises();

      expectStepsPerformed({
        updateProgressSpy,
        steps: [
          ConvertBtcStep.APPROVE_TRANSFER,
          ConvertBtcStep.SEND_BTC,
          ConvertBtcStep.RELOAD,
        ],
      });

      expect(approveTransferSpy).toBeCalledTimes(1);
      expect(retrieveBtcSpy).toBeCalledTimes(1);
      expect(loadWalletTransactions).toBeCalledTimes(1);

      expect(await convertPromise).toEqual({ success: false });
      expect(spyOnToastsError).toBeCalledTimes(1);
    });
  });
});
