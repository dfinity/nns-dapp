import * as agent from "$lib/api/agent.api";
import * as minterApi from "$lib/api/ckbtc-minter.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import {
  CKBTC_LEDGER_CANISTER_ID,
  CKBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { convertCkBTCToBtcIcrc2 } from "$lib/services/ckbtc-convert.services";
import * as walletAccountsServices from "$lib/services/icrc-accounts.services";
import { loadIcrcAccountTransactions } from "$lib/services/icrc-transactions.services";
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
import { toastsStore } from "@dfinity/gix-components";
import { get } from "svelte/store";
import type { Mock } from "vitest";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/services/icrc-transactions.services");
vi.mock("$lib/services/icrc-accounts.services");

describe("ckbtc-convert-services", () => {
  const now = new Date("2019-02-03T12:34:56.789Z").getTime();
  const minterCanisterMock = mock<CkBTCMinterCanister>();
  let loadAccountsSpy;

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
    vi.clearAllTimers();

    vi.spyOn(CkBTCMinterCanister, "create").mockImplementation(
      () => minterCanisterMock
    );
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());

    vi.spyOn(console, "error").mockImplementation(() => undefined);
    loadAccountsSpy = vi
      .spyOn(walletAccountsServices, "loadAccounts")
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
      vi.mocked(loadIcrcAccountTransactions).mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveLoadWalletTransactions = resolve;
          })
      );
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
      expect(loadIcrcAccountTransactions).toBeCalledTimes(0);
      expect(loadAccountsSpy).toBeCalledTimes(0);
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
      expect(loadIcrcAccountTransactions).toBeCalledTimes(0);
      expect(loadAccountsSpy).toBeCalledTimes(0);
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

      expect(loadIcrcAccountTransactions).toBeCalledWith({
        account: params.source,
        ledgerCanisterId: params.universeId,
        indexCanisterId: mockCkBTCAdditionalCanisters.indexCanisterId,
      });

      expect(loadAccountsSpy).toBeCalledWith({
        ledgerCanisterId: CKBTC_LEDGER_CANISTER_ID,
      });

      expect(approveTransferSpy).toBeCalledTimes(1);
      expect(retrieveBtcSpy).toBeCalledTimes(1);
      expect(loadIcrcAccountTransactions).toBeCalledTimes(1);
      expect(loadAccountsSpy).toBeCalledTimes(1);
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
      expect(loadIcrcAccountTransactions).toBeCalledTimes(1);
      expect(loadAccountsSpy).toBeCalledTimes(1);

      expect(await convertPromise).toEqual({ success: true });
      expect(get(toastsStore)).toEqual([]);
    });

    it("fails when minter throws", async () => {
      const updateProgressSpy = vi.fn();

      const convertPromise = convertCkBTCToBtcIcrc2({
        ...params,
        updateProgress: updateProgressSpy,
      });

      expect(get(toastsStore)).toEqual([]);

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
      expect(loadIcrcAccountTransactions).toBeCalledTimes(1);

      expect(await convertPromise).toEqual({ success: false });
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "Insufficient funds. ",
        },
      ]);
    });
  });
});
