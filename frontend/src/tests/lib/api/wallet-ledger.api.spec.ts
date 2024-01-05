import * as agent from "$lib/api/agent.api";
import { getAccount, getToken } from "$lib/api/wallet-ledger.api";
import { CKBTC_LEDGER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockQueryTokenResponse,
  mockSnsToken,
} from "$tests/mocks/sns-projects.mock";
import type { HttpAgent } from "@dfinity/agent";
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { mock } from "vitest-mock-extended";

describe("wallet-ledger api", () => {
  const ledgerCanisterMock = mock<IcrcLedgerCanister>();

  beforeAll(() => {
    vi.spyOn(IcrcLedgerCanister, "create").mockImplementation(
      () => ledgerCanisterMock
    );
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  describe("getAccount", () => {
    it("returns main account with balance", async () => {
      const balance = 10_000_000n;

      const balanceSpy = ledgerCanisterMock.balance.mockResolvedValue(balance);

      const account = await getAccount({
        certified: true,
        identity: mockIdentity,
        canisterId: CKBTC_LEDGER_CANISTER_ID,
        type: "main",
        owner: mockIdentity.getPrincipal(),
      });

      expect(account).not.toBeUndefined();

      expect(account?.balanceUlps).toEqual(balance);

      expect(balanceSpy).toBeCalled();
    });

    it("throws an error if no balance", () => {
      ledgerCanisterMock.balance.mockImplementation(() =>
        Promise.reject(new Error())
      );

      const call = () =>
        getAccount({
          certified: true,
          identity: mockIdentity,
          canisterId: CKBTC_LEDGER_CANISTER_ID,
          type: "main",
          owner: mockIdentity.getPrincipal(),
        });

      expect(call).rejects.toThrowError();
    });
  });

  describe("getToken", () => {
    it("returns token metadata", async () => {
      const metadataSpy = ledgerCanisterMock.metadata.mockResolvedValue(
        mockQueryTokenResponse
      );

      const token = await getToken({
        certified: true,
        identity: mockIdentity,
        canisterId: CKBTC_LEDGER_CANISTER_ID,
      });

      expect(token).toEqual(mockSnsToken);

      expect(metadataSpy).toBeCalled();
    });

    it("throws an error if no token", () => {
      ledgerCanisterMock.metadata.mockResolvedValue([]);

      const call = () =>
        getToken({
          certified: true,
          identity: mockIdentity,
          canisterId: CKBTC_LEDGER_CANISTER_ID,
        });

      expect(call).rejects.toThrowError();
    });
  });
});
