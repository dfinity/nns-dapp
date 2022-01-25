import { AccountIdentifier, LedgerCanister } from "@dfinity/nns";
import type { ICP } from "@dfinity/nns";
import { loadAccounts } from "../../../lib/utils/accounts.utils";
import { mockPrincipal } from "../../mocks/auth.store.mock";

// @ts-ignore
class MockLedgerCanister extends LedgerCanister {
  constructor() {
    super();
  }

  create() {
    return this;
  }

  accountBalance = async (
    accountIdentifier: AccountIdentifier,
    certified = true
  ): Promise<ICP> => Promise.resolve(null);
}

describe("accounts-utils", () => {
  const mockLedgerCanister: MockLedgerCanister = new MockLedgerCanister();

  it("should call ledger to get the account balance", async () => {
    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation((): LedgerCanister => mockLedgerCanister);

    const spy = jest.spyOn(mockLedgerCanister, "accountBalance");

    await loadAccounts({ principal: mockPrincipal });

    expect(spy).toHaveReturnedTimes(1);
  });
});
