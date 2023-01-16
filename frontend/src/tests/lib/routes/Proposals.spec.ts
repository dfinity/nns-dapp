/**
 * @jest-environment jsdom
 */

import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { committedProjectsStore } from "$lib/derived/projects.store";
import Proposals from "$lib/routes/Proposals.svelte";
import { authStore } from "$lib/stores/auth.store";
import { page } from "$mocks/$app/stores";
import { waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import { mockAuthStoreSubscribe } from "../../mocks/auth.store.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../../mocks/sns-projects.mock";

jest.mock("$lib/services/$public/sns.services", () => {
  return {
    loadSnsSummaries: jest.fn().mockResolvedValue(undefined),
    loadSnsNervousSystemFunctions: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/services/$public/proposals.services", () => {
  return {
    listProposals: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/services/$public/sns-proposals.services", () => {
  return {
    loadSnsProposals: jest.fn().mockResolvedValue(undefined),
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

  it("should render project page when a project is selected", async () => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });

    const { queryByTestId } = render(Proposals);

    await waitFor(() =>
      expect(queryByTestId("sns-proposals-page")).toBeInTheDocument()
    );
  });
});
