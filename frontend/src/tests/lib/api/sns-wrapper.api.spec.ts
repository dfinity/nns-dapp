import {
  buildAndStoreWrapper,
  clearWrapperCache,
  initSns,
  wrappers,
} from "$lib/api/sns-wrapper.api";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import {
  deployedSnsMock,
  governanceCanisterIdMock,
  indexCanisterIdMock,
  ledgerCanisterIdMock,
  rootCanisterIdMock,
  swapCanisterIdMock,
} from "$tests/mocks/sns.api.mock";
import type { HttpAgent } from "@dfinity/agent";
import { mock } from "vitest-mock-extended";

const listSnsesSpy = vi.fn().mockResolvedValue(deployedSnsMock);
const initSnsWrapperSpy = vi.fn().mockResolvedValue(
  Promise.resolve({
    canisterIds: {
      rootCanisterId: rootCanisterIdMock,
      ledgerCanisterId: ledgerCanisterIdMock,
      governanceCanisterId: governanceCanisterIdMock,
      swapCanisterId: swapCanisterIdMock,
    },
  })
);

vi.mock("$lib/proxy/api.import.proxy", () => {
  return {
    importSnsWasmCanister: vi.fn().mockImplementation(() => ({
      create: () => ({
        listSnses: listSnsesSpy,
      }),
    })),
    importInitSnsWrapper: vi.fn().mockImplementation(() => initSnsWrapperSpy),
  };
});

describe("sns-wrapper api", () => {
  beforeEach(() => {
    clearWrapperCache();
    vi.clearAllMocks();
  });

  describe("wrappers", () => {
    it("calls list to all Snses", async () => {
      await wrappers({ identity: mockIdentity, certified: false });

      expect(listSnsesSpy).toHaveBeenCalled();
    });

    it("caches wrappers", async () => {
      await wrappers({ identity: mockIdentity, certified: false });
      expect(listSnsesSpy).toHaveBeenCalledTimes(1);

      await wrappers({ identity: mockIdentity, certified: false });
      expect(listSnsesSpy).toHaveBeenCalledTimes(1);
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

  describe("buildAndStoreWrapper", () => {
    const canisterIds = {
      rootCanisterId: rootCanisterIdMock,
      governanceCanisterId: governanceCanisterIdMock,
      ledgerCanisterId: ledgerCanisterIdMock,
      swapCanisterId: swapCanisterIdMock,
      indexCanisterId: indexCanisterIdMock,
    };

    it("should build and cache certified wrapper", async () => {
      const identity = mockIdentity;
      const certified = true;
      await buildAndStoreWrapper({
        identity,
        certified,
        canisterIds,
      });

      expect(wrappers({ identity, certified })).resolves.not.toBeUndefined();
    });

    it("should build and cache uncertified wrapper", async () => {
      const identity = mockIdentity;
      const certified = false;
      await buildAndStoreWrapper({
        identity,
        certified,
        canisterIds,
      });

      expect(wrappers({ identity, certified })).resolves.not.toBeUndefined();
    });

    it("should not trigger listSnses when wrapper is cached", async () => {
      const identity = mockIdentity;
      const certified = false;
      await buildAndStoreWrapper({
        identity,
        certified,
        canisterIds,
      });

      await wrappers({ identity, certified });
      await wrappers({ identity, certified });

      expect(listSnsesSpy).not.toBeCalled();
    });
  });
});
