import NnsProposalProposerActionsEntry from "$lib/components/proposal-detail/NnsProposalProposerActionsEntry.svelte";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
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
  // TODO(GIX-2030) remove this once the feature flag is removed
  beforeEach(() =>
    overrideFeatureFlagsStore.setFlag("ENABLE_FULL_WIDTH_PROPOSAL", false)
  );

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
    expect(getByText(key, { exact: false })).toBeInTheDocument();
    expect(getByText(value, { exact: false })).toBeInTheDocument();
  });

  it("should render object fields as JSON", () => {
    const nodeProviderActions = render(NnsProposalProposerActionsEntry, {
      props: {
        proposal: proposalWithRewardNodeProviderAction,
      },
    });

    expect(nodeProviderActions.queryByTestId("json")).toBeInTheDocument();
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

    expect(getByText(key, { exact: false })).toBeInTheDocument();
    expect(getByText(value)).toBeInTheDocument();
  });
});
