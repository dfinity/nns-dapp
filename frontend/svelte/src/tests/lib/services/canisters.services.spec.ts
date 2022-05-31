import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import * as api from "../../../lib/api/canisters.api";
import { E8S_PER_ICP } from "../../../lib/constants/icp.constants";
import { syncAccounts } from "../../../lib/services/accounts.services";
import {
  attachCanister,
  createCanister,
  getCanisterDetails,
  getIcpToCyclesExchangeRate,
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

jest.mock("../../../lib/services/accounts.services", () => {
  return {
    syncAccounts: jest.fn().mockResolvedValue(undefined),
  };
});

describe("canisters-services", () => {
  const spyQueryCanisters = jest
    .spyOn(api, "queryCanisters")
    .mockImplementation(() => Promise.resolve(mockCanisters));

  const spyAttachCanister = jest
    .spyOn(api, "attachCanister")
    .mockImplementation(() => Promise.resolve(undefined));

  const spyCreateCanister = jest
    .spyOn(api, "createCanister")
    .mockImplementation(() => Promise.resolve(mockCanisterDetails.id));

  const spyQueryCanisterDetails = jest
    .spyOn(api, "queryCanisterDetails")
    .mockImplementation(() => Promise.resolve(mockCanisterDetails));

  const spyGetExchangeRate = jest
    .spyOn(api, "getIcpToCyclesExchangeRate")
    .mockImplementation(() => Promise.resolve(BigInt(10_000 * E8S_PER_ICP)));

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
    it("should fetch canister details", async () => {
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

  describe("getIcpToCyclesExchangeRate", () => {
    afterEach(() => jest.clearAllMocks());

    it("should call api to get conversion rate", async () => {
      const response = await getIcpToCyclesExchangeRate();
      expect(response).toBe(BigInt(10_000));
      expect(spyGetExchangeRate).toBeCalled();
    });

    it("should return undefined if no identity", async () => {
      setNoIdentity();

      const response = await getIcpToCyclesExchangeRate();
      expect(response).toBeUndefined();
      expect(spyGetExchangeRate).not.toBeCalled();

      resetIdentity();
    });
  });

  describe("createCanister", () => {
    afterEach(() => jest.clearAllMocks());

    it("should call api to create a canister", async () => {
      const { success } = await createCanister({ amount: 3 });
      expect(success).toBe(true);
      expect(spyCreateCanister).toBeCalled();
      expect(spyQueryCanisters).toBeCalled();
      expect(syncAccounts).toBeCalled();
    });

    it("should return undefined if no identity", async () => {
      setNoIdentity();

      const { success } = await createCanister({ amount: 3 });
      expect(success).toBe(false);
      expect(spyCreateCanister).not.toBeCalled();

      resetIdentity();
    });
  });
});
