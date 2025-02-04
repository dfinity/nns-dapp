import * as agent from "$lib/api/agent.api";
import {
  queryAccountBalance,
  sendICP,
  sendIcpIcrc1,
  transactionFee,
} from "$lib/api/icp-ledger.api";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import type { HttpAgent } from "@dfinity/agent";
import { AccountIdentifier, LedgerCanister } from "@dfinity/ledger-icp";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { mock } from "vitest-mock-extended";

describe("icp-ledger.api", () => {
  beforeEach(() => {
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  describe("sendICP", () => {
    let spyTransfer;

    const { identifier: accountIdentifier } = mockMainAccount;
    const amount = 11_000n;
    const fee = 10_000n;

    const now = Date.now();
    const nowInBigIntNanoSeconds = BigInt(now) * 1_000_000n;

    beforeEach(() => {
      const ledgerMock = mock<LedgerCanister>();
      ledgerMock.transfer.mockResolvedValue(0n);
      vi.useFakeTimers().setSystemTime(now);

      vi.spyOn(LedgerCanister, "create").mockImplementation(
        (): LedgerCanister => ledgerMock
      );

      spyTransfer = vi.spyOn(ledgerMock, "transfer");
    });

    it("should call ledger to send ICP", async () => {
      await sendICP({
        identity: mockIdentity,
        to: accountIdentifier,
        amount,
        fee,
      });

      expect(spyTransfer).toHaveBeenCalledWith({
        to: AccountIdentifier.fromHex(accountIdentifier),
        amount,
        createdAt: nowInBigIntNanoSeconds,
        fee,
      });
    });

    it("should call ledger to send ICP with subaccount Id", async () => {
      const fromSubAccount = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 1,
      ];
      await sendICP({
        identity: mockIdentity,
        to: accountIdentifier,
        amount,
        fromSubAccount,
        fee,
      });

      expect(spyTransfer).toHaveBeenCalledWith({
        to: AccountIdentifier.fromHex(accountIdentifier),
        amount,
        fromSubAccount,
        createdAt: nowInBigIntNanoSeconds,
        fee,
      });
    });

    it("should call ledger to send ICP with memo", async () => {
      const memo = 444_555n;
      await sendICP({
        identity: mockIdentity,
        to: accountIdentifier,
        amount,
        memo,
        fee,
      });

      expect(spyTransfer).toHaveBeenCalledWith({
        to: AccountIdentifier.fromHex(accountIdentifier),
        amount,
        memo,
        createdAt: nowInBigIntNanoSeconds,
        fee,
      });
    });

    it("should call ledger to send ICP with createdAt", async () => {
      const memo = 444_555n;
      const createdAt = 123_456n;
      await sendICP({
        identity: mockIdentity,
        to: accountIdentifier,
        amount,
        memo,
        createdAt,
        fee,
      });

      expect(spyTransfer).toHaveBeenCalledWith({
        to: AccountIdentifier.fromHex(accountIdentifier),
        amount,
        memo,
        createdAt,
        fee,
      });
    });
  });

  describe("sendIcpIcrc1", () => {
    let spyTransfer;

    const owner = mockIdentity.getPrincipal();
    const amount = TokenAmount.fromE8s({
      amount: 11_000n,
      token: ICPToken,
    });

    const now = Date.now();
    const nowInBigIntNanoSeconds = BigInt(now) * 1_000_000n;

    beforeEach(() => {
      const ledgerMock = mock<LedgerCanister>();
      ledgerMock.icrc1Transfer.mockResolvedValue(0n);
      vi.useFakeTimers().setSystemTime(now);

      vi.spyOn(LedgerCanister, "create").mockImplementation(
        (): LedgerCanister => ledgerMock
      );

      spyTransfer = vi.spyOn(ledgerMock, "icrc1Transfer");
    });

    it("should call ledger to send ICP", async () => {
      await sendIcpIcrc1({
        identity: mockIdentity,
        to: { owner },
        amount,
      });

      expect(spyTransfer).toHaveBeenCalledWith({
        to: { owner, subaccount: [] },
        amount: amount.toE8s(),
        createdAt: nowInBigIntNanoSeconds,
        fromSubAccount: undefined,
        memo: undefined,
      });
    });

    it("should call ledger to send ICP with fee", async () => {
      const fee = 15_000n;
      await sendIcpIcrc1({
        identity: mockIdentity,
        to: { owner },
        amount,
        fee,
      });

      expect(spyTransfer).toHaveBeenCalledWith({
        to: { owner, subaccount: [] },
        amount: amount.toE8s(),
        fee,
        fromSubAccount: undefined,
        createdAt: nowInBigIntNanoSeconds,
        memo: undefined,
      });
    });

    it("should call ledger to send ICP with subaccount Id", async () => {
      const fromSubAccount = new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 1,
      ]);
      await sendIcpIcrc1({
        identity: mockIdentity,
        to: { owner },
        amount,
        fromSubAccount,
      });

      expect(spyTransfer).toHaveBeenCalledWith({
        to: { owner, subaccount: [] },
        amount: amount.toE8s(),
        fromSubAccount,
        createdAt: nowInBigIntNanoSeconds,
        memo: undefined,
      });
    });

    it("should call ledger to send ICP with icrc1Memo", async () => {
      const icrc1Memo = Uint8Array.from([4, 4, 5, 5]);
      await sendIcpIcrc1({
        identity: mockIdentity,
        to: { owner },
        amount,
        icrc1Memo,
      });

      expect(spyTransfer).toHaveBeenCalledWith({
        to: { owner, subaccount: [] },
        amount: amount.toE8s(),
        icrc1Memo,
        createdAt: nowInBigIntNanoSeconds,
        fromSubAccount: undefined,
      });
    });

    it("should call ledger to send ICP with createdAt", async () => {
      const icrc1Memo = Uint8Array.from([4, 4, 5, 5]);
      const createdAt = 123_456n;
      await sendIcpIcrc1({
        identity: mockIdentity,
        to: { owner },
        amount,
        icrc1Memo,
        createdAt,
      });

      expect(spyTransfer).toHaveBeenCalledWith({
        to: { owner, subaccount: [] },
        amount: amount.toE8s(),
        icrc1Memo,
        createdAt,
        fromSubAccount: undefined,
      });
    });

    it("should call ledger to send ICP with subaccount", async () => {
      const subaccount = Uint8Array.from([9, 9, 3, 3]);
      await sendIcpIcrc1({
        identity: mockIdentity,
        to: { owner, subaccount },
        amount,
      });

      expect(spyTransfer).toHaveBeenCalledWith({
        to: { owner, subaccount: [subaccount] },
        amount: amount.toE8s(),
        icrc1Memo: undefined,
        createdAt: nowInBigIntNanoSeconds,
        fromSubAccount: undefined,
      });
    });
  });

  describe("transactionFee", () => {
    const fee = 10_000n;
    const ledgerMock = mock<LedgerCanister>();

    beforeEach(() => {
      ledgerMock.transactionFee.mockResolvedValue(fee);
      vi.spyOn(LedgerCanister, "create").mockImplementation(
        (): LedgerCanister => ledgerMock
      );
    });

    it("gets transaction fee from LedgerCanister", async () => {
      const actualFee = await transactionFee({ identity: mockIdentity });
      expect(actualFee).toEqual(fee);
      expect(ledgerMock.transactionFee).toBeCalled();
    });
  });

  describe("queryAccountBalance", () => {
    const balance = 10_000_000n;
    const ledgerMock = mock<LedgerCanister>();

    beforeEach(() => {
      ledgerMock.accountBalance.mockResolvedValue(balance);
      vi.spyOn(LedgerCanister, "create").mockImplementation(
        (): LedgerCanister => ledgerMock
      );
    });

    it("gets accounts balance from LedgerCanister", async () => {
      const certified = true;
      const actualBalance = await queryAccountBalance({
        identity: mockIdentity,
        certified,
        icpAccountIdentifier: mockMainAccount.identifier,
      });
      expect(actualBalance).toEqual(balance);
      expect(ledgerMock.accountBalance).toBeCalledWith({
        certified,
        accountIdentifier: AccountIdentifier.fromHex(
          mockMainAccount.identifier
        ),
      });
    });
  });
});
