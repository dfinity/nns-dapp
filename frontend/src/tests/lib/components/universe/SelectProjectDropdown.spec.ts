/**
 * @jest-environment jsdom
 */
import SelectProjectDropdown from "$lib/components/universe/SelectProjectDropdown.svelte";
import {
  OWN_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import { committedProjectsStore } from "$lib/derived/projects.derived";
import { snsProjectIdSelectedStore } from "$lib/derived/selected-project.derived";
import { page } from "$mocks/$app/stores";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import en from "../../../mocks/i18n.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../../../mocks/sns-projects.mock";

jest.mock("$lib/services/$public/sns.services", () => {
  return {
    loadSnsSummaries: jest.fn().mockResolvedValue(undefined),
  };
});

describe("SelectProjectDropdown", () => {
  jest
    .spyOn(committedProjectsStore, "subscribe")
    .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));

  beforeEach(() => {
    // Dropdown changes context only in the Neurons page for now.
    page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
  });

  it("should render NNS and projects as options", () => {
    const { container } = render(SelectProjectDropdown);

    // NNS + projects store
    expect(container.querySelectorAll("option").length).toBe(2);
  });

  it("should render NNS and project name", () => {
    const { container } = render(SelectProjectDropdown);

    expect(
      (
        (container.querySelector("option:first-of-type") as HTMLElement)
          .textContent ?? ""
      ).trim()
    ).toBe(en.core.nns);
    expect(
      (
        (container.querySelector("option:last-of-type") as HTMLElement)
          .textContent ?? ""
      ).trim()
    ).toBe(mockSnsFullProject.summary.metadata.name);
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

  it("changes in dropdown are propagated to the snsProjectIdSelectedStore", async () => {
    const { container } = render(SelectProjectDropdown);

    const $store1 = get(snsProjectIdSelectedStore);
    expect($store1.toText()).toEqual(OWN_CANISTER_ID.toText());

    const selectElement = container.querySelector("select");
    const projectCanisterId = mockSnsFullProject.rootCanisterId.toText();
    selectElement &&
      fireEvent.change(selectElement, {
        target: { value: projectCanisterId },
      });

    await waitFor(() => {
      const $store2 = get(snsProjectIdSelectedStore);
      return expect($store2.toText()).toEqual(projectCanisterId);
    });
  });
});
