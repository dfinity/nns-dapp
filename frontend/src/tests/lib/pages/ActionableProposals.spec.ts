import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import ActionableProposals from "$lib/pages/ActionableProposals.svelte";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { page } from "$mocks/$app/stores";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { ActionableProposalsPo } from "$tests/page-objects/ActionableProposals.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { resetSnsProjects } from "$tests/utils/sns.test-utils";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { ProposalInfo } from "@dfinity/nns";

describe("ActionableProposals", () => {
  const renderComponent = async () => {
    const { container } = render(ActionableProposals);
    await runResolvedPromises();
    return ActionableProposalsPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    resetIdentity();
    resetSnsProjects();
    actionableNnsProposalsStore.reset();

    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Proposals,
    });
  });

  describe("Actionable Nns proposals", () => {
    const nnsProposal1: ProposalInfo = { ...mockProposalInfo, id: 11n };
    const nnsProposal2: ProposalInfo = { ...mockProposalInfo, id: 22n };

    it("should render actionable Nns proposals", async () => {
      const po = await renderComponent();

      expect(await po.hasActionableNnsProposals()).toEqual(false);

      actionableNnsProposalsStore.setProposals([nnsProposal1, nnsProposal2]);
      await runResolvedPromises();
      expect(await po.hasActionableNnsProposals()).toEqual(true);

      expect(
        await po
          .getActionableNnsProposalsPo()
          .getUniverseWithActionableProposalsPo()
          .getTitle()
      ).toEqual("Internet Computer");

      const proposalCardPos = await po
        .getActionableNnsProposalsPo()
        .getProposalCardPos();
      expect(proposalCardPos.length).toEqual(2);
      expect(await proposalCardPos[0].getProposalId()).toEqual("ID: 11");
      expect(await proposalCardPos[1].getProposalId()).toEqual("ID: 22");
    });
  });
});
