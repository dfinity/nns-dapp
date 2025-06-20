import { getFavProjects, setFavProjects } from "$lib/api/fav-projects.api";
import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import { mockCreateAgent } from "$tests/mocks/agent.mock";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockFavProject } from "$tests/mocks/icrc-accounts.mock";
import * as dfinityUtils from "@dfinity/utils";
import { mock } from "vitest-mock-extended";

describe("fav-projects-api", () => {
  const mockNNSDappCanister = mock<NNSDappCanister>();

  beforeEach(() => {
    vi.spyOn(NNSDappCanister, "create").mockImplementation(
      (): NNSDappCanister => mockNNSDappCanister
    );
    // Prevent HttpAgent.create(), which is called by createAgent, from making a
    // real network request via agent.syncTime().
    vi.spyOn(dfinityUtils, "createAgent").mockImplementation(mockCreateAgent);
  });

  describe("getFavProjects", () => {
    it("should call the nns dapp canister to get the fav projects", async () => {
      mockNNSDappCanister.getFavProjects.mockResolvedValue({
        fav_projects: [mockFavProject],
      });
      expect(mockNNSDappCanister.getFavProjects).not.toBeCalled();
      const result = await getFavProjects({
        identity: mockIdentity,
        certified: true,
      });

      expect(mockNNSDappCanister.getFavProjects).toBeCalledTimes(1);
      expect(mockNNSDappCanister.getFavProjects).toBeCalledWith({
        certified: true,
      });
      expect(result).toEqual({
        fav_projects: [mockFavProject],
      });
    });
  });

  describe("setFavProjects", () => {
    it("should call the nns dapp canister to set fav projects", async () => {
      expect(mockNNSDappCanister.setFavProjects).not.toBeCalled();
      await setFavProjects({
        identity: mockIdentity,
        favProjects: [mockFavProject],
      });

      expect(mockNNSDappCanister.setFavProjects).toBeCalledTimes(1);
      expect(mockNNSDappCanister.setFavProjects).toBeCalledWith([
        mockFavProject,
      ]);
    });
  });
});
