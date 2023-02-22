import {
  ckBTCTransfer,
  getCkBTCAccounts,
  getCkBTCToken,
} from "$lib/api/ckbtc-ledger.api";
import { IcrcLedgerCanister } from "@dfinity/ledger";
import mock from "jest-mock-extended/lib/Mock";
import { CKBTC_LEDGER_CANISTER_ID } from "../../../lib/constants/ckbtc-canister-ids.constants";
import { mockIdentity } from "../../mocks/auth.store.mock";
import {
  mockQueryTokenResponse,
  mockSnsToken,
} from "../../mocks/sns-projects.mock";

describe("ckbtc-ledger api", () => {
  const ledgerCanisterMock = mock<IcrcLedgerCanister>();

  beforeAll(() => {
    jest
      .spyOn(IcrcLedgerCanister, "create")
      .mockImplementation(() => ledgerCanisterMock);
  });

  afterAll(() => jest.clearAllMocks());

  describe("getCkBTCAccounts", () => {
    it("returns main account with balance and token metadata", async () => {
      const metadataSpy = ledgerCanisterMock.metadata.mockResolvedValue(
        mockQueryTokenResponse
      );
      const balanceSpy = ledgerCanisterMock.balance.mockResolvedValue(
        BigInt(10_000_000)
      );

      const accounts = await getCkBTCAccounts({
        certified: true,
        identity: mockIdentity,
        canisterId: CKBTC_LEDGER_CANISTER_ID,
      });

      expect(accounts.length).toBeGreaterThan(0);

      const main = accounts.find(({ type }) => type === "main");
      expect(main).not.toBeUndefined();

      expect(main?.balance.toE8s()).toEqual(BigInt(10_000_000));

      expect(balanceSpy).toBeCalled();
      expect(metadataSpy).toBeCalled();
    });

    it("throws an error if no token", () => {
      ledgerCanisterMock.metadata.mockResolvedValue([]);

      const call = () =>
        getCkBTCAccounts({
          certified: true,
          identity: mockIdentity,
          canisterId: CKBTC_LEDGER_CANISTER_ID,
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

  describe("transfer", () => {
    it("successfully calls transfer api", async () => {
      const transferSpy =
        ledgerCanisterMock.transfer.mockResolvedValue(undefined);

      await ckBTCTransfer({
        identity: mockIdentity,
        to: { owner: mockIdentity.getPrincipal() },
        amount: BigInt(10_000_000),
        createdAt: BigInt(123456),
        fee: BigInt(10_000),
        canisterId: CKBTC_LEDGER_CANISTER_ID,
      });

      expect(transferSpy).toBeCalled();
    });
  });
});
