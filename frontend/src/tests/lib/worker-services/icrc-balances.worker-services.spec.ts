import { HOST } from "$lib/constants/environment.constants";
import { getIcrcAccountsBalances } from "$lib/worker-services/icrc-balances.worker-services";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "$tests/mocks/sns-accounts.mock";
import { ledgerCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { mock } from "vitest-mock-extended";

// Mock createAgent to avoid console errors caused by the time-syncing fetch call in agent-js.
vi.mock("@dfinity/utils", async () => {
  return {
    ...(await vi.importActual<any>("@dfinity/utils")),
    __esModule: true,
    createAgent: vi.fn(),
  };
});

describe("balances.worker-services", () => {
  const ledgerCanisterMock = mock<IcrcLedgerCanister>();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(IcrcLedgerCanister, "create").mockImplementation(
      () => ledgerCanisterMock
    );
  });

  const accountIdentifiers = [
    mockSnsMainAccount.identifier,
    mockSnsSubAccount.identifier,
  ];

  const params = {
    identity: mockIdentity,
    data: {
      accountIdentifiers,
      ledgerCanisterId: ledgerCanisterIdMock.toText(),
      host: HOST,
      fetchRootKey: false,
    },
    certified: true,
  };

  it("should return balances for accounts", async () => {
    const balance = 10_000_000n;

    const balanceSpy = ledgerCanisterMock.balance.mockResolvedValue(balance);

    const results = await getIcrcAccountsBalances(params);

    expect(balanceSpy).toHaveBeenCalledTimes(accountIdentifiers.length);
    expect(results).toEqual(
      accountIdentifiers.map((key) => ({
        key,
        balance,
        certified: true,
      }))
    );
  });

  it("should bubbles call errors", async () => {
    ledgerCanisterMock.balance.mockImplementation(async () => {
      throw new Error();
    });

    const call = () => getIcrcAccountsBalances(params);

    expect(call).rejects.toThrowError();
  });
});
