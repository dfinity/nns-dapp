import NnsProposalProposerActionsEntry from "$lib/components/proposal-detail/NnsProposalProposerActionsEntry.svelte";
import { jsonRepresentationStore } from "$lib/stores/json-representation.store";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { ProposalProposerActionsEntryPo } from "$tests/page-objects/ProposalProposerActionsEntry.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { Proposal } from "@icp-sdk/canisters/nns";
import { render } from "@testing-library/svelte";

const proposalWithMotionAction = {
  ...mockProposalInfo.proposal,
  selfDescribingAction: {
    typeName: "Motion",
    typeDescription: "A motion proposal",
    value: {
      Map: [["motion_text", { Text: "Test motion" }]],
    },
  },
} as Proposal;

const proposalWithRewardNodeProviderAction = {
  ...mockProposalInfo.proposal,
  selfDescribingAction: {
    typeName: "RewardNodeProvider",
    typeDescription: undefined,
    value: {
      Map: [
        [
          "node_provider",
          {
            Map: [["id", { Text: "aaaaa-aa" }]],
          },
        ],
        ["amount_e8s", { Nat: 10_000_000n }],
        [
          "reward_mode",
          {
            Map: [
              [
                "RewardToNeuron",
                {
                  Map: [["dissolve_delay_seconds", { Nat: 1_000n }]],
                },
              ],
            ],
          },
        ],
      ],
    },
  },
} as Proposal;

const proposalWithNullValue = {
  ...mockProposalInfo.proposal,
  selfDescribingAction: {
    typeName: "Motion",
    typeDescription: undefined,
    value: {
      Map: [["motion_text", { Null: null }]],
    },
  },
} as Proposal;

const proposalWithNnsFunctionAction = {
  ...mockProposalInfo.proposal,
  selfDescribingAction: {
    typeName: "ExecuteNnsFunction",
    typeDescription: undefined,
    value: {
      Map: [["nns_function_id", { Nat: 21n }]],
    },
  },
} as Proposal;

describe("NnsProposalProposerActionsEntry", () => {
  const renderComponent = (props) => {
    const { container } = render(NnsProposalProposerActionsEntry, {
      props,
    });

    return ProposalProposerActionsEntryPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => jsonRepresentationStore.setMode("raw"));

  it("should render 'Payload' as the section title", async () => {
    const po = renderComponent({
      proposal: proposalWithMotionAction,
    });

    expect(await po.getActionTitle()).toEqual("Payload");
  });

  it("should render action fields from selfDescribingAction value", async () => {
    const po = renderComponent({
      proposal: proposalWithMotionAction,
    });

    expect(await po.getJsonPreviewPo().getRawText()).toMatch("motion_text");
    expect(await po.getJsonPreviewPo().getRawText()).toMatch("Test motion");
  });

  it("should render action data as JSON", async () => {
    jsonRepresentationStore.setMode("raw");
    const po = renderComponent({
      proposal: proposalWithRewardNodeProviderAction,
    });

    expect(await po.getJsonPreviewPo().getRawObject()).toEqual({
      node_provider: {
        id: "aaaaa-aa",
      },
      amount_e8s: "10000000",
      reward_mode: {
        RewardToNeuron: {
          dissolve_delay_seconds: "1000",
        },
      },
    });
  });

  it("should render action data as JSON tree", async () => {
    jsonRepresentationStore.setMode("tree");
    const po = renderComponent({
      proposal: proposalWithRewardNodeProviderAction,
    });

    await po.getJsonPreviewPo().clickExpand();

    expect(await po.getJsonPreviewPo().getTreeText()).toEqual(
      `amount_e8s 10000000 node_provider id "aaaaa-aa" reward_mode  RewardToNeuron dissolve_delay_seconds 1000`
    );
  });

  it("should render null fields as 'null'", async () => {
    const po = renderComponent({
      proposal: proposalWithNullValue,
    });

    expect(await po.getJsonPreviewPo().getRawText()).toContain("null");
  });

  it("should render nnsFunction id", async () => {
    const po = renderComponent({
      proposal: proposalWithNnsFunctionAction,
    });

    expect(await po.getJsonPreviewPo().getRawText()).toContain(
      "nns_function_id"
    );
    expect(await po.getJsonPreviewPo().getRawText()).toContain("21");
  });
});
