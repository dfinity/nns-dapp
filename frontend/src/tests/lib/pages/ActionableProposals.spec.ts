import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import ActionableProposals from "$lib/pages/ActionableProposals.svelte";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { page } from "$mocks/$app/stores";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { ActionableProposalsPo } from "$tests/page-objects/ActionableProposals.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";

describe("ActionableProposals", () => {
  const nnsProposal1 = {
    ...mockProposalInfo,
    id: 0n,
  };
  const nnsProposal2 = {
    ...mockProposalInfo,
    id: 1n,
  };
  const renderComponent = () => {
    const { container } = render(ActionableProposals);
    return ActionableProposalsPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    page.reset();
    overrideFeatureFlagsStore.setFlag("ENABLE_ACTIONABLE_TAB", true);
  });

  it('should display Nns actionable proposals on "Actionable Proposals" page', async () => {
    resetIdentity();
    page.mock({
      data: {
        universe: OWN_CANISTER_ID_TEXT,
        routeId: AppPath.Proposals,
        actionable: true,
      },
    });
    actionableNnsProposalsStore.setProposals([nnsProposal1, nnsProposal2]);

    const po = renderComponent();
    expect(await po.isPresent()).toBe(true);
    const universeWithActionableProposalsPos =
      await po.getUniverseWithActionableProposalsPos();
    expect(universeWithActionableProposalsPos.length).toEqual(1);
    expect(await universeWithActionableProposalsPos[0].getTitle()).toEqual(
      "Internet Computer"
    );
    const nnsCardPos =
      await universeWithActionableProposalsPos[0].getProposalCardPos();
    expect(nnsCardPos.length).toEqual(2);
    expect(await nnsCardPos[0].getProposalId()).toEqual("ID: 0");
    expect(await nnsCardPos[1].getProposalId()).toEqual("ID: 1");
  });
});
