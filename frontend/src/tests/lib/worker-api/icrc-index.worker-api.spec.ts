import { CKBTC_INDEX_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { FETCH_ROOT_KEY, HOST } from "$lib/constants/environment.constants";
import { getIcrcTransactions } from "$lib/worker-api/icrc-index.worker-api";
import { mockIdentity, mockPrincipal } from "$tests/mocks/auth.store.mock";
import { IcrcIndexCanister, type IcrcTransaction } from "@dfinity/ledger";
import mock from "jest-mock-extended/lib/Mock";

describe("icrc-index.worker-api", () => {
  const indexCanisterMock = mock<IcrcIndexCanister>();

  beforeEach(() => {
    jest.clearAllMocks();

    jest
      .spyOn(IcrcIndexCanister, "create")
      .mockImplementation(() => indexCanisterMock);
  });

  const params = {
    identity: mockIdentity,
    account: {
      owner: mockPrincipal,
    },
    maxResults: BigInt(10),
    indexCanisterId: CKBTC_INDEX_CANISTER_ID.toText(),
    host: HOST,
    fetchRootKey: FETCH_ROOT_KEY,
  };

  const transaction = {
    burn: [],
  } as unknown as IcrcTransaction;

  it("should returns transactions", async () => {
    const id = BigInt(1);

    const getTransactionsSpy =
      indexCanisterMock.getTransactions.mockResolvedValue({
        transactions: [{ transaction, id }],
        oldest_tx_id: [],
      });

    const results = await getIcrcTransactions(params);

    expect(results.transactions.length).toBeGreaterThan(0);

    const transactionFound = results.transactions.find(
      ({ id: tId }) => tId === id
    );
    expect(transactionFound).not.toBeUndefined();

    expect(getTransactionsSpy).toBeCalled();
  });

  it("should bubble errors", () => {
    indexCanisterMock.getTransactions.mockImplementation(async () => {
      throw new Error();
    });

    const call = () => getIcrcTransactions(params);

    expect(call).rejects.toThrowError();
  });
});
