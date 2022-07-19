/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from "@testing-library/svelte";
import SelectProjectDropdown from "../../../../lib/components/neurons/SelectProjectDropdown.svelte";
import { OWN_CANISTER_ID } from "../../../../lib/constants/canister-ids.constants";
import { loadSnsSummaries } from "../../../../lib/services/sns.services";
import { committedProjectsStore } from "../../../../lib/stores/projects.store";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../../../mocks/sns-projects.mock";

jest.mock("../../../../lib/services/sns.services", () => {
  return {
    loadSnsSummaries: jest.fn().mockResolvedValue(undefined),
  };
});

describe("SelectProjectDropdown", () => {
  jest
    .spyOn(committedProjectsStore, "subscribe")
    .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));

  it("should load sns summaries", () => {
    render(SelectProjectDropdown);
    expect(loadSnsSummaries).toHaveBeenCalled();
  });

  it("should render NNS and projects as options", () => {
    const { container } = render(SelectProjectDropdown);

    // NNS + projects store
    expect(container.querySelectorAll("option").length).toBe(2);
  });

  it("should select NNS as default", () => {
    const { container } = render(SelectProjectDropdown);

    expect(container.querySelector("select")?.value).toBe(
      OWN_CANISTER_ID.toText()
    );
  });

  it("can select another project", async () => {
    const { container } = render(SelectProjectDropdown);

    const selectElement = container.querySelector("select");
    selectElement && expect(selectElement.value).toBe(OWN_CANISTER_ID.toText());

    const projectCanisterId = mockSnsFullProject.rootCanisterId.toText();
    selectElement &&
      fireEvent.change(selectElement, {
        target: { value: projectCanisterId },
      });

    selectElement && expect(selectElement.value).toBe(projectCanisterId);
  });
});
