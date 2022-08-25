/**
 * @jest-environment jsdom
 */

import type { Proposal } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import ProposalActions from "../../../../lib/components/proposal-detail/ProposalDetailCard/ProposalActions.svelte";
import { proposalFirstActionKey } from "../../../../lib/utils/proposals.utils";
import {
  mockProposalInfo,
  proposalActionMotion,
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
    const { getByText } = render(ProposalActions, {
      props: {
        proposal: proposalWithMotionAction,
        proposalId: mockProposalInfo.id,
      },
    });

    const key = proposalFirstActionKey(proposalWithMotionAction) as string;
    expect(getByText(key)).toBeInTheDocument();
  });

  it("should render action fields", () => {
    const { getByText } = render(ProposalActions, {
      props: {
        proposal: proposalWithMotionAction,
        proposalId: mockProposalInfo.id,
      },
    });

    const [key, value] = Object.entries(
      (proposalWithMotionAction?.action as { Motion: object }).Motion
    )[0];
    expect(getByText(key)).toBeInTheDocument();
    expect(getByText(value)).toBeInTheDocument();
  });

  it("should render object fields as JSON", () => {
    const nodeProviderActions = render(ProposalActions, {
      props: {
        proposal: proposalWithRewardNodeProviderAction,
        proposalId: mockProposalInfo.id,
      },
    });

    expect(nodeProviderActions.queryAllByTestId("json").length).toBe(2);
  });

  it("should render text fields as plane text", () => {
    const motionActions = render(ProposalActions, {
      props: {
        proposal: proposalWithMotionAction,
        proposalId: mockProposalInfo.id,
      },
    });

    expect(motionActions.queryAllByTestId("json").length).toBe(0);
  });
});
