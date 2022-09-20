import { AccountIdentifier, LedgerCanister, TokenAmount } from "@dfinity/nns";
import { mock } from "jest-mock-extended";
import { sendICP, transactionFee } from "../../../lib/api/ledger.api";
import { mockMainAccount } from "../../mocks/accounts.store.mock";
import { mockIdentity } from "../../mocks/auth.store.mock";

describe("ledger-api", () => {
  describe("sendICP", () => {
    let spyTransfer;

    const { identifier: accountIdentifier } = mockMainAccount;
    const amount = TokenAmount.fromE8s({ amount: BigInt(11_000) });

    beforeAll(() => {
      const ledgerMock = mock<LedgerCanister>();
      ledgerMock.transfer.mockResolvedValue(BigInt(0));

      jest
        .spyOn(LedgerCanister, "create")
        .mockImplementation((): LedgerCanister => ledgerMock);

      spyTransfer = jest.spyOn(ledgerMock, "transfer");
    });

    afterAll(() => jest.clearAllMocks());

    it("should call ledger to send ICP", async () => {
      await sendICP({
        identity: mockIdentity,
        to: accountIdentifier,
        amount,
      });

      expect(spyTransfer).toHaveBeenCalledWith({
        to: AccountIdentifier.fromHex(accountIdentifier),
        amount: amount.toE8s(),
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
});
