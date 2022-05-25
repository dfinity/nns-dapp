import { get } from "svelte/store";
import * as api from "../../../lib/api/canisters.api";
import { listCanisters } from "../../../lib/services/canisters.services";
import { canistersStore } from "../../../lib/stores/canisters.store";
import {
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "../../mocks/auth.store.mock";
import { mockCanisters } from "../../mocks/canisters.mock";

describe("canisters-services", () => {
  const spyQueryCanisters = jest
    .spyOn(api, "queryCanisters")
    .mockImplementation(() => Promise.resolve(mockCanisters));

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
