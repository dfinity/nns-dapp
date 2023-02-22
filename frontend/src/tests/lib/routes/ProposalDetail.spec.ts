/**
 * @jest-environment jsdom
 */

import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import ProposalDetail from "$lib/routes/ProposalDetail.svelte";
import { authStore } from "$lib/stores/auth.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import { page } from "$mocks/$app/stores";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import { mockAuthStoreSubscribe } from "../../mocks/auth.store.mock";
import { mockSnsFullProject } from "../../mocks/sns-projects.mock";
import { snsResponseFor } from "../../mocks/sns-response.mock";

jest.mock("$lib/api/governance.api");

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

  beforeEach(() => {
    snsQueryStore.reset();
    snsQueryStore.setData(
      snsResponseFor({
        principal: mockSnsFullProject.rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
      })
    );
  });

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
