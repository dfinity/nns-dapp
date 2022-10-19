/**
 * @jest-environment jsdom
 */

import {OWN_CANISTER_ID, OWN_CANISTER_ID_TEXT} from "$lib/constants/canister-ids.constants";
import { AppPathLegacy } from "$lib/constants/routes.constants";
import Neurons from "$lib/routes/Neurons.svelte";
import { committedProjectsStore } from "$lib/stores/projects.store";
import { fireEvent, waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../../../mocks/sns-projects.mock";
import {authStore} from "$lib/stores/auth.store";
import {mockAuthStoreSubscribe} from "../../../mocks/auth.store.mock";
import {page} from "$mocks/$app/stores";

jest.mock("$lib/services/sns.services", () => {
  return {
    loadSnsSummaries: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/services/sns-neurons.services", () => {
  return {
    loadSnsNeurons: jest.fn().mockResolvedValue(undefined),
  };
});

describe("Neurons", () => {
  // TODO(GIX-1071): should render sign-in if not logged in

  beforeAll(() =>
      jest
          .spyOn(authStore, "subscribe")
          .mockImplementation(mockAuthStoreSubscribe));

  jest
    .spyOn(committedProjectsStore, "subscribe")
    .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));

  beforeEach(() => {
    // Reset to default value
    page.mock({ universe: OWN_CANISTER_ID_TEXT });
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
