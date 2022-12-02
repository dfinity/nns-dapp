/**
 * @jest-environment jsdom
 */

import {
  OWN_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import Neurons from "$lib/routes/Neurons.svelte";
import { authStore } from "$lib/stores/auth.store";
import { committedProjectsStore } from "$lib/stores/projects.store";
import { page } from "$mocks/$app/stores";
import { fireEvent, waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import {
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "../../mocks/auth.store.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../../mocks/sns-projects.mock";

jest.mock("$lib/services/$public/sns.services", () => {
  return {
    loadSnsSummaries: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/services/sns-neurons.services", () => {
  return {
    syncSnsNeurons: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/services/sns-accounts.services", () => {
  return {
    syncSnsAccounts: jest.fn().mockReturnValue(undefined),
  };
});

describe("Neurons", () => {
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

  it("should render a principal as text", () => {
    const { getByText } = render(Neurons);

    expect(
      getByText(mockPrincipal.toText(), { exact: false })
    ).toBeInTheDocument();
  });
});
