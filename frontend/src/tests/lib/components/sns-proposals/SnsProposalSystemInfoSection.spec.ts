import ProposalSystemInfoSection from "$lib/components/sns-proposals/SnsProposalSystemInfoSection.svelte";
import { snsFunctionsStore } from "$lib/derived/sns-functions.derived";
import type { TopicInfoWithUnknown } from "$lib/types/sns-aggregator";
import { secondsToDateTime } from "$lib/utils/date.utils";
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
import { mapProposalInfo } from "$lib/utils/sns-proposals.utils";
import * as fakeSnsGovernanceApi from "$tests/fakes/sns-governance-api.fake";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import en from "$tests/mocks/i18n.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { createSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { SnsProposalSystemInfoSectionPo } from "$tests/page-objects/SnsProposalSystemInfoSection.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import {
  SnsProposalDecisionStatus,
  type SnsProposalData,
  type SnsTopic,
} from "@dfinity/sns";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

vi.mock("$lib/api/sns-governance.api");

describe("ProposalSystemInfoSection", () => {
  fakeSnsGovernanceApi.install();

  const rootCanisterId = mockCanisterId;
  const testNervousFunctionId = 1n;
  const testNervousFunctionName = "test function";
  const nervousFunction = {
    ...nervousSystemFunctionMock,
    id: testNervousFunctionId,
    name: testNervousFunctionName,
  };

  const renderComponent = async (props) => {
    const { container } = render(ProposalSystemInfoSection, { props });

    await runResolvedPromises();

    return SnsProposalSystemInfoSectionPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    fakeSnsGovernanceApi.addNervousSystemFunctionWith({
      rootCanisterId,
      ...nervousFunction,
    });
  });

  describe("open proposal", () => {
    const testTopic: SnsTopic = { Governance: null };
    const openProposal = {
      ...createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
        proposalId: 2n,
      }),
      action: testNervousFunctionId,
      topic: [testTopic],
    } as SnsProposalData;
    const topicName = "Topic name";
    const topicDescription = "Topic description";
    const testTopicInfo: TopicInfoWithUnknown = {
      native_functions: [[nervousFunction]],
      topic: [testTopic],
      is_critical: [false],
      name: [topicName],
      description: [topicDescription],
      custom_functions: [],
    };
    const {
      rewardStatusString,
      proposer,
      proposal_creation_timestamp_seconds,
    } = mapProposalInfo({
      proposalData: openProposal,
      nsFunctions: [nervousFunction],
      topics: undefined,
    });
    const props = {
      proposalDataMap: mapProposalInfo({
        proposalData: openProposal,
        nsFunctions: [nervousFunction],
        topics: undefined,
      }),
    };

    // TODO: move to SnsProposalDetail.spec.ts
    it.skip("should load the nervous functions in the store", async () => {
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

    it("should render title", async () => {
      const po = await renderComponent(props);

      expect(await po.getTitleText()).toEqual("Proposal Details");
    });

    it("should render type info from the nervous function", async () => {
      const po = await renderComponent(props);

      expect(await po.getTypeText()).toBe(testNervousFunctionName);
    });

    it("should render topic data", async () => {
      const po = await renderComponent({
        proposalDataMap: mapProposalInfo({
          proposalData: { ...openProposal, topic: [testTopic] },
          nsFunctions: [nervousFunction],
          topics: [testTopicInfo],
        }),
      });

      expect(await po.getTopicKeyValuePairPo().isPresent()).toBe(true);
      expect((await po.getTopicKeyValuePairPo().getValueText()).trim()).toBe(
        topicName
      );
      expect((await po.getTopicKeyValuePairPo().getInfoText()).trim()).toBe(
        topicDescription
      );
    });

    it("should not render topic data when no topic in proposal", async () => {
      const po = await renderComponent({
        proposalDataMap: mapProposalInfo({
          proposalData: { ...openProposal, topic: undefined },
          nsFunctions: [nervousFunction],
          topics: [testTopicInfo],
        }),
      });

      expect(await po.getTopicKeyValuePairPo().isPresent()).toBe(false);
    });

    it("should not render topic data when no topic infos are available", async () => {
      const po = await renderComponent({
        proposalDataMap: mapProposalInfo({
          proposalData: openProposal,
          nsFunctions: [nervousFunction],
          topics: [],
        }),
      });

      expect(await po.getTopicKeyValuePairPo().isPresent()).toBe(false);
    });

    it("should render open status", async () => {
      const po = await renderComponent(props);

      expect(await po.getDecisionStatusText()).toBe(
        en.sns_status[SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN]
      );
    });

    it("should render reward status info", async () => {
      const po = await renderComponent(props);

      expect(await po.getRewardStatusText()).toBe(rewardStatusString);
    });

    it("should render created timestamp", async () => {
      const po = await renderComponent(props);

      expect(await po.getCreatedText()).toBe(
        secondsToDateTime(proposal_creation_timestamp_seconds)
      );
    });

    it("should not render any timestamps", async () => {
      const po = await renderComponent(props);

      expect(await po.getDecidedText()).toBeUndefined();
      expect(await po.getExecutedText()).toBeUndefined();
      expect(await po.getFailedText()).toBeUndefined();
    });

    it("should render proposer info", async () => {
      const po = await renderComponent(props);

      expect(await po.getProposerText()).toContain(
        shortenWithMiddleEllipsis(subaccountToHexString(proposer.id))
      );
    });
  });

  describe("adopted proposal", () => {
    const adoptedProposal = {
      ...createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED,
        proposalId: 2n,
      }),
    };
    const props = {
      proposalDataMap: mapProposalInfo({
        proposalData: adoptedProposal,
        nsFunctions: [nervousFunction],
        topics: undefined,
      }),
    };
    it("should render adopted status", async () => {
      const po = await renderComponent(props);

      expect(await po.getDecisionStatusText()).toBe(
        en.sns_status[
          SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED
        ]
      );
    });

    it("should render decided timestamp", async () => {
      const po = await renderComponent(props);

      expect(await po.getDecidedText()).toBe(
        secondsToDateTime(adoptedProposal.decided_timestamp_seconds)
      );
    });
  });

  describe("executed proposal", () => {
    const executedProposal = {
      ...createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_EXECUTED,
        proposalId: 2n,
      }),
    };
    const props = {
      proposalDataMap: mapProposalInfo({
        proposalData: executedProposal,
        nsFunctions: [nervousFunction],
        topics: undefined,
      }),
    };

    it("should render executed status", async () => {
      const po = await renderComponent(props);

      expect(await po.getDecisionStatusText()).toBe(
        en.sns_status[
          SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_EXECUTED
        ]
      );
    });

    it("should render executed timestamp", async () => {
      const po = await renderComponent(props);

      expect(await po.getExecutedText()).toBe(
        secondsToDateTime(executedProposal.executed_timestamp_seconds)
      );
    });
  });

  describe("failed proposal", () => {
    const failedProposal = {
      ...createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_FAILED,
        proposalId: 2n,
      }),
    };
    const props = {
      proposalDataMap: mapProposalInfo({
        proposalData: failedProposal,
        nsFunctions: [nervousFunction],
        topics: undefined,
      }),
    };

    it("should render failed status", async () => {
      const po = await renderComponent(props);

      expect(await po.getDecisionStatusText()).toBe(
        en.sns_status[SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_FAILED]
      );
    });

    it("should render failed timestamp", async () => {
      const po = await renderComponent(props);

      expect(await po.getFailedText()).toBe(
        secondsToDateTime(failedProposal.failed_timestamp_seconds)
      );
    });
  });
});
