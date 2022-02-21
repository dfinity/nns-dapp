import { LedgerCanister } from "@dfinity/nns";
import { syncAccounts } from "../../../lib/services/accounts.services";
import * as agent from "../../../lib/utils/agent.utils";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { MockLedgerCanister } from "../../mocks/ledger.canister.mock";

describe("accounts-services", () => {
  beforeAll(() => {
    // Needed to prevent importing Http from @dfinity/agent
    const mockCreateAgent = () => undefined;
    jest.spyOn(agent, "createAgent").mockImplementation(mockCreateAgent);
  });
  const mockLedgerCanister: MockLedgerCanister = new MockLedgerCanister();

  it("should call ledger to get the account balance", async () => {
    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation((): LedgerCanister => mockLedgerCanister);

    const spy = jest.spyOn(mockLedgerCanister, "accountBalance");

    await syncAccounts({ identity: mockIdentity });

    expect(spy).toHaveReturnedTimes(1);
  });
});
