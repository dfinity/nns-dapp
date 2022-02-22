import { LedgerCanister } from "@dfinity/nns";
import { mock } from "jest-mock-extended";
import { NNSDappCanister } from "../../../lib/canisters/nns-dapp/nns-dapp.canister";
import {
  createSubAccount,
  syncAccounts,
} from "../../../lib/services/accounts.services";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { MockLedgerCanister } from "../../mocks/ledger.canister.mock";

describe("accounts-services", () => {
  const mockLedgerCanister: MockLedgerCanister = new MockLedgerCanister();

  it("should call ledger to get the account balance", async () => {
    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation((): LedgerCanister => mockLedgerCanister);

    const spy = jest.spyOn(mockLedgerCanister, "accountBalance");

    await syncAccounts({ identity: mockIdentity });

    expect(spy).toHaveReturnedTimes(1);
  });

  it("should call nnsDappCanister to create subaccount", async () => {
    const nnsDappMock = mock<NNSDappCanister>();
    jest.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);

    await createSubAccount("test subaccount");

    expect(nnsDappMock.createSubAccount).toHaveBeenCalled();
  });
});
