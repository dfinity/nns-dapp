/**
 * @jest-environment jsdom
 */

import {
  OWN_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import Proposals from "$lib/routes/Proposals.svelte";
import { authStore } from "$lib/stores/auth.store";
import { committedProjectsStore } from "$lib/stores/projects.store";
import { page } from "$mocks/$app/stores";
import { fireEvent, waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import { mockAuthStoreSubscribe } from "../../mocks/auth.store.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../../mocks/sns-projects.mock";

jest.mock("$lib/services/$public/sns.services", () => {
  return {
    loadSnsSummaries: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/services/$public/proposals.services", () => {
  return {
    listProposals: jest.fn().mockResolvedValue(undefined),
  };
});

describe("Proposals", () => {
  beforeAll(() =>
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe)
  );

  jest
    .spyOn(committedProjectsStore, "subscribe")
    .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));

  beforeEach(() => {
    // Reset to default value
    page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
  });

  it("should render NnsProposals by default", () => {
    const { queryByTestId } = render(Proposals);
    expect(queryByTestId("nns-proposal-filters")).toBeInTheDocument();
  });

  it("should render dropdown to select project", () => {
    const { queryByTestId } = render(Proposals);
    expect(queryByTestId("select-project-dropdown")).toBeInTheDocument();
  });

  it("should render project page when a project is selected in the dropdown", async () => {
    const { queryByTestId } = render(Proposals);

    expect(queryByTestId("nns-proposal-filters")).toBeInTheDocument();

    const selectElement = queryByTestId(
      "select-project-dropdown"
    ) as HTMLSelectElement | null;

    const projectCanisterId = mockSnsFullProject.rootCanisterId.toText();
    selectElement &&
      fireEvent.change(selectElement, {
        target: { value: projectCanisterId },
      });

    await waitFor(() =>
      expect(queryByTestId("sns-proposals-page")).toBeInTheDocument()
    );
  });

  it("should be able to go back to nns after going to a project", async () => {
    const { queryByTestId } = render(Proposals);

    expect(queryByTestId("nns-proposal-filters")).toBeInTheDocument();

    const selectElement = queryByTestId(
      "select-project-dropdown"
    ) as HTMLSelectElement | null;

    const projectCanisterId = mockSnsFullProject.rootCanisterId.toText();
    selectElement &&
      fireEvent.change(selectElement, {
        target: { value: projectCanisterId },
      });

    await waitFor(() =>
      expect(queryByTestId("sns-proposals-page")).toBeInTheDocument()
    );

    selectElement &&
      fireEvent.change(selectElement, {
        target: { value: OWN_CANISTER_ID.toText() },
      });
    await waitFor(() =>
      expect(queryByTestId("nns-proposal-filters")).toBeInTheDocument()
    );
  });
});
