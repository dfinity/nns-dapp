import {
  getSnsAccounts,
  getSnsToken,
  snsTransfer,
  transactionFee,
} from "$lib/api/sns-ledger.api";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockQueryTokenResponse,
  mockSnsToken,
} from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { vi } from "vitest";

vi.mock("$lib/proxy/api.import.proxy");
const mainBalance = BigInt(10_000_000);
const fee = BigInt(10_000);
const transactionFeeSpy = vi.fn().mockResolvedValue(fee);
const transferSpy = vi.fn().mockResolvedValue(BigInt(10));

let metadataReturn = mockQueryTokenResponse;
const setMetadataError = () => (metadataReturn = []);
const setMetadataSuccess = () => (metadataReturn = mockQueryTokenResponse);
const metadataSpy = vi
  .fn()
  .mockImplementation(() => Promise.resolve(metadataReturn));

let balanceReturn = Promise.resolve(mainBalance);
const setBalanceError = () => (balanceReturn = Promise.reject(new Error()));
const setBalanceSuccess = () => (balanceReturn = Promise.resolve(mainBalance));
const balanceSpy = vi.fn().mockImplementation(() => balanceReturn);

vi.mock("$lib/api/sns-wrapper.api", () => {
  return {
    wrapper: () => ({
      balance: balanceSpy,
      ledgerMetadata: metadataSpy,
      transactionFee: transactionFeeSpy,
      transfer: transferSpy,
    }),
  };
});

describe("sns-ledger api", () => {
  beforeEach(() => {
    setMetadataSuccess();
    setBalanceSuccess();
  });

  describe("getSnsAccounts", () => {
    beforeEach(() => {
      setMetadataSuccess();
    });

    it("returns main account with balance and project token metadata", async () => {
      setBalanceSuccess();

      const accounts = await getSnsAccounts({
        certified: true,
        identity: mockIdentity,
        rootCanisterId: rootCanisterIdMock,
      });

      expect(accounts.length).toBeGreaterThan(0);

      const main = accounts.find(({ type }) => type === "main");
      expect(main).not.toBeUndefined();

      expect(main?.balanceE8s).toEqual(mainBalance);

      expect(balanceSpy).toBeCalled();
    });

    it("throws an error if no balance", () => {
      setBalanceError();

      const call = () =>
        getSnsAccounts({
          certified: true,
          identity: mockIdentity,
          rootCanisterId: rootCanisterIdMock,
        });

      expect(call).rejects.toThrowError();
    });
  });

  describe("transactionFee", () => {
    it("returns transaction fee for an sns project", async () => {
      const actualFee = await transactionFee({
        certified: true,
        identity: mockIdentity,
        rootCanisterId: rootCanisterIdMock,
      });

      expect(actualFee).toBe(fee);
      expect(transactionFeeSpy).toBeCalled();
    });
  });

  describe("transfer", () => {
    it("successfully calls transfer api", async () => {
      await snsTransfer({
        identity: mockIdentity,
        rootCanisterId: rootCanisterIdMock,
        to: { owner: mockIdentity.getPrincipal() },
        amount: BigInt(10_000_000),
        createdAt: BigInt(123456),
        fee: BigInt(10_000),
      });

      expect(transferSpy).toBeCalled();
    });
  });

  describe("getSnsToken", () => {
    beforeEach(() => {
      setMetadataSuccess();
    });

    it("returns project token metadata", async () => {
      const token = await getSnsToken({
        certified: true,
        identity: mockIdentity,
        rootCanisterId: rootCanisterIdMock,
      });

      expect(token).toEqual(mockSnsToken);

      expect(metadataSpy).toBeCalled();
    });

    it("throws an error if no token metadata", () => {
      setMetadataError();
      const call = () =>
        getSnsToken({
          certified: true,
          identity: mockIdentity,
          rootCanisterId: rootCanisterIdMock,
        });

      expect(call).rejects.toThrowError();
    });
  });
});
