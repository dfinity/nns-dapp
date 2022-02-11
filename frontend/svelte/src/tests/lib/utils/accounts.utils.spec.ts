import type { ICP } from "@dfinity/nns";
import { AccountIdentifier, LedgerCanister } from "@dfinity/nns";
import { loadAccounts } from "../../../lib/utils/accounts.utils";
import * as agent from "../../../lib/utils/agent.utils";
import { mockPrincipal } from "../../mocks/auth.store.mock";

// @ts-ignore
class MockLedgerCanister extends LedgerCanister {
  constructor() {
    super();
  }

  create() {
    return this;
  }

  accountBalance = async ({
    accountIdentifier,
    certified = true,
  }: {
    accountIdentifier: AccountIdentifier;
    certified?: boolean;
  }): Promise<ICP> => Promise.resolve(null);
}

describe("accounts-utils", () => {
  beforeAll(() => {
    // Needed to prevent importing Http from @dfinity/agent
    const mockCreateAgent = () => Promise.resolve(undefined);
    jest.spyOn(agent, "createAgent").mockImplementation(mockCreateAgent);
  });
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
