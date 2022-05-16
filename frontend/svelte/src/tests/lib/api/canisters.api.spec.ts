import { mock } from "jest-mock-extended";
import { queryCanisters } from "../../../lib/api/canisters.api";
import { NNSDappCanister } from "../../../lib/canisters/nns-dapp/nns-dapp.canister";
import { mockIdentity } from "../../mocks/auth.store.mock";

describe("canisters-api", () => {
  const mockNNSDappCanister = mock<NNSDappCanister>();

  let spyGetCanisters;

  beforeEach(() => {
    jest
      .spyOn(NNSDappCanister, "create")
      .mockImplementation((): NNSDappCanister => mockNNSDappCanister);

    spyGetCanisters = jest
      .spyOn(mockNNSDappCanister, "getCanisters")
      .mockResolvedValue([]);
  });

  afterEach(() => spyGetCanisters.mockClear());

  it("should call the canister to list the canisters 🤪", async () => {
    await queryCanisters({ identity: mockIdentity, certified: true });

    expect(spyGetCanisters).toHaveReturnedTimes(1);
  });
});
