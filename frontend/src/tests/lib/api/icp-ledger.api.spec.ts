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
import { IcrcLedgerCanister } from "@dfinity/ledger";
import { AccountIdentifier, LedgerCanister } from "@dfinity/nns";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { mock } from "jest-mock-extended";

describe("icp-ledger.api", () => {
  beforeEach(() => {
    jest.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  describe("sendICP", () => {
    let spyTransfer;

    const { identifier: accountIdentifier } = mockMainAccount;
    const amount = TokenAmount.fromE8s({
      amount: BigInt(11_000),
      token: ICPToken,
    });

    const now = Date.now();
    const nowInBigIntNanoSeconds = BigInt(now) * BigInt(1_000_000);

    beforeEach(() => {
      jest.clearAllMocks();
      jest.clearAllTimers();

      const ledgerMock = mock<LedgerCanister>();
      ledgerMock.transfer.mockResolvedValue(BigInt(0));
      jest.useFakeTimers().setSystemTime(now);

      jest
        .spyOn(LedgerCanister, "create")
        .mockImplementation((): LedgerCanister => ledgerMock);

      spyTransfer = jest.spyOn(ledgerMock, "transfer");
    });

    it("should call ledger to send ICP", async () => {
      await sendICP({
        identity: mockIdentity,
        to: accountIdentifier,
        amount,
      });

      expect(spyTransfer).toHaveBeenCalledWith({
        to: AccountIdentifier.fromHex(accountIdentifier),
        amount: amount.toE8s(),
        createdAt: nowInBigIntNanoSeconds,
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
      });

      expect(spyTransfer).toHaveBeenCalledWith({
        to: AccountIdentifier.fromHex(accountIdentifier),
        amount: amount.toE8s(),
        fromSubAccount,
        createdAt: nowInBigIntNanoSeconds,
      });
    });

    it("should call ledger to send ICP with memo", async () => {
      const memo = BigInt(444555);
      await sendICP({
        identity: mockIdentity,
        to: accountIdentifier,
        amount,
        memo,
      });

      expect(spyTransfer).toHaveBeenCalledWith({
        to: AccountIdentifier.fromHex(accountIdentifier),
        amount: amount.toE8s(),
        memo,
        createdAt: nowInBigIntNanoSeconds,
      });
    });

    it("should call ledger to send ICP with createdAt", async () => {
      const memo = BigInt(444555);
      const createdAt = BigInt(123456);
      await sendICP({
        identity: mockIdentity,
        to: accountIdentifier,
        amount,
        memo,
        createdAt,
      });

      expect(spyTransfer).toHaveBeenCalledWith({
        to: AccountIdentifier.fromHex(accountIdentifier),
        amount: amount.toE8s(),
        memo,
        createdAt,
      });
    });
  });

  describe("sendIcpIcrc1", () => {
    let spyTransfer;

    const owner = mockIdentity.getPrincipal();
    const amount = TokenAmount.fromE8s({
      amount: BigInt(11_000),
      token: ICPToken,
    });

    const now = Date.now();
    const nowInBigIntNanoSeconds = BigInt(now) * BigInt(1_000_000);

    beforeEach(() => {
      jest.clearAllMocks();
      jest.clearAllTimers();

      const ledgerMock = mock<IcrcLedgerCanister>();
      ledgerMock.transfer.mockResolvedValue(BigInt(0));
      jest.useFakeTimers().setSystemTime(now);

      jest
        .spyOn(IcrcLedgerCanister, "create")
        .mockImplementation((): IcrcLedgerCanister => ledgerMock);

      spyTransfer = jest.spyOn(ledgerMock, "transfer");
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
        created_at_time: nowInBigIntNanoSeconds,
        fee: 10000n,
        from_subaccount: undefined,
        memo: undefined,
      });
    });

    it("should call ledger to send ICP with subaccount Id", async () => {
      const fromSubAccount = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 1,
      ];
      await sendIcpIcrc1({
        identity: mockIdentity,
        to: { owner },
        amount,
        fromSubAccount,
      });

      expect(spyTransfer).toHaveBeenCalledWith({
        to: { owner, subaccount: [] },
        amount: amount.toE8s(),
        from_subaccount: Uint8Array.from(fromSubAccount),
        created_at_time: nowInBigIntNanoSeconds,
        fee: 10000n,
        memo: undefined,
      });
    });

    it("should call ledger to send ICP with memo", async () => {
      const memo = Uint8Array.from([4, 4, 5, 5]);
      await sendIcpIcrc1({
        identity: mockIdentity,
        to: { owner },
        amount,
        memo,
      });

      expect(spyTransfer).toHaveBeenCalledWith({
        to: { owner, subaccount: [] },
        amount: amount.toE8s(),
        memo,
        created_at_time: nowInBigIntNanoSeconds,
        fee: 10000n,
        from_subaccount: undefined,
      });
    });

    it("should call ledger to send ICP with createdAt", async () => {
      const memo = Uint8Array.from([4, 4, 5, 5]);
      const createdAt = BigInt(123456);
      await sendIcpIcrc1({
        identity: mockIdentity,
        to: { owner },
        amount,
        memo,
        createdAt,
      });

      expect(spyTransfer).toHaveBeenCalledWith({
        to: { owner, subaccount: [] },
        amount: amount.toE8s(),
        memo,
        created_at_time: createdAt,
        fee: 10000n,
        from_subaccount: undefined,
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
        memo: undefined,
        created_at_time: nowInBigIntNanoSeconds,
        fee: 10000n,
        from_subaccount: undefined,
      });
    });
  });

  describe("transactionFee", () => {
    const fee = BigInt(10_000);
    const ledgerMock = mock<LedgerCanister>();
    ledgerMock.transactionFee.mockResolvedValue(fee);

    beforeEach(() => {
      jest
        .spyOn(LedgerCanister, "create")
        .mockImplementation((): LedgerCanister => ledgerMock);
    });

    it("gets transaction fee from LedgerCanister", async () => {
      const actualFee = await transactionFee({ identity: mockIdentity });
      expect(actualFee).toEqual(fee);
      expect(ledgerMock.transactionFee).toBeCalled();
    });
  });

  describe("queryAccountBalance", () => {
    const balance = BigInt(10_000_000);
    const ledgerMock = mock<LedgerCanister>();
    ledgerMock.accountBalance.mockResolvedValue(balance);

    beforeEach(() => {
      jest
        .spyOn(LedgerCanister, "create")
        .mockImplementation((): LedgerCanister => ledgerMock);
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
