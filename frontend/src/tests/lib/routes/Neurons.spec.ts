/**
 * @jest-environment jsdom
 */

import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { projectsStore } from "$lib/derived/projects.derived";
import Neurons from "$lib/routes/Neurons.svelte";
import { authStore } from "$lib/stores/auth.store";
import { page } from "$mocks/$app/stores";
import { waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import { mockAuthStoreSubscribe } from "../../mocks/auth.store.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../../mocks/sns-projects.mock";

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

jest.mock("$lib/services/sns-parameters.services", () => {
  return {
    loadSnsParameters: jest.fn().mockResolvedValue(undefined),
  };
});

describe("Neurons", () => {
  beforeAll(() =>
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe)
  );

  jest
    .spyOn(projectsStore, "subscribe")
    .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));

  beforeEach(() => {
    // Reset to default value
    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Neurons,
    });
  });

  it("should render NnsNeurons by default", () => {
    const { queryByTestId } = render(Neurons);
    expect(queryByTestId("neurons-body")).toBeInTheDocument();
  });

  it("should render project page when a project is selected", async () => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });

    const { queryByTestId } = render(Neurons);

    await waitFor(() =>
      expect(queryByTestId("sns-neurons-body")).toBeInTheDocument()
    );
  });
});
