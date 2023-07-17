import {
  executeIcrcTransfer,
  getIcrcAccount,
  getIcrcToken,
  icrcTransfer,
} from "$lib/api/icrc-ledger.api";
import { CKBTC_LEDGER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockQueryTokenResponse,
  mockSnsToken,
} from "$tests/mocks/sns-projects.mock";
import { IcrcLedgerCanister } from "@dfinity/ledger";
import mock from "jest-mock-extended/lib/Mock";

describe("icrc-ledger api", () => {
  const ledgerCanisterMock = mock<IcrcLedgerCanister>();

  beforeEach(() => {
    jest
      .spyOn(IcrcLedgerCanister, "create")
      .mockImplementation(() => ledgerCanisterMock);
  });

  afterEach(() => jest.clearAllMocks());

  describe("getIcrcMainAccount", () => {
    it("returns main account with balance and project token metadata", async () => {
      const balanceSpy = jest.fn().mockResolvedValue(BigInt(10_000_000));

      const account = await getIcrcAccount({
        certified: true,
        owner: mockIdentity.getPrincipal(),
        type: "main",
        getBalance: balanceSpy,
      });

      expect(account).not.toBeUndefined();

      expect(account.balanceE8s).toEqual(BigInt(10_000_000));

      expect(account.principal.toText()).toEqual(
        mockIdentity.getPrincipal().toText()
      );
      expect(account.type).toEqual("main");

      expect(balanceSpy).toBeCalled();
    });

    it("throws an error if no balance", () => {
      const balanceSpy = async () => {
        throw new Error();
      };

      const call = () =>
        getIcrcAccount({
          certified: true,
          owner: mockIdentity.getPrincipal(),
          type: "main",
          getBalance: balanceSpy,
        });

      expect(call).rejects.toThrowError();
    });
  });

  describe("getIcrcToken", () => {
    it("returns token metadata", async () => {
      const metadataSpy = jest.fn().mockResolvedValue(mockQueryTokenResponse);

      const token = await getIcrcToken({
        certified: true,
        getMetadata: metadataSpy,
      });

      expect(token).toEqual(mockSnsToken);

      expect(metadataSpy).toBeCalled();
    });

    it("throws an error if no token", () => {
      const metadataSpy = async () => {
        throw new Error();
      };

      const call = () =>
        getIcrcToken({
          certified: true,
          getMetadata: metadataSpy,
        });

      expect(call).rejects.toThrowError();
    });
  });

  describe("execute transfer", () => {
    it("successfully calls transfer api", async () => {
      const transferSpy = jest.fn().mockResolvedValue(undefined);

      await executeIcrcTransfer({
        to: { owner: mockIdentity.getPrincipal() },
        amount: BigInt(10_000_000),
        createdAt: BigInt(123456),
        fee: BigInt(10_000),
        transfer: transferSpy,
      });

      expect(transferSpy).toBeCalled();
    });
  });

  describe("transfer", () => {
    it("successfully calls transfer api", async () => {
      const transferSpy =
        ledgerCanisterMock.transfer.mockResolvedValue(undefined);

      await icrcTransfer({
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
