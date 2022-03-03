import { NNSDappCanister } from "../../../lib/canisters/nns-dapp/nns-dapp.canister";
import { listCanisters } from "../../../lib/services/canisters.services";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { MockNNSDappCanister } from "../../mocks/canisters.store.mock";

describe("canisters-services", () => {
  const mockNNSDappCanister: MockNNSDappCanister = new MockNNSDappCanister();

  let spyListCanisters;

  beforeEach(() => {
    jest
      .spyOn(NNSDappCanister, "create")
      .mockImplementation((): NNSDappCanister => mockNNSDappCanister);

    spyListCanisters = jest.spyOn(mockNNSDappCanister, "getCanisters");
  });

  afterEach(() => spyListCanisters.mockClear());

  it("should call the canister to list the canisters 🤪", async () => {
    await listCanisters({ identity: mockIdentity });

    expect(spyListCanisters).toHaveReturnedTimes(1);
  });
});
