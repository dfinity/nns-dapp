import NnsProposalProposerActionsEntry from "$lib/components/proposal-detail/NnsProposalProposerActionsEntry.svelte";
import { jsonRepresentationStore } from "$lib/stores/json-representation.store";
import { proposalFirstActionKey } from "$lib/utils/proposals.utils";
import {
  mockProposalInfo,
  proposalActionMotion,
  proposalActionNnsFunction21,
  proposalActionRewardNodeProvider,
} from "$tests/mocks/proposal.mock";
import { ProposalProposerActionsEntryPo } from "$tests/page-objects/ProposalProposerActionsEntry.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { Action, Proposal } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import { beforeEach } from "vitest";

const proposalWithMotionAction = {
  ...mockProposalInfo.proposal,
  action: proposalActionMotion,
} as Proposal;

const proposalWithRewardNodeProviderAction = {
  ...mockProposalInfo.proposal,
  action: proposalActionRewardNodeProvider,
} as Proposal;

const actionWithUndefined = {
  Motion: {
    motionText: undefined,
  },
} as Action;

const proposalWithActionWithUndefined = {
  ...mockProposalInfo.proposal,
  action: actionWithUndefined,
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

  it("should render action key", async () => {
    const po = renderComponent({
      proposal: proposalWithMotionAction,
    });

    const key = proposalFirstActionKey(proposalWithMotionAction) as string;
    expect(await po.getActionTitle()).toEqual(key);
  });

  it("should render action fields", async () => {
    const po = renderComponent({
      proposal: proposalWithMotionAction,
    });

    const [key, value] = Object.entries(
      (proposalWithMotionAction?.action as { Motion: object }).Motion
    )[0];

    expect(await po.getJsonPreviewPo().getRawText()).toMatch(`${key}`);
    expect(await po.getJsonPreviewPo().getRawText()).toMatch(`${value}`);
  });

  it("should render action data as JSON", async () => {
    jsonRepresentationStore.setMode("raw");
    const po = renderComponent({
      proposal: proposalWithRewardNodeProviderAction,
    });

    expect(await po.getJsonPreviewPo().getRawObject()).toEqual({
      amountE8s: "10000000",
      nodeProvider: {
        id: "aaaaa-aa",
      },
      rewardMode: {
        RewardToNeuron: {
          dissolveDelaySeconds: "1000",
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
      `nodeProvider id "aaaaa-aa"  amountE8s 10000000  rewardMode  RewardToNeuron dissolveDelaySeconds 1000`
    );
  });

  it("should render undefined fields as 'undefined'", async () => {
    const po = renderComponent({
      proposal: proposalWithActionWithUndefined,
    });

    expect(await po.getJsonPreviewPo().getRawText()).toContain("undefined");
  });

  it("should render nnsFunction id", async () => {
    const proposalWithNnsFunctionAction = {
      ...mockProposalInfo.proposal,
      action: proposalActionNnsFunction21,
    } as Proposal;
    const [key, value] = Object.entries(
      (
        proposalWithNnsFunctionAction?.action as {
          ExecuteNnsFunction: object;
        }
      ).ExecuteNnsFunction
    )[0];

    const po = renderComponent({
      proposal: proposalWithNnsFunctionAction,
    });

    expect(await po.getJsonPreviewPo().getRawText()).toContain(key);
    expect(await po.getJsonPreviewPo().getRawText()).toContain(value);
  });
});
