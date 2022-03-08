/**
 * @jest-environment jsdom
 */

import type { Proposal } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import ProposalActions from "../../../../../lib/components/proposal-detail/ProposalDetailCard/ProposalActions.svelte";
import {
  proposalActionFields,
  proposalFirstActionKey,
} from "../../../../../lib/utils/proposals.utils";
import { mockProposalInfo } from "../../../../mocks/proposal.mock";

describe("ProposalActions", () => {
  it("should render action key", () => {
    const { getByText } = render(ProposalActions, {
      props: {
        proposal: mockProposalInfo.proposal,
      },
    });

    const key = proposalFirstActionKey(
      mockProposalInfo.proposal as Proposal
    ) as string;
    expect(getByText(key)).toBeInTheDocument();
  });

  it("should render action fields", () => {
    const { getByText } = render(ProposalActions, {
      props: {
        proposal: mockProposalInfo.proposal,
      },
    });

    const fields = proposalActionFields(mockProposalInfo.proposal as Proposal);
    for (const [key, value] of fields) {
      const element = getByText(key);
      expect(element).toBeInTheDocument();
      expect(element.nextElementSibling?.textContent).toBe(value);
    }
  });
});
