import * as agent from "$lib/api/agent.api";
import {
  approveTransfer,
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
import type { HttpAgent } from "@dfinity/agent";
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { mock } from "vitest-mock-extended";

describe("icrc-ledger api", () => {
  const ledgerCanisterMock = mock<IcrcLedgerCanister>();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(IcrcLedgerCanister, "create").mockImplementation(
      () => ledgerCanisterMock
    );
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  afterEach(() => vi.clearAllMocks());

  describe("getIcrcMainAccount", () => {
    it("returns main account with balance and project token metadata", async () => {
      const balanceSpy = vi.fn().mockResolvedValue(BigInt(10_000_000));

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
      const metadataSpy = vi.fn().mockResolvedValue(mockQueryTokenResponse);

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
      const transferSpy = vi.fn().mockResolvedValue(undefined);

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

  describe("approveTransfer", () => {
    it("successfully calls approve api", async () => {
      const expectedBlockIndex = BigInt(123456);
      const approveSpy =
        ledgerCanisterMock.approve.mockResolvedValue(expectedBlockIndex);
      const spenderPrincipal = Principal.fromHex("123abc");
      const amount = BigInt(13_000_000);
      const nowMillis = 123456789;
      vi.setSystemTime(nowMillis);

      const actualBlockIndex = await approveTransfer({
        identity: mockIdentity,
        canisterId: CKBTC_LEDGER_CANISTER_ID,
        amount,
        spender: spenderPrincipal,
      });

      expect(actualBlockIndex).toEqual(expectedBlockIndex);
      expect(approveSpy).toBeCalledTimes(1);
      expect(approveSpy).toBeCalledWith({
        amount,
        spender: {
          owner: spenderPrincipal,
          subaccount: [],
        },
        expected_allowance: undefined,
        expires_at: undefined,
        created_at_time: BigInt(nowMillis * 1_000_000),
        fee: undefined,
        from_subaccount: undefined,
      });
    });

    it("successfully passes optional params", async () => {
      const expectedBlockIndex = BigInt(123456);
      const approveSpy =
        ledgerCanisterMock.approve.mockResolvedValue(expectedBlockIndex);
      const spenderPrincipal = Principal.fromHex("123abc");
      const amount = BigInt(13_000_000);
      const expectedAllowance = BigInt(135_000_000);
      const expiresAt = BigInt(123999000000);
      const createdAt = BigInt(123456000000);
      const fee = BigInt(17_000);
      const fromSubaccount = new Uint8Array([1, 9, 3]);

      const actualBlockIndex = await approveTransfer({
        identity: mockIdentity,
        canisterId: CKBTC_LEDGER_CANISTER_ID,
        amount,
        spender: spenderPrincipal,
        expectedAllowance,
        expiresAt,
        createdAt,
        fee,
        fromSubaccount,
      });

      expect(actualBlockIndex).toEqual(expectedBlockIndex);
      expect(approveSpy).toBeCalledTimes(1);
      expect(approveSpy).toBeCalledWith({
        amount,
        spender: {
          owner: spenderPrincipal,
          subaccount: [],
        },
        expected_allowance: expectedAllowance,
        expires_at: expiresAt,
        created_at_time: createdAt,
        fee,
        from_subaccount: fromSubaccount,
      });
    });
  });
});
