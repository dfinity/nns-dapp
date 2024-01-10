import * as agent from "$lib/api/agent.api";
import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import NnsProposalProposerPayloadEntry from "$lib/components/proposal-detail/NnsProposalProposerPayloadEntry.svelte";
import { jsonRepresentationStore } from "$lib/stores/json-representation.store";
import { proposalPayloadsStore } from "$lib/stores/proposals.store";
import {
  mockProposalInfo,
  proposalActionNnsFunction21,
} from "$tests/mocks/proposal.mock";
import { JsonPreviewPo } from "$tests/page-objects/JsonPreview.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { HttpAgent } from "@dfinity/agent";
import type { Proposal } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import { mock } from "vitest-mock-extended";

const proposalWithNnsFunctionAction = {
  ...mockProposalInfo.proposal,
  action: proposalActionNnsFunction21,
} as Proposal;

describe("NnsProposalProposerPayloadEntry", () => {
  const nnsDappMock = mock<NNSDappCanister>();
  vi.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);

  const payload = { b: "c" };

  beforeEach(() => {
    vi.clearAllMocks();
    proposalPayloadsStore.reset();
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  it("should trigger getProposalPayload", async () => {
    nnsDappMock.getProposalPayload.mockImplementation(async () => payload);

    expect(nnsDappMock.getProposalPayload).toBeCalledTimes(0);
    render(NnsProposalProposerPayloadEntry, {
      props: {
        proposal: proposalWithNnsFunctionAction,
        proposalId: mockProposalInfo.id,
      },
    });

    await runResolvedPromises();
    expect(nnsDappMock.getProposalPayload).toBeCalledTimes(1);
  });

  it("should render payload", async () => {
    nnsDappMock.getProposalPayload.mockImplementation(async () => payload);
    jsonRepresentationStore.setMode("raw");
    const { container } = render(NnsProposalProposerPayloadEntry, {
      props: {
        proposal: proposalWithNnsFunctionAction,
        proposalId: mockProposalInfo.id,
      },
    });
    await runResolvedPromises();
    const po = JsonPreviewPo.under(new JestPageObjectElement(container));
    expect(await po.getRawObject()).toEqual(payload);
  });
});
