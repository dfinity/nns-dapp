import { getCkBTCAccount, getCkBTCToken } from "$lib/api/ckbtc-ledger.api";
import { CKBTC_LEDGER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockQueryTokenResponse,
  mockSnsToken,
} from "$tests/mocks/sns-projects.mock";
import { IcrcLedgerCanister } from "@dfinity/ledger";
import mock from "jest-mock-extended/lib/Mock";

describe("ckbtc-ledger api", () => {
  const ledgerCanisterMock = mock<IcrcLedgerCanister>();

  beforeAll(() => {
    jest
      .spyOn(IcrcLedgerCanister, "create")
      .mockImplementation(() => ledgerCanisterMock);
  });

  afterAll(() => jest.clearAllMocks());

  describe("getCkBTCAccount", () => {
    it("returns main account with balance", async () => {
      const balance = BigInt(10_000_000);

      const balanceSpy = ledgerCanisterMock.balance.mockResolvedValue(balance);

      const account = await getCkBTCAccount({
        certified: true,
        identity: mockIdentity,
        canisterId: CKBTC_LEDGER_CANISTER_ID,
        type: "main",
        owner: mockIdentity.getPrincipal(),
      });

      expect(account).not.toBeUndefined();

      expect(account?.balanceE8s).toEqual(balance);

      expect(balanceSpy).toBeCalled();
    });

    it("throws an error if no balance", () => {
      ledgerCanisterMock.balance.mockImplementation(() =>
        Promise.reject(new Error())
      );

      const call = () =>
        getCkBTCAccount({
          certified: true,
          identity: mockIdentity,
          canisterId: CKBTC_LEDGER_CANISTER_ID,
          type: "main",
          owner: mockIdentity.getPrincipal(),
        });

      expect(call).rejects.toThrowError();
    });
  });

  describe("getCkBTCToken", () => {
    it("returns token metadata", async () => {
      const metadataSpy = ledgerCanisterMock.metadata.mockResolvedValue(
        mockQueryTokenResponse
      );

      const token = await getCkBTCToken({
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
        getCkBTCToken({
          certified: true,
          identity: mockIdentity,
          canisterId: CKBTC_LEDGER_CANISTER_ID,
        });

      expect(call).rejects.toThrowError();
    });
  });
});
