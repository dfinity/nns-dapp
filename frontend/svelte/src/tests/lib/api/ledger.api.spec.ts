import { AccountIdentifier, ICP, LedgerCanister } from "@dfinity/nns";
import { mock } from "jest-mock-extended";
import { sendICP } from "../../../lib/api/ledger.api";
import { mockMainAccount } from "../../mocks/accounts.store.mock";
import { mockIdentity } from "../../mocks/auth.store.mock";

describe("ledger-api", () => {
  let spyTransfer;

  const { identifier: accountIdentifier } = mockMainAccount;
  const amount = ICP.fromE8s(BigInt(11_000));

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
      amount,
    });
  });

  it("should call ledger to send ICP with subaccount Id", async () => {
    await sendICP({
      identity: mockIdentity,
      to: accountIdentifier,
      amount,
      fromSubAccountId: 1,
    });

    expect(spyTransfer).toHaveBeenCalledWith({
      to: AccountIdentifier.fromHex(accountIdentifier),
      amount,
      fromSubAccountId: 1,
    });
  });
});
