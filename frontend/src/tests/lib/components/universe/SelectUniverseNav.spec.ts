import SelectUniverseNav from "$lib/components/universe/SelectUniverseNav.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import { page } from "$mocks/$app/stores";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { mockSnsFullProject } from "$tests/mocks/sns-projects.mock";
import { createSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { SelectUniverseDropdownPo } from "$tests/page-objects/SelectUniverseDropdown.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { ProposalInfo } from "@dfinity/nns";
import {
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
  SnsSwapLifecycle,
  type SnsProposalData,
} from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SelectUniverseNav", () => {
  const renderComponent = () => {
    const { container } = render(SelectUniverseNav);
    return SelectUniverseDropdownPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetSnsProjects();
    actionableNnsProposalsStore.reset();
    actionableSnsProposalsStore.resetForTesting();

    resetIdentity();
    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Proposals,
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("should render select universe component", async () => {
    const po = await renderComponent();
    expect(await po.getSelectUniverseCardPo().isPresent()).toEqual(true);
  });

  it("should display actionable proposal count", async () => {
    const votableProposal: ProposalInfo = {
      ...mockProposalInfo,
      id: 0n,
    };
    const votableSnsProposalProps = {
      createdAt: 1n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
      rewardStatus: SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
    };
    const votableSnsProposal1: SnsProposalData = createSnsProposal({
      ...votableSnsProposalProps,
      proposalId: 0n,
    });
    const votableSnsProposal2: SnsProposalData = createSnsProposal({
      ...votableSnsProposalProps,
      proposalId: 1n,
    });

    actionableNnsProposalsStore.setProposals([
      {
        ...votableProposal,
      },
    ]);
    actionableSnsProposalsStore.set({
      rootCanisterId: mockSnsFullProject.rootCanisterId,
      proposals: [votableSnsProposal1, votableSnsProposal2],
    });

    setSnsProjects([{ lifecycle: SnsSwapLifecycle.Committed }]);
    const po = await renderComponent();
    await runResolvedPromises();

    // nns is the current universe
    expect(
      (await po.getSelectUniverseCardPo().getActionableProposalCount()).trim()
    ).toEqual("1");

    // open project list
    await po.getSelectUniverseCardPo().click();
    expect(await po.getSelectUniverseListPo().isPresent()).toBe(true);
    // "All proposals" is the first card
    const cardPos = await po
      .getSelectUniverseListPo()
      .getSelectUniverseCardPos();
    expect(cardPos.length).toEqual(3);
    // nns is the second card
    expect(await cardPos[1].getName()).toEqual("Internet Computer");
    expect((await cardPos[1].getActionableProposalCount()).trim()).toEqual("1");
    expect(await cardPos[2].getName()).toEqual("Catalyze");
    expect((await cardPos[2].getActionableProposalCount()).trim()).toEqual("2");
  });
});
