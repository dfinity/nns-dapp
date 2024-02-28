import * as governanceApi from "$lib/api/governance.api";
import * as api from "$lib/api/proposals.api";
import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import SelectUniverseNav from "$lib/components/universe/SelectUniverseNav.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import * as actionableProposalsServices from "$lib/services/actionable-proposals.services";
import * as actionableSnsProposalsServices from "$lib/services/actionable-sns-proposals.services";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { enumValues } from "$lib/utils/enum.utils";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { page } from "$mocks/$app/stores";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { createSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { SelectUniverseDropdownPo } from "$tests/page-objects/SelectUniverseDropdown.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { NeuronInfo, ProposalInfo } from "@dfinity/nns";
import {
  SnsNeuronPermissionType,
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
  SnsSwapLifecycle,
  SnsVote,
  neuronSubaccount,
  type SnsBallot,
  type SnsListProposalsResponse,
  type SnsNeuron,
  type SnsNeuronId,
  type SnsProposalData,
} from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SelectUniverseNav", () => {
  const neuron: NeuronInfo = {
    ...mockNeuron,
    neuronId: 0n,
    recentBallots: [],
  };
  const votableProposal: ProposalInfo = {
    ...mockProposalInfo,

    id: 0n,
  };
  let spyQueryProposals = vi
    .spyOn(api, "queryProposals")
    .mockResolvedValue([votableProposal]);
  let spyQueryNeurons = vi
    .spyOn(governanceApi, "queryNeurons")
    .mockResolvedValue([neuron]);
  const subaccount = neuronSubaccount({
    controller: mockIdentity.getPrincipal(),
    index: 0,
  });
  const snsNeuronId: SnsNeuronId = { id: subaccount };
  const allPermissions = Int32Array.from(enumValues(SnsNeuronPermissionType));
  const snsNeuron: SnsNeuron = {
    ...mockSnsNeuron,
    created_timestamp_seconds: 0n,
    id: [snsNeuronId] as [SnsNeuronId],
    permissions: [
      {
        principal: [mockIdentity.getPrincipal()],
        permission_type: allPermissions,
      },
    ],
  };
  const snsNeuronIdHex = getSnsNeuronIdAsHexString(snsNeuron);
  const votableSnsProposalProps = {
    proposalId: 0n,
    createdAt: 1n,
    status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    rewardStatus: SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
    ballots: [
      [
        snsNeuronIdHex,
        {
          vote: SnsVote.Unspecified,
          cast_timestamp_seconds: 123n,
          voting_power: 10000n,
        },
      ],
    ] as [string, SnsBallot][],
  };
  const votableSnsProposal1: SnsProposalData = createSnsProposal({
    ...votableSnsProposalProps,
    proposalId: 0n,
  });
  const votableSnsProposal2: SnsProposalData = createSnsProposal({
    ...votableSnsProposalProps,
    proposalId: 1n,
  });
  const spyQuerySnsNeurons = vi
    .spyOn(snsGovernanceApi, "querySnsNeurons")
    .mockResolvedValue([snsNeuron]);
  const spyQuerySnsProposals = vi
    .spyOn(snsGovernanceApi, "queryProposals")
    .mockImplementation(
      async ({ rootCanisterId }) =>
        ({
          proposals: [votableSnsProposal1, votableSnsProposal2],
          include_ballots_by_caller: [true],
        }) as SnsListProposalsResponse
    );
  const spyLoadActionableProposals = vi.spyOn(
    actionableProposalsServices,
    "loadActionableProposals"
  );
  const spyLoadActionableSnsProposals = vi.spyOn(
    actionableSnsProposalsServices,
    "loadActionableSnsProposals"
  );
  const renderComponent = () => {
    const { container } = render(SelectUniverseNav);
    return SelectUniverseDropdownPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetSnsProjects();
    neuronsStore.reset();
    actionableNnsProposalsStore.reset();

    spyQueryNeurons.mockClear();
    spyQueryProposals.mockClear();
    spyQuerySnsNeurons.mockClear();
    spyQuerySnsProposals.mockClear();

    spyQueryProposals = vi
      .spyOn(api, "queryProposals")
      .mockResolvedValue([votableProposal]);
    spyQueryNeurons = vi
      .spyOn(governanceApi, "queryNeurons")
      .mockResolvedValue([neuron]);

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

  it("should load Nns neurons and proposals", async () => {
    expect(spyLoadActionableProposals).toHaveBeenCalledTimes(0);
    await renderComponent();
    await runResolvedPromises();
    expect(spyLoadActionableProposals).toHaveBeenCalledTimes(1);
  });

  it("should load actionable Sns proposals", async () => {
    expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(0);
    setSnsProjects([{ lifecycle: SnsSwapLifecycle.Committed }]);
    await renderComponent();
    await runResolvedPromises();
    expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(1);
  });

  it("should load actionable Sns proposals after sns list update", async () => {
    expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(0);
    await renderComponent();
    await runResolvedPromises();
    expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(0);

    setSnsProjects([{ lifecycle: SnsSwapLifecycle.Committed }]);
    await runResolvedPromises();
    expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(1);
  });

  it("should display actionable proposal count", async () => {
    setSnsProjects([{ lifecycle: SnsSwapLifecycle.Committed }]);
    const po = await renderComponent();
    await runResolvedPromises();

    // nns is the current universe
    expect(
      await po.getSelectUniverseCardPo().getActionableProposalCount()
    ).toEqual("1");

    // open project list
    await po.getSelectUniverseCardPo().click();
    expect(await po.getSelectUniverseListPo().isPresent()).toBe(true);
    // nns is the first card
    const cardPos = await po
      .getSelectUniverseListPo()
      .getSelectUniverseCardPos();
    expect(cardPos.length).toEqual(2);
    expect(await cardPos[0].getActionableProposalCount()).toEqual("1");
    expect(await cardPos[1].getActionableProposalCount()).toEqual("2");
  });
});
