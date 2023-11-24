import NnsProposalProposerActionsEntry from "$lib/components/proposal-detail/NnsProposalProposerActionsEntry.svelte";
import { jsonRepresentationStore } from "$lib/stores/json-representation.store";
import { proposalFirstActionKey } from "$lib/utils/proposals.utils";
import {
  mockProposalInfo,
  proposalActionMotion,
} from "$tests/mocks/proposal.mock";
import { ProposalProposerActionsEntryPo } from "$tests/page-objects/ProposalProposerActionsEntry.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { Proposal } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

const proposalWithMotionAction = {
  ...mockProposalInfo.proposal,
  action: proposalActionMotion,
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

  // switch to raw mode to simplify data validation
  beforeEach(() => jsonRepresentationStore.setMode("raw"));

  it("should render action key", async () => {
    const po = renderComponent({
      proposal: proposalWithMotionAction,
    });

    const key = proposalFirstActionKey(proposalWithMotionAction) as string;
    expect(await po.getActionTitle()).toEqual(key);
  });

  it("should render action data", async () => {
    const po = renderComponent({
      proposal: proposalWithMotionAction,
    });

    expect(JSON.parse(await po.getJsonPreviewPo().getRawText())).toEqual({
      motionText: "Test motion",
    });
  });
});
