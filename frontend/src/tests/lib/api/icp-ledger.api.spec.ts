import {
  queryAccountBalance,
  sendICP,
  transactionFee,
} from "$lib/api/icp-ledger.api";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { AccountIdentifier, LedgerCanister } from "@dfinity/nns";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { mock } from "jest-mock-extended";

describe("icp-ledger.api", () => {
  describe("sendICP", () => {
    let spyTransfer;

    const { identifier: accountIdentifier } = mockMainAccount;
    const amount = TokenAmount.fromE8s({
      amount: BigInt(11_000),
      token: ICPToken,
    });

    const now = Date.now();
    const nowInBigIntNanoSeconds = BigInt(now) * BigInt(1_000_000);
    beforeAll(() => {
      const ledgerMock = mock<LedgerCanister>();
      ledgerMock.transfer.mockResolvedValue(BigInt(0));
      jest.useFakeTimers().setSystemTime(now);

      jest
        .spyOn(LedgerCanister, "create")
        .mockImplementation((): LedgerCanister => ledgerMock);

      spyTransfer = jest.spyOn(ledgerMock, "transfer");
    });

    afterAll(() => {
      jest.clearAllMocks();
      jest.clearAllTimers();
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
