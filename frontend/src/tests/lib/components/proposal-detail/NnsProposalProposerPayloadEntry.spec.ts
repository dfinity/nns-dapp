import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import NnsProposalProposerPayloadEntry from "$lib/components/proposal-detail/NnsProposalProposerPayloadEntry.svelte";
import { proposalPayloadsStore } from "$lib/stores/proposals.store";
import {
  mockProposalInfo,
  proposalActionNnsFunction21,
} from "$tests/mocks/proposal.mock";
import type { Proposal } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import { mock } from "vitest-mock-extended";
import { simplifyJson } from "../common/Json.spec";

const proposalWithNnsFunctionAction = {
  ...mockProposalInfo.proposal,
  action: proposalActionNnsFunction21,
} as Proposal;

describe("NnsProposalProposerPayloadEntry", () => {
  const nnsDappMock = mock<NNSDappCanister>();
  vi.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);

  const nestedObj = { b: "c" };
  const payloadWithJsonString = {
    a: JSON.stringify(nestedObj),
  };

  afterAll(vi.clearAllMocks);

  beforeEach(() => proposalPayloadsStore.reset);
  it("should trigger getProposalPayload", async () => {
    const nestedObj = { b: "c" };
    const payloadWithJsonString = {
      a: JSON.stringify(nestedObj),
    };
    const spyGetProposalPayload = vi
      .spyOn(nnsDappMock, "getProposalPayload")
      .mockImplementation(async () => payloadWithJsonString);
    render(NnsProposalProposerPayloadEntry, {
      props: {
        proposal: proposalWithNnsFunctionAction,
        proposalId: mockProposalInfo.id,
      },
    });

    await waitFor(() => expect(spyGetProposalPayload).toBeCalledTimes(1));
  });

  it("should parse JSON strings and render them", async () => {
    vi.spyOn(nnsDappMock, "getProposalPayload").mockImplementation(
      async () => payloadWithJsonString
    );
    const { queryByTestId } = render(NnsProposalProposerPayloadEntry, {
      props: {
        proposal: proposalWithNnsFunctionAction,
        proposalId: mockProposalInfo.id,
      },
    });

    const jsonElement = queryByTestId("json-wrapper");
    await waitFor(() =>
      expect(simplifyJson(jsonElement.textContent)).toBe(
        simplifyJson(JSON.stringify({ a: nestedObj }))
      )
    );
  });
});
