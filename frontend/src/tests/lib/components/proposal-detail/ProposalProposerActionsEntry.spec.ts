/**
 * @jest-environment jsdom
 */

import type { Proposal } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import ProposalProposerActionsEntry from "$lib/components/proposal-detail/ProposalProposerActionsEntry.svelte";
import { proposalFirstActionKey } from "$lib/utils/proposals.utils";
import {
  mockProposalInfo,
  proposalActionMotion,
  proposalActionNnsFunction21,
  proposalActionRewardNodeProvider,
} from "../../../mocks/proposal.mock";

const proposalWithMotionAction = {
  ...mockProposalInfo.proposal,
  action: proposalActionMotion,
} as Proposal;

const proposalWithRewardNodeProviderAction = {
  ...mockProposalInfo.proposal,
  action: proposalActionRewardNodeProvider,
} as Proposal;

describe("ProposalProposerActionsEntry", () => {
  it("should render action key", () => {
    const { getByText } = render(ProposalProposerActionsEntry, {
      props: {
        proposal: proposalWithMotionAction,
      },
    });

    const key = proposalFirstActionKey(proposalWithMotionAction) as string;
    expect(getByText(key)).toBeInTheDocument();
  });

  it("should render action fields", () => {
    const { getByText } = render(ProposalProposerActionsEntry, {
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
    const nodeProviderActions = render(ProposalProposerActionsEntry, {
      props: {
        proposal: proposalWithRewardNodeProviderAction,
      },
    });

    expect(nodeProviderActions.queryAllByTestId("json").length).toBe(2);
  });

  it("should render text fields as plane text", () => {
    const motionActions = render(ProposalProposerActionsEntry, {
      props: {
        proposal: proposalWithMotionAction,
      },
    });

    expect(motionActions.queryAllByTestId("json").length).toBe(0);
  });

  it("should render nnsFunction id", () => {
    const proposalWithNnsFunctionAction = {
      ...mockProposalInfo.proposal,
      action: proposalActionNnsFunction21,
    } as Proposal;

    const { getByText } = render(ProposalProposerActionsEntry, {
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
