import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import Proposals from "$lib/routes/Proposals.svelte";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { page } from "$mocks/$app/stores";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "$tests/mocks/sns-projects.mock";
import { ProposalsPo } from "$tests/page-objects/Proposals.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";

vi.mock("$lib/services/$public/proposals.services", () => {
  return {
    listProposals: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/services/$public/sns-proposals.services", () => {
  return {
    loadSnsProposals: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/api/governance.api");

describe("Proposals", () => {
  vi.spyOn(snsProjectsCommittedStore, "subscribe").mockImplementation(
    mockProjectSubscribe([mockSnsFullProject])
  );

  beforeEach(() => {
    // Reset to default value
    page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
  });

  it("should render NnsProposals by default", () => {
    const { queryByTestId } = render(Proposals);
    expect(queryByTestId("nns-proposal-list-component")).toBeInTheDocument();
  });

  describe("with ENABLE_ACTIONABLE_TAB", () => {
    const renderComponent = () => {
      const { container } = render(Proposals);
      return ProposalsPo.under(new JestPageObjectElement(container));
    };

    beforeEach(() => {
      page.reset();
      overrideFeatureFlagsStore.setFlag("ENABLE_ACTIONABLE_TAB", true);
    });

    it('should display actionable proposals when "actionable" in URL', async () => {
      resetIdentity();
      page.mock({
        data: {
          universe: OWN_CANISTER_ID_TEXT,
          routeId: AppPath.Proposals,
          actionable: true,
        },
      });

      const po = renderComponent();
      expect(await po.getActionableProposalsPo().isPresent()).toBe(true);
    });

    it('should no display actionable proposals when not "actionable" in URL', async () => {
      resetIdentity();
      page.mock({
        data: {
          universe: OWN_CANISTER_ID_TEXT,
          routeId: AppPath.Proposals,
        },
      });

      const po = renderComponent();
      expect(await po.getActionableProposalsPo().isPresent()).toBe(false);
    });
  });
});
