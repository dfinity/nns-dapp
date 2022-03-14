import * as api from "../../../lib/api/canisters.api";
import * as en from "../../../lib/i18n/en.json";
import { listCanisters } from "../../../lib/services/canisters.services";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockCanisters } from "../../mocks/canisters.mock";

describe("canisters-services", () => {
  const spyQueryCanisters = jest
    .spyOn(api, "queryCanisters")
    .mockImplementation(() => Promise.resolve(mockCanisters));

  it("should list canisters", async () => {
    await listCanisters({ identity: mockIdentity });

    expect(spyQueryCanisters).toHaveBeenCalled();
  });

  it("should not list canisters if no identity", async () => {
    const call = async () => await listCanisters({ identity: null });

    await expect(call).rejects.toThrow(Error(en.error.missing_identity));
  });
});
