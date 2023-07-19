/**
 * @jest-environment jsdom
 */

import {
  OWN_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import {
  snsProjectsCommittedStore,
  snsProjectsStore,
} from "$lib/derived/sns/sns-projects.derived";
import Proposals from "$lib/routes/Proposals.svelte";
import { authStore } from "$lib/stores/auth.store";
import { page } from "$mocks/$app/stores";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "$tests/mocks/sns-projects.mock";
import { waitFor } from "@testing-library/dom";
import { fireEvent, render } from "@testing-library/svelte";

jest.mock("$lib/services/$public/sns.services", () => {
  return {
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

jest.mock("$lib/api/governance.api");

describe("Proposals", () => {
  beforeAll(() =>
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe)
  );

  jest
    .spyOn(snsProjectsCommittedStore, "subscribe")
    .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));

  beforeEach(() => {
    // Reset to default value
    page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
  });

  it("should render NnsProposals by default", () => {
    const { queryByTestId } = render(Proposals);
    expect(queryByTestId("filter-wrapper-component")).toBeInTheDocument();
  });

  describe("sns", () => {
    beforeAll(() => {
      jest
        .spyOn(snsProjectsStore, "subscribe")
        .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));
    });

    it("should render project page when a project is selected", async () => {
      page.mock({
        data: { universe: mockSnsFullProject.rootCanisterId.toText() },
        routeId: AppPath.Proposals,
      });

      const { queryByTestId } = render(Proposals);

      expect(queryByTestId("filter-wrapper-component")).toBeInTheDocument();

      const selectElement = queryByTestId(
        "select-project-dropdown"
      ) as HTMLSelectElement | null;

      const projectCanisterId = mockSnsFullProject.rootCanisterId.toText();
      selectElement &&
        fireEvent.change(selectElement, {
          target: { value: projectCanisterId },
        });

      await waitFor(() =>
        expect(queryByTestId("filter-wrapper-component")).toBeInTheDocument()
      );
    });

    it("should be able to go back to nns after going to a project", async () => {
      const { queryByTestId } = render(Proposals);

      expect(queryByTestId("filter-wrapper-component")).toBeInTheDocument();

      const selectElement = queryByTestId(
        "select-project-dropdown"
      ) as HTMLSelectElement | null;

      const projectCanisterId = mockSnsFullProject.rootCanisterId.toText();
      selectElement &&
        fireEvent.change(selectElement, {
          target: { value: projectCanisterId },
        });

      await waitFor(() =>
        expect(queryByTestId("filter-wrapper-component")).toBeInTheDocument()
      );

      selectElement &&
        fireEvent.change(selectElement, {
          target: { value: OWN_CANISTER_ID.toText() },
        });
      await waitFor(() =>
        expect(queryByTestId("filter-wrapper-component")).toBeInTheDocument()
      );
    });
  });
});
