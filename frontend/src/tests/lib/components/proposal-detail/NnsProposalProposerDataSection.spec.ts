/**
 * @jest-environment jsdom
 */

import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import NnsProposalProposerDataSection from "$lib/components/proposal-detail/NnsProposalProposerDataSection.svelte";
import type { Proposal } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import { mock } from "jest-mock-extended";
import {
  mockProposalInfo,
  proposalActionNnsFunction21,
} from "../../../mocks/proposal.mock";

describe("NnsProposalProposerDataSection", () => {
  const nnsDappMock = mock<NNSDappCanister>();
  nnsDappMock.getProposalPayload.mockResolvedValue({});
  jest.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);

  const proposalWithNnsFunctionAction = {
    ...mockProposalInfo.proposal,
    action: proposalActionNnsFunction21,
  } as Proposal;

  it("should render entries", async () => {
    const renderResult = render(NnsProposalProposerDataSection, {
      props: {
        proposalInfo: {
          ...mockProposalInfo,
          proposal: proposalWithNnsFunctionAction,
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
