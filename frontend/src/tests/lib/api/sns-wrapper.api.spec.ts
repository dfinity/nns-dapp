import * as agent from "$lib/api/agent.api";
import { clearWrapperCache, wrappers } from "$lib/api/sns-wrapper.api";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import type { HttpAgent } from "@dfinity/agent";
import type { SnsWrapper } from "@dfinity/sns";
import { mock } from "vitest-mock-extended";

describe("sns-wrapper api", () => {
  beforeEach(() => {
    clearWrapperCache();
    resetSnsProjects();
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  describe("wrappers", () => {
    const canisterIds1 = {
      rootCanisterId: principal(0),
      swapCanisterId: principal(1),
      governanceCanisterId: principal(2),
      ledgerCanisterId: principal(3),
      indexCanisterId: principal(4),
    };
    const canisterIds2 = {
      rootCanisterId: principal(5),
      swapCanisterId: principal(6),
      governanceCanisterId: principal(7),
      ledgerCanisterId: principal(8),
      indexCanisterId: principal(9),
    };

    it("creates SNS wrappers", async () => {
      setSnsProjects([canisterIds1, canisterIds2]);

      const snsWrappers = await wrappers({
        identity: mockIdentity,
        certified: false,
      });

      expect(snsWrappers).toHaveLength(2);
      expect(
        snsWrappers.get(canisterIds1.rootCanisterId.toText()).canisterIds
      ).toEqual(canisterIds1);
      expect(
        snsWrappers.get(canisterIds2.rootCanisterId.toText()).canisterIds
      ).toEqual(canisterIds2);
    });

    it("works if aggregator data is not yet loaded when called", async () => {
      let snsWrappers: Map<string, SnsWrapper> | undefined;
      const promise = wrappers({
        identity: mockIdentity,
        certified: false,
      }).then((result) => {
        snsWrappers = result;
      });

      expect(snsWrappers).toBeUndefined();

      setSnsProjects([canisterIds1, canisterIds2]);
      await promise;

      expect(snsWrappers).toHaveLength(2);
      expect(
        snsWrappers.get(canisterIds1.rootCanisterId.toText()).canisterIds
      ).toEqual(canisterIds1);
      expect(
        snsWrappers.get(canisterIds2.rootCanisterId.toText()).canisterIds
      ).toEqual(canisterIds2);
    });
  });
});
