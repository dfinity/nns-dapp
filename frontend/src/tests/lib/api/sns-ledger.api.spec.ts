import {
  getSnsToken,
  querySnsBalance,
  snsTransfer,
  transactionFee,
} from "$lib/api/sns-ledger.api";
import { mockIdentity, mockPrincipal } from "$tests/mocks/auth.store.mock";
import {
  mockQueryTokenResponse,
  mockSnsToken,
} from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";

vi.mock("$lib/proxy/api.import.proxy");
const mainBalance = 10_000_000n;
const fee = 10_000n;
const transactionFeeSpy = vi.fn().mockResolvedValue(fee);
const transferSpy = vi.fn().mockResolvedValue(10n);

let metadataReturn = mockQueryTokenResponse;
const setMetadataError = () => (metadataReturn = []);
const setMetadataSuccess = () => (metadataReturn = mockQueryTokenResponse);
const metadataSpy = vi
  .fn()
  .mockImplementation(() => Promise.resolve(metadataReturn));

const balanceSpy = vi.fn().mockResolvedValue(mainBalance);

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
  });

  describe("querySnsBalance", () => {
    it("returns balance for of an ICRC account", async () => {
      const account = {
        owner: mockPrincipal,
      };
      const balance = await querySnsBalance({
        certified: true,
        identity: mockIdentity,
        rootCanisterId: rootCanisterIdMock,
        account,
      });

      expect(balance).toBe(mainBalance);
      expect(balanceSpy).toBeCalledTimes(1);
      expect(balanceSpy).toBeCalledWith({
        ...account,
      });
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
        amount: 10_000_000n,
        createdAt: 123_456n,
        fee: 10_000n,
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
