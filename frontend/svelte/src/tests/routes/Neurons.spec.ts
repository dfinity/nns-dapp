/**
 * @jest-environment jsdom
 */

import { fireEvent, waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import { OWN_CANISTER_ID } from "../../lib/constants/canister-ids.constants";
import {
  committedProjectsStore,
  snsProjectSelectedStore,
} from "../../lib/stores/projects.store";
import Neurons from "../../routes/Neurons.svelte";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../mocks/sns-projects.mock";

jest.mock("../../lib/services/sns.services", () => {
  return {
    loadSnsSummaries: jest.fn().mockResolvedValue(undefined),
  };
});

describe("Neurons", () => {
  jest
    .spyOn(committedProjectsStore, "subscribe")
    .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));

  beforeEach(() => {
    // Reset to default value
    snsProjectSelectedStore.set(OWN_CANISTER_ID);
  });

  it("should render NnsNeurons by default", () => {
    const { queryByTestId } = render(Neurons);
    expect(queryByTestId("neurons-body")).toBeInTheDocument();
  });

  it("should render dropdown to select project", () => {
    const { queryByTestId } = render(Neurons);
    expect(queryByTestId("select-project-dropdown")).toBeInTheDocument();
  });

  it("should render project page when a project is selected in the dropdown", async () => {
    const { queryByTestId } = render(Neurons);

    expect(queryByTestId("neurons-body")).toBeInTheDocument();

    const selectElement = queryByTestId(
      "select-project-dropdown"
    ) as HTMLSelectElement | null;

    const projectCanisterId = mockSnsFullProject.rootCanisterId.toText();
    selectElement &&
      fireEvent.change(selectElement, {
        target: { value: projectCanisterId },
      });

    await waitFor(() =>
      expect(queryByTestId("sns-neurons-body")).toBeInTheDocument()
    );
  });

  it("should be able to go back to nns after going to a project", async () => {
    const { queryByTestId } = render(Neurons);

    expect(queryByTestId("neurons-body")).toBeInTheDocument();

    const selectElement = queryByTestId(
      "select-project-dropdown"
    ) as HTMLSelectElement | null;

    const projectCanisterId = mockSnsFullProject.rootCanisterId.toText();
    selectElement &&
      fireEvent.change(selectElement, {
        target: { value: projectCanisterId },
      });

    await waitFor(() =>
      expect(queryByTestId("sns-neurons-body")).toBeInTheDocument()
    );

    selectElement &&
      fireEvent.change(selectElement, {
        target: { value: OWN_CANISTER_ID.toText() },
      });
    await waitFor(() =>
      expect(queryByTestId("neurons-body")).toBeInTheDocument()
    );
  });
});
