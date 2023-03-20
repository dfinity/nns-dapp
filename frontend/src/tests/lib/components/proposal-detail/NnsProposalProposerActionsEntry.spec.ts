/**
 * @jest-environment jsdom
 */

import NnsProposalProposerActionsEntry from "$lib/components/proposal-detail/NnsProposalProposerActionsEntry.svelte";
import { proposalFirstActionKey } from "$lib/utils/proposals.utils";
import {
  mockProposalInfo,
  proposalActionMotion,
  proposalActionNnsFunction21,
  proposalActionRewardNodeProvider,
} from "$tests/mocks/proposal.mock";
import type { Action, Proposal } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

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
  it("should render action key", () => {
    const { getByText } = render(NnsProposalProposerActionsEntry, {
      props: {
        proposal: proposalWithMotionAction,
      },
    });

    const key = proposalFirstActionKey(proposalWithMotionAction) as string;
    expect(getByText(key)).toBeInTheDocument();
  });

  it("should render action fields", () => {
    const { getByText } = render(NnsProposalProposerActionsEntry, {
      props: {
        proposal: proposalWithMotionAction,
      },
    });

    const [key, value] = Object.entries(
      (proposalWithMotionAction?.action as { Motion: object }).Motion
    )[0];
    expect(getByText(key)).toBeInTheDocument();
    expect(getByText(value)).toBeInTheDocument();
  });

  it("should render object fields as JSON", () => {
    const nodeProviderActions = render(NnsProposalProposerActionsEntry, {
      props: {
        proposal: proposalWithRewardNodeProviderAction,
      },
    });

    expect(nodeProviderActions.queryAllByTestId("json").length).toBe(2);
  });

  it("should render text fields as plane text", () => {
    const motionActions = render(NnsProposalProposerActionsEntry, {
      props: {
        proposal: proposalWithMotionAction,
      },
    });

    expect(motionActions.queryAllByTestId("json").length).toBe(0);
  });

  it("should render undefined fields as 'undefined'", () => {
    const { getByText } = render(NnsProposalProposerActionsEntry, {
      props: {
        proposal: proposalWithActionWithUndefined,
      },
    });

    expect(getByText("undefined")).toBeInTheDocument();
  });

  it("should render nnsFunction id", () => {
    const proposalWithNnsFunctionAction = {
      ...mockProposalInfo.proposal,
      action: proposalActionNnsFunction21,
    } as Proposal;

    const { getByText } = render(NnsProposalProposerActionsEntry, {
      props: {
        proposal: proposalWithNnsFunctionAction,
      },
    });

    const [key, value] = Object.entries(
      (
        proposalWithNnsFunctionAction?.action as {
          ExecuteNnsFunction: object;
        }
      ).ExecuteNnsFunction
    )[0];

    expect(getByText(key)).toBeInTheDocument();
    expect(getByText(value)).toBeInTheDocument();
  });
});
