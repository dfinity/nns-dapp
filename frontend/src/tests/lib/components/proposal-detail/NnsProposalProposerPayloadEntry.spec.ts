/**
 * @jest-environment jsdom
 */

import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import NnsProposalProposerPayloadEntry from "$lib/components/proposal-detail/NnsProposalProposerPayloadEntry.svelte";
import { proposalPayloadsStore } from "$lib/stores/proposals.store";
import {
  mockProposalInfo,
  proposalActionNnsFunction21,
} from "$tests/mocks/proposal.mock";
import { simplifyJson } from "$tests/utils/json.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { Proposal } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import { mock } from "jest-mock-extended";

const proposalWithNnsFunctionAction = {
  ...mockProposalInfo.proposal,
  action: proposalActionNnsFunction21,
} as Proposal;

describe("NnsProposalProposerPayloadEntry", () => {
  const nnsDappMock = mock<NNSDappCanister>();
  jest.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);

  const nestedObj = { b: "c" };
  const payloadWithJsonString = {
    a: JSON.stringify(nestedObj),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    proposalPayloadsStore.reset();
  });

  it("should trigger getProposalPayload", async () => {
    const nestedObj = { b: "c" };
    const payloadWithJsonString = {
      a: JSON.stringify(nestedObj),
    };
    const spyGetProposalPayload = jest
      .spyOn(nnsDappMock, "getProposalPayload")
      .mockImplementation(async () => payloadWithJsonString);

    expect(spyGetProposalPayload).toBeCalledTimes(0);
    render(NnsProposalProposerPayloadEntry, {
      props: {
        proposal: proposalWithNnsFunctionAction,
        proposalId: mockProposalInfo.id,
      },
    });

    await runResolvedPromises();
    expect(spyGetProposalPayload).toBeCalledTimes(1);
  });

  it("should parse JSON strings and render them", async () => {
    jest
      .spyOn(nnsDappMock, "getProposalPayload")
      .mockImplementation(async () => payloadWithJsonString);
    const { queryByTestId } = render(NnsProposalProposerPayloadEntry, {
      props: {
        proposal: proposalWithNnsFunctionAction,
        proposalId: mockProposalInfo.id,
      },
    });

    await runResolvedPromises();
    const jsonElement = queryByTestId("json-wrapper");
    expect(simplifyJson(jsonElement.textContent)).toBe(
      simplifyJson(JSON.stringify({ a: nestedObj }))
    );
  });
});
