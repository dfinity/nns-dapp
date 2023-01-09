import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { selectableProjects } from "$lib/derived/selectable-projects.derived";
import { committedProjectsStore } from "$lib/stores/projects.store";
import { get } from "svelte/store";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../../mocks/sns-projects.mock";

describe("selectable projects derived stores", () => {
  it("should return Nns per default", () => {
    const store = get(selectableProjects);
    expect(store.length).toEqual(1);
    expect(store[0].summary).toBeUndefined();
    expect(store[0].canisterId).toEqual(OWN_CANISTER_ID.toText());
  });

  describe("with projects", () => {
    beforeAll(() =>
      jest
        .spyOn(committedProjectsStore, "subscribe")
        .mockImplementation(mockProjectSubscribe([mockSnsFullProject]))
    );

    afterAll(jest.clearAllMocks);

    it("should return Nns and another project", () => {
      const store = get(selectableProjects);
      expect(store.length).toEqual(2);
      expect(store[1].summary).not.toBeUndefined();
      expect(store[1].canisterId).toEqual(
        mockSnsFullProject.rootCanisterId.toText()
      );
    });
  });
});
