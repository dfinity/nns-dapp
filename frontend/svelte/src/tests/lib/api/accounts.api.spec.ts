import { ICP, LedgerCanister } from "@dfinity/nns";
import { mock } from "jest-mock-extended";
import { createSubAccount, loadAccounts } from "../../../lib/api/accounts.api";
import { NNSDappCanister } from "../../../lib/canisters/nns-dapp/nns-dapp.canister";
import type { AccountDetails } from "../../../lib/canisters/nns-dapp/nns-dapp.types";
import {
  mockAccountDetails,
  mockHardwareWalletAccountDetails,
  mockSubAccountDetails,
} from "../../mocks/accounts.store.mock";
import { mockIdentity } from "../../mocks/auth.store.mock";

describe("accounts-api", () => {
  afterAll(() => jest.clearAllMocks());
  it("should call ledger and nnsdapp to get account and balance", async () => {
    // Ledger mock
    const ledgerMock = mock<LedgerCanister>();
    ledgerMock.accountBalance.mockResolvedValue(ICP.fromString("1") as ICP);
    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation((): LedgerCanister => ledgerMock);

    // NNSDapp mock
    const nnsDappMock = mock<NNSDappCanister>();
    nnsDappMock.getAccount.mockResolvedValue(mockAccountDetails);
    jest.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);

    await loadAccounts({ identity: mockIdentity, certified: true });

    expect(ledgerMock.accountBalance).toBeCalled();
    expect(nnsDappMock.getAccount).toBeCalled();
    expect(nnsDappMock.addAccount).toBeCalledTimes(1);
  });

  it("should get balances of subaccounts", async () => {
    // Ledger mock
    const ledgerMock = mock<LedgerCanister>();
    ledgerMock.accountBalance.mockResolvedValue(ICP.fromString("1") as ICP);
    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation((): LedgerCanister => ledgerMock);

    // NNSDapp mock
    const nnsDappMock = mock<NNSDappCanister>();
    const accountDetails: AccountDetails = {
      ...mockAccountDetails,
      sub_accounts: [mockSubAccountDetails],
    };
    nnsDappMock.getAccount.mockResolvedValue(accountDetails);
    jest.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);

    await loadAccounts({ identity: mockIdentity, certified: true });

    // Called once for main, another for the subaccount = 2
    expect(ledgerMock.accountBalance).toBeCalledTimes(2);
  });

  it("should get balances of hardware wallet accounts", async () => {
    // Ledger mock
    const ledgerMock = mock<LedgerCanister>();
    ledgerMock.accountBalance.mockResolvedValue(ICP.fromString("1") as ICP);
    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation((): LedgerCanister => ledgerMock);

    // NNSDapp mock
    const nnsDappMock = mock<NNSDappCanister>();
    const accountDetails: AccountDetails = {
      ...mockAccountDetails,
      hardware_wallet_accounts: [mockHardwareWalletAccountDetails],
    };
    nnsDappMock.getAccount.mockResolvedValue(accountDetails);
    jest.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);

    await loadAccounts({ identity: mockIdentity, certified: true });

    // Called once for main, another for the hardware wallet = 2
    expect(ledgerMock.accountBalance).toBeCalledTimes(2);
  });

  it("should call nnsDappCanister to create subaccount", async () => {
    const nnsDappMock = mock<NNSDappCanister>();
    jest.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);

    await createSubAccount({ name: "test subaccount", identity: mockIdentity });

    expect(nnsDappMock.createSubAccount).toBeCalled();
  });
});
