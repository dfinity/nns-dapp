import { get } from "svelte/store";
import * as api from "../../../lib/api/canisters.api";
import {
  attachCanister,
  listCanisters,
} from "../../../lib/services/canisters.services";
import { canistersStore } from "../../../lib/stores/canisters.store";
import {
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "../../mocks/auth.store.mock";
import { mockCanisterDetails, mockCanisters } from "../../mocks/canisters.mock";

describe("canisters-services", () => {
  const spyQueryCanisters = jest
    .spyOn(api, "queryCanisters")
    .mockImplementation(() => Promise.resolve(mockCanisters));

  const spyAttachCanister = jest
    .spyOn(api, "attachCanister")
    .mockImplementation(() => Promise.resolve(undefined));

  describe("listCanisters", () => {
    afterEach(() => {
      jest.clearAllMocks();
      canistersStore.setCanisters({ canisters: [], certified: true });
    });

    it("should list canisters", async () => {
      await listCanisters({});

      expect(spyQueryCanisters).toHaveBeenCalled();

      const store = get(canistersStore);
      expect(store.canisters).toEqual(mockCanisters);
    });

    it("should not list canisters if no identity", async () => {
      setNoIdentity();

      const call = async () => await listCanisters({});

      await expect(call).rejects.toThrow(Error(mockIdentityErrorMsg));

      resetIdentity();
    });
  });

  describe("attachCanister", () => {
    afterEach(() => {
      jest.clearAllMocks();
      canistersStore.setCanisters({ canisters: [], certified: true });
    });

    it("should call api to attach canister and list canisters again", async () => {
      const response = await attachCanister(mockCanisterDetails.id);
      expect(response.success).toBe(true);
      expect(spyAttachCanister).toBeCalled();
      expect(spyQueryCanisters).toBeCalled();

      const store = get(canistersStore);
      expect(store.canisters).toEqual(mockCanisters);
    });

    it("should not attach canister if no identity", async () => {
      setNoIdentity();

      const response = await attachCanister(mockCanisterDetails.id);
      expect(response.success).toBe(false);
      expect(spyAttachCanister).not.toBeCalled();
      expect(spyQueryCanisters).not.toBeCalled();

      resetIdentity();
    });
  });
});
