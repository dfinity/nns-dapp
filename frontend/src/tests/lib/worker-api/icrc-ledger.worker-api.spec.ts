import { CKBTC_LEDGER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { FETCH_ROOT_KEY, HOST } from "$lib/constants/environment.constants";
import { getIcrcBalance } from "$lib/worker-api/icrc-ledger.worker-api";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
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

describe("icrc-ledger.worker-api", () => {
  const ledgerCanisterMock = mock<IcrcLedgerCanister>();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(IcrcLedgerCanister, "create").mockImplementation(
      () => ledgerCanisterMock
    );
  });

  const params = {
    certified: true,
    identity: mockIdentity,
    ledgerCanisterId: CKBTC_LEDGER_CANISTER_ID.toText(),
    account: {
      owner: mockIdentity.getPrincipal(),
    },
    host: HOST,
    fetchRootKey: FETCH_ROOT_KEY,
  };

  it("should return balance", async () => {
    const balance = 10_000_000n;

    const balanceSpy = ledgerCanisterMock.balance.mockResolvedValue(balance);

    const balanceE8s = await getIcrcBalance(params);

    expect(balanceE8s).toEqual(balance);

    expect(balanceSpy).toBeCalled();
  });

  it("should bubble errors", () => {
    ledgerCanisterMock.balance.mockImplementation(() =>
      Promise.reject(new Error())
    );

    const call = () => getIcrcBalance(params);

    expect(call).rejects.toThrowError();
  });
});
