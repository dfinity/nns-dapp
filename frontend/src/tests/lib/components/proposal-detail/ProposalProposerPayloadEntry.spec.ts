/**
 * @jest-environment jsdom
 */

import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import ProposalProposerPayloadEntry from "$lib/components/proposal-detail/ProposalProposerPayloadEntry.svelte";
import { proposalPayloadsStore } from "$lib/stores/proposals.store";
import type { Proposal } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import { mock } from "jest-mock-extended";
import {
  mockProposalInfo,
  proposalActionNnsFunction21,
} from "../../../mocks/proposal.mock";
import { simplifyJson } from "../common/Json.spec";

const proposalWithNnsFunctionAction = {
  ...mockProposalInfo.proposal,
  action: proposalActionNnsFunction21,
} as Proposal;

describe("ProposalProposerPayloadEntry", () => {
  const nnsDappMock = mock<NNSDappCanister>();
  jest.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);

  const nestedObj = { b: "c" };
  const payloadWithJsonString = {
    a: JSON.stringify(nestedObj),
  };

  afterAll(jest.clearAllMocks);

  beforeEach(() => proposalPayloadsStore.reset);
  it("should trigger getProposalPayload", async () => {
    const nestedObj = { b: "c" };
    const payloadWithJsonString = {
      a: JSON.stringify(nestedObj),
    };
    const spyGetProposalPayload = jest
      .spyOn(nnsDappMock, "getProposalPayload")
      .mockImplementation(async () => payloadWithJsonString);
    render(ProposalProposerPayloadEntry, {
      props: {
        proposal: proposalWithNnsFunctionAction,
        proposalId: mockProposalInfo.id,
      },
    });

    await waitFor(() => expect(spyGetProposalPayload).toBeCalledTimes(1));
  });

  it("should parse JSON strings and render them", async () => {
    jest
      .spyOn(nnsDappMock, "getProposalPayload")
      .mockImplementation(async () => payloadWithJsonString);
    const { queryByTestId } = render(ProposalProposerPayloadEntry, {
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
