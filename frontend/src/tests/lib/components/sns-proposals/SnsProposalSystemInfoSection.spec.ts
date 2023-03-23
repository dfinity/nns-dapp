/**
 * @jest-environment jsdom
 */

import ProposalSystemInfoSection from "$lib/components/sns-proposals/SnsProposalSystemInfoSection.svelte";
import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import { secondsToDateTime } from "$lib/utils/date.utils";
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
import { mapProposalInfo } from "$lib/utils/sns-proposals.utils";
import * as fakeSnsGovernanceApi from "$tests/fakes/sns-governance-api.fake";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import en from "$tests/mocks/i18n.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { createSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { SnsProposalSystemInfoSectionPo } from "$tests/page-objects/SnsProposalSystemInfoSection.page-object";
import { SnsProposalDecisionStatus } from "@dfinity/sns";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

jest.mock("$lib/api/sns-governance.api");

describe("ProposalSystemInfoSection", () => {
  fakeSnsGovernanceApi.install();

  const rootCanisterId = mockCanisterId;
  const nervousFunction = nervousSystemFunctionMock;

  beforeEach(() => {
    jest.clearAllMocks();
    snsFunctionsStore.reset();
    fakeSnsGovernanceApi.addNervousSystemFunctionWith({
      rootCanisterId,
      ...nervousFunction,
    });
  });

  describe("open proposal", () => {
    const openProposal = {
      ...createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
        proposalId: BigInt(2),
      }),
      action: nervousFunction.id,
    };
    const {
      rewardStatusString,
      proposer,
      proposal_creation_timestamp_seconds,
    } = mapProposalInfo({
      proposalData: openProposal,
      nsFunctions: [nervousFunction],
    });
    const props = {
      proposal: openProposal,
      rootCanisterId,
    };

    it("should load the nervous functions in the store", async () => {
      fakeSnsGovernanceApi.pause();
      render(ProposalSystemInfoSection, { props });

      expect(get(snsFunctionsStore)[rootCanisterId.toText()]).toBeUndefined();
      fakeSnsGovernanceApi.resume();

      await waitFor(() =>
        expect(
          get(snsFunctionsStore)[rootCanisterId.toText()].nsFunctions
        ).toEqual([nervousFunction])
      );
    });

    it("should render topic as title", async () => {
      const { container } = render(ProposalSystemInfoSection, { props });
      const po = SnsProposalSystemInfoSectionPo.under(
        new JestPageObjectElement(container)
      );

      await waitFor(() =>
        expect(
          get(snsFunctionsStore)[rootCanisterId.toText()].nsFunctions.length
        ).toBeGreaterThan(0)
      );

      expect(await po.getTitleText()).toEqual(nervousFunction.name);
    });

    it("should render type info from the nervous function", async () => {
      const { container } = render(ProposalSystemInfoSection, { props });

      const po = SnsProposalSystemInfoSectionPo.under(
        new JestPageObjectElement(container)
      );

      await waitFor(() =>
        expect(
          get(snsFunctionsStore)[rootCanisterId.toText()].nsFunctions
        ).toEqual([nervousFunction])
      );

      expect(await po.getTypeText()).toBe(nervousFunction.name);
    });

    it("should render topic info from the nervous function", async () => {
      const { container } = render(ProposalSystemInfoSection, { props });

      const po = SnsProposalSystemInfoSectionPo.under(
        new JestPageObjectElement(container)
      );

      await waitFor(() =>
        expect(
          get(snsFunctionsStore)[rootCanisterId.toText()].nsFunctions
        ).toEqual([nervousFunction])
      );

      expect(await po.getTopicText()).toBe(nervousFunction.name);
    });

    it("should render open status", async () => {
      const { container } = render(ProposalSystemInfoSection, { props });

      const po = SnsProposalSystemInfoSectionPo.under(
        new JestPageObjectElement(container)
      );

      expect(await po.getDecisionStatusText()).toBe(
        en.sns_status[SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN]
      );
    });

    it("should render reward status info", async () => {
      const { container } = render(ProposalSystemInfoSection, { props });

      const po = SnsProposalSystemInfoSectionPo.under(
        new JestPageObjectElement(container)
      );

      expect(await po.getRewardStatusText()).toBe(rewardStatusString);
    });

    it("should render created timestamp", async () => {
      const { container } = render(ProposalSystemInfoSection, { props });

      const po = SnsProposalSystemInfoSectionPo.under(
        new JestPageObjectElement(container)
      );

      expect(await po.getCreatedText()).toBe(
        secondsToDateTime(proposal_creation_timestamp_seconds)
      );
    });

    it("should not render any timestamps", async () => {
      const { container } = render(ProposalSystemInfoSection, { props });

      const po = SnsProposalSystemInfoSectionPo.under(
        new JestPageObjectElement(container)
      );

      expect(await po.getDecidedText()).toBeNull();
      expect(await po.getExecutedText()).toBeNull();
      expect(await po.getFailedText()).toBeNull();
    });

    it("should render proposer info", async () => {
      const { container } = render(ProposalSystemInfoSection, { props });

      const po = SnsProposalSystemInfoSectionPo.under(
        new JestPageObjectElement(container)
      );

      expect(await po.getProposerText()).toContain(
        shortenWithMiddleEllipsis(subaccountToHexString(proposer.id))
      );
    });
  });

  describe("adopted proposal", () => {
    const adoptedProposal = {
      ...createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED,
        proposalId: BigInt(2),
      }),
    };
    const props = {
      proposal: adoptedProposal,
      rootCanisterId,
    };
    it("should render adopted status", async () => {
      const { container } = render(ProposalSystemInfoSection, { props });

      const po = SnsProposalSystemInfoSectionPo.under(
        new JestPageObjectElement(container)
      );

      expect(await po.getDecisionStatusText()).toBe(
        en.sns_status[
          SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED
        ]
      );
    });

    it("should render decided timestamp", async () => {
      const { container } = render(ProposalSystemInfoSection, { props });

      const po = SnsProposalSystemInfoSectionPo.under(
        new JestPageObjectElement(container)
      );

      expect(await po.getDecidedText()).toBe(
        secondsToDateTime(adoptedProposal.decided_timestamp_seconds)
      );
    });
  });

  describe("executed proposal", () => {
    const executedProposal = {
      ...createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_EXECUTED,
        proposalId: BigInt(2),
      }),
    };
    const props = {
      proposal: executedProposal,
      rootCanisterId,
    };
    it("should render executed status", async () => {
      const { container } = render(ProposalSystemInfoSection, { props });

      const po = SnsProposalSystemInfoSectionPo.under(
        new JestPageObjectElement(container)
      );

      expect(await po.getDecisionStatusText()).toBe(
        en.sns_status[
          SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_EXECUTED
        ]
      );
    });

    it("should render executed timestamp", async () => {
      const { container } = render(ProposalSystemInfoSection, { props });

      const po = SnsProposalSystemInfoSectionPo.under(
        new JestPageObjectElement(container)
      );

      expect(await po.getExecutedText()).toBe(
        secondsToDateTime(executedProposal.executed_timestamp_seconds)
      );
    });
  });

  describe("failed proposal", () => {
    const failedProposal = {
      ...createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_FAILED,
        proposalId: BigInt(2),
      }),
    };
    const props = {
      proposal: failedProposal,
      rootCanisterId,
    };
    it("should render failed status", async () => {
      const { container } = render(ProposalSystemInfoSection, { props });

      const po = SnsProposalSystemInfoSectionPo.under(
        new JestPageObjectElement(container)
      );

      expect(await po.getDecisionStatusText()).toBe(
        en.sns_status[SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_FAILED]
      );
    });

    it("should render fialed timestamp", async () => {
      const { container } = render(ProposalSystemInfoSection, { props });

      const po = SnsProposalSystemInfoSectionPo.under(
        new JestPageObjectElement(container)
      );

      expect(await po.getFailedText()).toBe(
        secondsToDateTime(failedProposal.failed_timestamp_seconds)
      );
    });
  });
});
