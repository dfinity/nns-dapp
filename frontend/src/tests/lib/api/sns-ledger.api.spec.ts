import { snsTransfer } from "$lib/api/sns-ledger.api";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";

vi.mock("$lib/proxy/api.import.proxy");
const mainBalance = 10_000_000n;
const fee = 10_000n;
const transactionFeeSpy = vi.fn().mockResolvedValue(fee);
const transferSpy = vi.fn().mockResolvedValue(10n);

const balanceSpy = vi.fn().mockResolvedValue(mainBalance);

vi.mock("$lib/api/sns-wrapper.api", () => {
  return {
    wrapper: () => ({
      balance: balanceSpy,
      transactionFee: transactionFeeSpy,
      transfer: transferSpy,
    }),
  };
});

describe("sns-ledger api", () => {
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
});
