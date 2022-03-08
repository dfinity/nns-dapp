import { mock } from "jest-mock-extended";
import { NNSDappCanister } from "../../../lib/canisters/nns-dapp/nns-dapp.canister";
import { listCanisters } from "../../../lib/services/canisters.services";
import { mockIdentity } from "../../mocks/auth.store.mock";

describe("canisters-services", () => {
  const mockNNSDappCanister = mock<NNSDappCanister>();

  let spyListCanisters;

  beforeEach(() => {
    jest
      .spyOn(NNSDappCanister, "create")
      .mockImplementation((): NNSDappCanister => mockNNSDappCanister);

    spyListCanisters = jest
      .spyOn(mockNNSDappCanister, "getCanisters")
      .mockResolvedValue([]);
  });

  afterEach(() => spyListCanisters.mockClear());

  it("should call the canister to list the canisters 🤪", async () => {
    await listCanisters({ identity: mockIdentity });

    expect(spyListCanisters).toHaveReturnedTimes(1);
  });
});
