import { CKBTC_LEDGER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { FETCH_ROOT_KEY, HOST } from "$lib/constants/environment.constants";
import { getIcrcBalance } from "$lib/worker-api/icrc-ledger.worker-api";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { IcrcLedgerCanister } from "@dfinity/ledger";
import { vi } from "vitest";
import mock from "vitest-mock-extended/lib/Mock";

describe("icrc-ledger.worker-api", () => {
  const ledgerCanisterMock = mock<IcrcLedgerCanister>();

  beforeEach(() => {
    vi.clearAllMocks();

    jest
      .spyOn(IcrcLedgerCanister, "create")
      .mockImplementation(() => ledgerCanisterMock);
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
    const balance = BigInt(10_000_000);

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
