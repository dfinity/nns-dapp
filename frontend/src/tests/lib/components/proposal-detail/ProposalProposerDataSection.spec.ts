/**
 * @jest-environment jsdom
 */

import type { Proposal } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import { mock } from "jest-mock-extended";
import { NNSDappCanister } from "../../../../lib/canisters/nns-dapp/nns-dapp.canister";
import ProposalProposerDataSection from "../../../../lib/components/proposal-detail/ProposalProposerDataSection.svelte";
import {
  mockProposalInfo,
  proposalActionNnsFunction21,
} from "../../../mocks/proposal.mock";

describe("ProposalProposerDataSection", () => {
  const nnsDappMock = mock<NNSDappCanister>();
  nnsDappMock.getProposalPayload.mockResolvedValue({});
  jest.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);

  const proposalWithNnsFunctionAction = {
    ...mockProposalInfo.proposal,
    action: proposalActionNnsFunction21,
  } as Proposal;

  it("should render entries", async () => {
    const renderResult = render(ProposalProposerDataSection, {
      props: {
        proposalInfo: {
          ...mockProposalInfo,
          proposal: proposalWithNnsFunctionAction
        },
      },
    });

    const { getByTestId } = renderResult;
    await waitFor(() =>
      expect(
        getByTestId("proposal-proposer-actions-entry-title")
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        getByTestId("proposal-proposer-payload-entry-title")
      ).toBeInTheDocument()
    );
  });
});
