import { CKBTC_LEDGER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { FETCH_ROOT_KEY, HOST } from "$lib/constants/environment.constants";
import { getIcrcBalance } from "$lib/worker-api/icrc-ledger.worker-api";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import * as dfinityUtils from "@dfinity/utils";
import { mock } from "vitest-mock-extended";

describe("icrc-ledger.worker-api", () => {
  const ledgerCanisterMock = mock<IcrcLedgerCanister>();

  beforeEach(() => {
    vi.spyOn(IcrcLedgerCanister, "create").mockImplementation(
      () => ledgerCanisterMock
    );
    // Prevent HttpAgent.create(), which is called by createAgent, from making a
    // real network request via agent.syncTime().
    vi.spyOn(dfinityUtils, "createAgent").mockReturnValue(undefined);
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

  it("should bubble errors", async () => {
    ledgerCanisterMock.balance.mockImplementation(() =>
      Promise.reject(new Error())
    );

    const call = () => getIcrcBalance(params);

    await expect(call).rejects.toThrowError();
  });
});
