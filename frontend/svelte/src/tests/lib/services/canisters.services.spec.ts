import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import * as api from "../../../lib/api/canisters.api";
import {
  attachCanister,
  getCanisterDetails,
  listCanisters,
  routePathCanisterId,
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

  const spyQueryCanisterDetails = jest
    .spyOn(api, "queryCanisterDetails")
    .mockImplementation(() => Promise.resolve(mockCanisterDetails));

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
    });
  });

  describe("routePathCanisterId", () => {
    it("should return principal if valid in the url", () => {
      const path = "/#/canister/tqtu6-byaaa-aaaaa-aaana-cai";

      expect(routePathCanisterId(path)).toBeInstanceOf(Principal);
    });

    it("should return undefined if not valid in the url", () => {
      const path = "/#/canister/not-valid-principal";

      expect(routePathCanisterId(path)).toBeUndefined();
    });

    it("should return undefined if no last detail in the path", () => {
      const path = "/#/canister";

      expect(routePathCanisterId(path)).toBeUndefined();
    });
  });

  describe("getCanisterDetails", () => {
    it("should fetch canister deetails and load them in the store", async () => {
      const canister = await getCanisterDetails(mockCanisterDetails.id);

      expect(spyQueryCanisterDetails).toBeCalled();
      expect(canister).toEqual(mockCanisterDetails);
    });

    it("should not fetch canister details if no identity", async () => {
      setNoIdentity();

      const call = () => getCanisterDetails(mockCanisterDetails.id);

      await expect(call).rejects.toThrow(Error(mockIdentityErrorMsg));

      resetIdentity();
    });
  });
});
