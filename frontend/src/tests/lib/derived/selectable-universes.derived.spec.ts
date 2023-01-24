import {
  CKBTC_LEDGER_CANISTER_ID,
  OWN_CANISTER_ID,
} from "$lib/constants/canister-ids.constants";
import { committedProjectsStore } from "$lib/derived/projects.derived";
import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
import { get } from "svelte/store";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../../mocks/sns-projects.mock";

describe("selectable universes derived stores", () => {
  it("should return Nns and ckBTC per default", () => {
    const store = get(selectableUniversesStore);
    expect(store.length).toEqual(2);
    expect(store[0].summary).toBeUndefined();
    expect(store[0].canisterId).toEqual(OWN_CANISTER_ID.toText());
    expect(store[1].summary).toBeUndefined();
    expect(store[1].canisterId).toEqual(CKBTC_LEDGER_CANISTER_ID.toText());
  });

  describe("with projects", () => {
    beforeAll(() =>
      jest
        .spyOn(committedProjectsStore, "subscribe")
        .mockImplementation(mockProjectSubscribe([mockSnsFullProject]))
    );

    afterAll(jest.clearAllMocks);

    it("should return Nns, ckBTC and another project", () => {
      const store = get(selectableUniversesStore);
      expect(store.length).toEqual(3);
      expect(store[2].summary).not.toBeUndefined();
      expect(store[2].canisterId).toEqual(
        mockSnsFullProject.rootCanisterId.toText()
      );
    });
  });
});
