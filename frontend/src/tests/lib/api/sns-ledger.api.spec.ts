import {
  getSnsAccounts,
  transactionFee,
} from "../../../lib/api/sns-ledger.api";
import {
  importInitSnsWrapper,
  importSnsWasmCanister,
} from "../../../lib/proxy/api.import.proxy";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockQueryTokenResponse } from "../../mocks/sns-projects.mock";
import {
  deployedSnsMock,
  governanceCanisterIdMock,
  ledgerCanisterIdMock,
  rootCanisterIdMock,
  swapCanisterIdMock,
} from "../../mocks/sns.api.mock";

jest.mock("../../../lib/proxy/api.import.proxy");

describe("sns-ledger api", () => {
  const mainBalance = BigInt(10_000_000);
  const balanceSpy = jest.fn().mockResolvedValue(mainBalance);
  const metadataSpy = jest.fn().mockResolvedValue(mockQueryTokenResponse);
  const fee = BigInt(10_000);
  const transactionFeeSpy = jest.fn().mockResolvedValue(fee);

  beforeEach(() => {
    (importSnsWasmCanister as jest.Mock).mockResolvedValue({
      create: () => ({
        listSnses: () => Promise.resolve(deployedSnsMock),
      }),
    });

    (importInitSnsWrapper as jest.Mock).mockResolvedValue(() =>
      Promise.resolve({
        canisterIds: {
          rootCanisterId: rootCanisterIdMock,
          ledgerCanisterId: ledgerCanisterIdMock,
          governanceCanisterId: governanceCanisterIdMock,
          swapCanisterId: swapCanisterIdMock,
        },
        balance: balanceSpy,
        ledgerMetadata: metadataSpy,
        transactionFee: transactionFeeSpy,
      })
    );
  });
  describe("getSnsAccounts", () => {
    it("returns main account with balance and project token metadata", async () => {
      const accounts = await getSnsAccounts({
        certified: true,
        identity: mockIdentity,
        rootCanisterId: rootCanisterIdMock,
      });

      expect(accounts.length).toBeGreaterThan(0);

      const main = accounts.find(({ type }) => type === "main");
      expect(main).not.toBeUndefined();

      expect(main?.balance.toE8s()).toEqual(mainBalance);

      expect(balanceSpy).toBeCalled();
      expect(metadataSpy).toBeCalled();
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
});
