import { initSns, wrappers } from "$lib/api/sns-wrapper.api";
import type { HttpAgent } from "@dfinity/agent";
import mock from "jest-mock-extended/lib/Mock";
import { mockIdentity } from "../../mocks/auth.store.mock";
import {
  deployedSnsMock,
  governanceCanisterIdMock,
  ledgerCanisterIdMock,
  rootCanisterIdMock,
  swapCanisterIdMock,
} from "../../mocks/sns.api.mock";

const listSnsesSpy = jest.fn().mockResolvedValue(deployedSnsMock);
const initSnsWrapperSpy = jest.fn().mockResolvedValue(
  Promise.resolve({
    canisterIds: {
      rootCanisterId: rootCanisterIdMock,
      ledgerCanisterId: ledgerCanisterIdMock,
      governanceCanisterId: governanceCanisterIdMock,
      swapCanisterId: swapCanisterIdMock,
    },
  })
);

jest.mock("$lib/proxy/api.import.proxy", () => {
  return {
    importSnsWasmCanister: jest.fn().mockImplementation(() => ({
      create: () => ({
        listSnses: listSnsesSpy,
      }),
    })),
    importInitSnsWrapper: jest.fn().mockImplementation(() => initSnsWrapperSpy),
  };
});

describe("sns-wrapper api", () => {
  describe("wrappers", () => {
    it("calls list to all Snses", async () => {
      await wrappers({ identity: mockIdentity, certified: false });

      expect(listSnsesSpy).toHaveBeenCalled();
    });
  });

  describe("initSns", () => {
    it("inits sns wrapper", async () => {
      const mockAgent = mock<HttpAgent>();
      await initSns({
        agent: mockAgent,
        rootCanisterId: rootCanisterIdMock,
        certified: false,
      });

      expect(initSnsWrapperSpy).toHaveBeenCalled();
    });
  });
});
