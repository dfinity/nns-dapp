import * as agent from "$lib/api/agent.api";
import {
  approveTransfer,
  executeIcrcTransfer,
  icrcTransfer,
  queryIcrcBalance,
  queryIcrcToken,
} from "$lib/api/icrc-ledger.api";
import { CKBTC_LEDGER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockQueryTokenResponse,
  mockSnsToken,
  principal,
} from "$tests/mocks/sns-projects.mock";
import { AnonymousIdentity, type HttpAgent } from "@dfinity/agent";
import { IcrcLedgerCanister, type IcrcAccount } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { mock } from "vitest-mock-extended";

describe("icrc-ledger api", () => {
  const ledgerCanisterMock = mock<IcrcLedgerCanister>();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.spyOn(IcrcLedgerCanister, "create").mockImplementation(
      () => ledgerCanisterMock
    );
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("execute transfer", () => {
    it("successfully calls transfer api", async () => {
      const transferSpy = vi.fn().mockResolvedValue(undefined);

      await executeIcrcTransfer({
        to: { owner: mockIdentity.getPrincipal() },
        amount: 10_000_000n,
        createdAt: 123_456n,
        fee: 10_000n,
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
        amount: 10_000_000n,
        createdAt: 123_456n,
        fee: 10_000n,
        canisterId: CKBTC_LEDGER_CANISTER_ID,
      });

      expect(transferSpy).toBeCalled();
    });
  });

  describe("approveTransfer", () => {
    it("successfully calls approve api", async () => {
      const expectedBlockIndex = 123_456n;
      const approveSpy =
        ledgerCanisterMock.approve.mockResolvedValue(expectedBlockIndex);
      const spenderPrincipal = Principal.fromHex("123abc");
      const amount = 13_000_000n;
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
      const expectedBlockIndex = 123_456n;
      const approveSpy =
        ledgerCanisterMock.approve.mockResolvedValue(expectedBlockIndex);
      const spenderPrincipal = Principal.fromHex("123abc");
      const amount = 13_000_000n;
      const expectedAllowance = 135_000_000n;
      const expiresAt = 123_999_000_000n;
      const createdAt = 123_456_000_000n;
      const fee = 17_000n;
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

  describe("queryIcrcToken", () => {
    it("successfully calls metadata endpoint and transforms response", async () => {
      ledgerCanisterMock.metadata.mockResolvedValue(mockQueryTokenResponse);

      const metadata = await queryIcrcToken({
        certified: true,
        identity: new AnonymousIdentity(),
        canisterId: principal(0),
      });

      expect(metadata).toEqual(mockSnsToken);
      expect(ledgerCanisterMock.metadata).toBeCalledTimes(1);
      expect(ledgerCanisterMock.metadata).toBeCalledWith({
        certified: true,
      });
    });
  });

  describe("queryIcrcBalance", () => {
    it("successfully calls balance endpoint", async () => {
      const balanceE8s = 314_000_000n;
      ledgerCanisterMock.balance.mockResolvedValue(balanceE8s);

      const account: IcrcAccount = {
        owner: mockIdentity.getPrincipal(),
      };

      const balance = await queryIcrcBalance({
        certified: true,
        identity: new AnonymousIdentity(),
        canisterId: principal(0),
        account,
      });

      expect(balance).toEqual(balanceE8s);
      expect(ledgerCanisterMock.balance).toBeCalledTimes(1);
      expect(ledgerCanisterMock.balance).toBeCalledWith({
        certified: true,
        ...account,
      });
    });
  });
});
