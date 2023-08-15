import * as agent from "$lib/api/agent.api";
import { getCkBTCTransactions } from "$lib/api/ckbtc-index.api";
import { CKBTC_INDEX_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { mockIdentity, mockPrincipal } from "$tests/mocks/auth.store.mock";
import type { HttpAgent } from "@dfinity/agent";
import { IcrcIndexCanister, type IcrcTransaction } from "@dfinity/ledger";
import { mock } from "jest-mock-extended";

describe("ckbtc-index api", () => {
  const indexCanisterMock = mock<IcrcIndexCanister>();

  beforeAll(() => {
    jest
      .spyOn(IcrcIndexCanister, "create")
      .mockImplementation(() => indexCanisterMock);
  });

  afterAll(() => jest.clearAllMocks());

  beforeEach(() => {
    jest.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  const params = {
    identity: mockIdentity,
    account: {
      owner: mockPrincipal,
    },
    maxResults: BigInt(10),
    indexCanisterId: CKBTC_INDEX_CANISTER_ID,
  };

  const transaction = {
    burn: [],
  } as unknown as IcrcTransaction;

  describe("getCkBTCTransactions", () => {
    it("should returns transactions", async () => {
      const id = BigInt(1);

      const getTransactionsSpy =
        indexCanisterMock.getTransactions.mockResolvedValue({
          transactions: [{ transaction, id }],
          oldest_tx_id: [],
        });

      const results = await getCkBTCTransactions(params);

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

      const call = () => getCkBTCTransactions(params);

      expect(call).rejects.toThrowError();
    });
  });
});
