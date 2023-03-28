/**
 * @jest-environment jsdom
 */

import SnsProposalActionSection from "$lib/components/sns-proposals/SnsProposalActionSection.svelte";
import { proposalFirstActionKey } from "$lib/utils/sns-proposals.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { ProposalProposerActionsEntryPo } from "$tests/page-objects/ProposalProposerActionsEntry.page-object";
import type { SnsAction, SnsProposalData } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

const transferFundsAction: SnsAction = {
  TransferSnsTreasuryFunds: {
    from_treasury: 123,
    to_principal: [mockPrincipal],
    to_subaccount: [{ subaccount: new Uint8Array() }],
    memo: [BigInt(123333)],
    amount_e8s: BigInt(10_000_000),
  },
};
const proposalWithTransferFunds: SnsProposalData = {
  ...mockSnsProposal,
  proposal: [
    {
      ...mockSnsProposal.proposal[0],
      action: [transferFundsAction],
    },
  ],
};
const addFunctionAction: SnsAction = {
  AddGenericNervousSystemFunction: {
    id: BigInt(2),
    name: "test fn",
    description: ["test description"],
    function_type: [{ NativeNervousSystemFunction: {} }],
  },
};
const proposalWithAddFunction: SnsProposalData = {
  ...mockSnsProposal,
  proposal: [
    {
      ...mockSnsProposal.proposal[0],
      action: [addFunctionAction],
    },
  ],
};
const motionAction: SnsAction = {
  Motion: {
    motion_text: "text",
  },
};
const proposalWithMotion: SnsProposalData = {
  ...mockSnsProposal,
  proposal: [
    {
      ...mockSnsProposal.proposal[0],
      action: [motionAction],
    },
  ],
};

describe("SnsProposalActionSection", () => {
  const renderComponent = (proposal) => {
    const { container } = render(SnsProposalActionSection, {
      props: { proposal },
    });

    return ProposalProposerActionsEntryPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render action key as title", async () => {
    const po = renderComponent(proposalWithTransferFunds);

    expect(await po.getActionTitle()).toBe(
      proposalFirstActionKey(proposalWithTransferFunds)
    );
  });

  it("should render action fields", async () => {
    const po = renderComponent(proposalWithTransferFunds);

    const [key, value] = Object.entries(
      transferFundsAction.TransferSnsTreasuryFunds
    )[0];
    expect(await po.getFieldsText()).toContain(key);
    expect(await po.getFieldsText()).toContain(value.toString());
  });

  it("should render object fields as JSON", async () => {
    const po = renderComponent(proposalWithAddFunction);

    expect(await po.getJsonPos()).toHaveLength(2);
  });

  it("should render text fields as plane text", async () => {
    const po = renderComponent(proposalWithMotion);

    expect(await po.getJsonPos()).toHaveLength(0);
  });

  it.skip("should render undefined fields as 'undefined'", async () => {
    // TODO: Convert action types to use `undefined | T` instead of `[] | [T]`.
  });
});
