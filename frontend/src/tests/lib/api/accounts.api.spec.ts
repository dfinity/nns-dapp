import {
  createSubAccount,
  getTransactions,
  renameSubAccount,
} from "$lib/api/accounts.api";
import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import type { GetTransactionsResponse } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockSubAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockSentToSubAccountTransaction } from "$tests/mocks/transaction.mock";
import { mock } from "jest-mock-extended";

describe("accounts-api", () => {
  afterAll(() => jest.clearAllMocks());

  it("should call nnsDappCanister to create subaccount", async () => {
    const nnsDappMock = mock<NNSDappCanister>();
    jest.spyOn(NNSDappCanister, "create").mockReturnValue(nnsDappMock);

    await createSubAccount({ name: "test subaccount", identity: mockIdentity });

    expect(nnsDappMock.createSubAccount).toBeCalled();
  });

  it("should call nnsDappCanister to rename subaccount", async () => {
    const nnsDappMock = mock<NNSDappCanister>();
    jest.spyOn(NNSDappCanister, "create").mockReturnValue(nnsDappMock);

    await renameSubAccount({
      newName: "test subaccount",
      subAccountIdentifier: mockSubAccount.identifier,
      identity: mockIdentity,
    });

    expect(nnsDappMock.renameSubAccount).toBeCalled();
  });

  it("should call ledger and nnsdapp to get account and balance", async () => {
    // NNSDapp mock
    const mockResponse: GetTransactionsResponse = {
      total: 1,
      transactions: [mockSentToSubAccountTransaction],
    };
    const nnsDappMock = mock<NNSDappCanister>();
    nnsDappMock.getTransactions.mockResolvedValue(mockResponse);
    jest.spyOn(NNSDappCanister, "create").mockReturnValue(nnsDappMock);

    const response = await getTransactions({
      identity: mockIdentity,
      certified: true,
      accountIdentifier: "",
      pageSize: 1,
      offset: 0,
    });

    expect(nnsDappMock.getTransactions).toBeCalled();
    expect(nnsDappMock.getTransactions).toBeCalledTimes(1);
    expect(response).toEqual([mockSentToSubAccountTransaction]);
  });
});
