/**
 * @jest-environment jsdom
 */

import type { Proposal } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import { mock } from "jest-mock-extended";
import { NNSDappCanister } from "../../../../lib/canisters/nns-dapp/nns-dapp.canister";
import ProposalProposerPayloadEntry from "../../../../lib/components/proposal-detail/ProposalProposerPayloadEntry.svelte";
import { proposalPayloadsStore } from "../../../../lib/stores/proposals.store";
import {
  mockProposalInfo,
  proposalActionNnsFunction21,
} from "../../../mocks/proposal.mock";

const proposalWithNnsFunctionAction = {
  ...mockProposalInfo.proposal,
  action: proposalActionNnsFunction21,
} as Proposal;

describe("ProposalProposerPayloadEntry", () => {
  const nnsDappMock = mock<NNSDappCanister>();
  nnsDappMock.getProposalPayload.mockResolvedValue({});
  jest.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);

  beforeEach(() => proposalPayloadsStore.reset);

  afterAll(jest.clearAllMocks);

  it("should trigger getProposalPayload", async () => {
    const spyGetProposalPayload = jest
      .spyOn(nnsDappMock, "getProposalPayload")
      .mockImplementation(async () => ({}));

    render(ProposalProposerPayloadEntry, {
      props: {
        proposal: proposalWithNnsFunctionAction,
        proposalId: mockProposalInfo.id
      },
    });

    await waitFor(() => expect(spyGetProposalPayload).toBeCalledTimes(1));
  });
});
