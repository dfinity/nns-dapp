/**
 * @jest-environment jsdom
 */

import { snsProjectIdSelectedStore } from "$lib/derived/selected-project.derived";
import SnsProposalDetail from "$lib/pages/SnsProposalDetail.svelte";
import { loadSnsProposal } from "$lib/services/$public/sns-proposals.services";
import type { Principal } from "@dfinity/principal";
import { render, waitFor } from "@testing-library/svelte";
import type { Subscriber } from "svelte/types/runtime/store";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import { mockProposals } from "../../mocks/proposals.store.mock";

jest.mock("$lib/services/$public/sns-proposals.services", () => ({
  loadSnsProposal: jest.fn().mockImplementation().mockResolvedValue(undefined),
}));

describe("SnsProposalDetail", () => {
  jest
    .spyOn(snsProjectIdSelectedStore, "subscribe")
    .mockImplementation((run: Subscriber<Principal>): (() => void) => {
      run(mockPrincipal);
      return () => undefined;
    });

  const proposalId = mockProposals[0].id;
  const props = {
    proposalIdText: `${proposalId}`,
  };

  it("should call loadSnsProposal", async () => {
    render(SnsProposalDetail, props);

    await waitFor(() =>
      expect(loadSnsProposal).toBeCalledWith(
        expect.objectContaining({
          proposalId,
        })
      )
    );
  });
});
