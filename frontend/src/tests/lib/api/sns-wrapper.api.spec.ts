import { wrappers } from "$lib/api/sns-wrapper.api";
import {
  importInitSnsWrapper,
  importSnsWasmCanister,
} from "$lib/proxy/api.import.proxy";
import { mockIdentity } from "../../mocks/auth.store.mock";
import {
  deployedSnsMock,
  governanceCanisterIdMock,
  ledgerCanisterIdMock,
  rootCanisterIdMock,
  swapCanisterIdMock,
} from "../../mocks/sns.api.mock";

jest.mock("$lib/proxy/api.import.proxy");

describe("sns-wrapper api", () => {
  describe("wrappers", () => {
    const listSnsesSpy = jest.fn().mockResolvedValue(deployedSnsMock);
    beforeEach(() => {
      (importSnsWasmCanister as jest.Mock).mockResolvedValue({
        create: () => ({
          listSnses: listSnsesSpy,
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
        })
      );
    });
    it("calls list to all Snses", async () => {
      await wrappers({ identity: mockIdentity, certified: false });

      expect(listSnsesSpy).toHaveBeenCalled();
    });
  });
});
