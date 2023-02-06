/**
 * @jest-environment jsdom
 */

import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { snsProjectsStore } from "$lib/derived/sns/sns-projects.derived";
import ProposalDetail from "$lib/routes/ProposalDetail.svelte";
import { authStore } from "$lib/stores/auth.store";
import { page } from "$mocks/$app/stores";
import { render } from "@testing-library/svelte";
import { mockAuthStoreSubscribe } from "../../mocks/auth.store.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../../mocks/sns-projects.mock";

describe("ProposalDetail", () => {
  beforeAll(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);

    // Reset to default value
    page.mock({
      data: {
        universe: OWN_CANISTER_ID_TEXT,
      },
      routeId: AppPath.Proposal,
    });
  });

  afterAll(jest.clearAllMocks);

  it("should render NnsProposalDetail by default", () => {
    const { queryByTestId } = render(ProposalDetail, {
      props: {
        proposalIdText: undefined,
      },
    });

    expect(queryByTestId("proposal-details-grid")).toBeInTheDocument();
  });

  describe("SnsProposalDetail", () => {
    beforeAll(() => {
      jest
        .spyOn(snsProjectsStore, "subscribe")
        .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));

      page.mock({
        data: { universe: mockSnsFullProject.rootCanisterId.toText() },
        routeId: AppPath.Proposal,
      });
    });

    it("should render SnsProposalDetail when project provided", () => {
      const { queryByTestId } = render(ProposalDetail, {
        props: {
          proposalIdText: undefined,
        },
      });

      expect(queryByTestId("sns-proposal-details-grid")).toBeInTheDocument();
    });
  });
});
