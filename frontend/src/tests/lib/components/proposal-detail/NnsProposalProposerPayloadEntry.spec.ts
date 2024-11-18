import * as agent from "$lib/api/agent.api";
import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import NnsProposalProposerPayloadEntry from "$lib/components/proposal-detail/NnsProposalProposerPayloadEntry.svelte";
import { jsonRepresentationStore } from "$lib/stores/json-representation.store";
import { proposalPayloadsStore } from "$lib/stores/proposals.store";
import {
  mockProposalInfo,
  proposalActionMotion,
  proposalActionNnsFunction21,
} from "$tests/mocks/proposal.mock";
import { JsonPreviewPo } from "$tests/page-objects/JsonPreview.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { HttpAgent } from "@dfinity/agent";
import type { Proposal } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import { mock } from "vitest-mock-extended";

describe("NnsProposalProposerPayloadEntry", () => {
  const nnsDappMock = mock<NNSDappCanister>();

  const payload = { b: "c" };

  beforeEach(() => {
    proposalPayloadsStore.reset();
    vi.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  describe("when proposal is ExecuteNnsFunction", () => {
    const proposalWithNnsFunctionAction = {
      ...mockProposalInfo.proposal,
      action: proposalActionNnsFunction21,
    } as Proposal;

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
      expect(nnsDappMock.getProposalPayload).toBeCalledWith({
        proposalId: mockProposalInfo.id,
      });
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

  describe("when proposal is Motion", () => {
    const proposalWithMotionAction = {
      ...mockProposalInfo.proposal,
      action: proposalActionMotion,
    } as Proposal;

    it("should not trigger getProposalPayload", async () => {
      expect(nnsDappMock.getProposalPayload).toBeCalledTimes(0);
      render(NnsProposalProposerPayloadEntry, {
        props: {
          proposal: proposalWithMotionAction,
          proposalId: mockProposalInfo.id,
        },
      });

      await runResolvedPromises();
      expect(nnsDappMock.getProposalPayload).toBeCalledTimes(0);
    });

    it("should not render payload", async () => {
      jsonRepresentationStore.setMode("raw");
      const { container } = render(NnsProposalProposerPayloadEntry, {
        props: {
          proposal: proposalWithMotionAction,
          proposalId: mockProposalInfo.id,
        },
      });
      await runResolvedPromises();
      const po = JsonPreviewPo.under(new JestPageObjectElement(container));
      expect(await po.getRawText()).toBeUndefined();
    });
  });
});
