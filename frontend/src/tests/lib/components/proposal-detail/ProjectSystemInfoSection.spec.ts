/**
 * @jest-environment jsdom
 */

import type { RenderResult } from "@testing-library/svelte";
import { render, waitFor } from "@testing-library/svelte";
import ProposalSystemInfoSection from "../../../../lib/components/proposal-detail/ProposalSystemInfoSection.svelte";
import { secondsToDateTime } from "../../../../lib/utils/date.utils";
import { mapProposalInfo } from "../../../../lib/utils/proposals.utils";
import en from "../../../mocks/i18n.mock";
import { mockProposalInfo } from "../../../mocks/proposal.mock";

describe("ProposalSystemInfoSection", () => {
  const {
    type,
    typeDescription,
    topicDescription,
    topic,
    statusDescription,
    statusString,
    rewardStatusString,
    rewardStatusDescription,
    proposer,
  } = mapProposalInfo(mockProposalInfo);

  it("should render type title", () => {
    const renderResult = render(ProposalSystemInfoSection, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });

    const { container } = renderResult;
    expect(container.querySelector("h1")).not.toBeNull();
    expect(container.querySelector("h1")?.textContent).toEqual(type);
  });

  const expectRenderedInfo = async ({
    label,
    value,
    description,
    testId,
    renderResult,
  }: {
    label: string;
    value: string | undefined;
    description: string | undefined;
    testId: string;
    renderResult: RenderResult;
  }) => {
    const { getByText, getByTestId } = renderResult;
    expect(getByText(label)).toBeInTheDocument();

    expect(value).not.toBeUndefined();
    expect(description).not.toBeUndefined();

    await waitFor(() =>
      expect(getByTestId(`${testId}-value`)?.textContent).toEqual(value)
    );
    await waitFor(() =>
      expect(getByTestId(`${testId}-description`)?.textContent).toEqual(
        description
      )
    );
  };

  it("should render type info", async () => {
    const renderResult = render(ProposalSystemInfoSection, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });

    await expectRenderedInfo({
      renderResult,
      label: en.proposal_detail.type_prefix,
      value: type,
      description: typeDescription,
      testId: "proposal-system-info-type",
    });
  });

  it("should render topic info", async () => {
    const renderResult = render(ProposalSystemInfoSection, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });

    await expectRenderedInfo({
      renderResult,
      label: en.proposal_detail.topic_prefix,
      value: topic,
      description: topicDescription,
      testId: "proposal-system-info-topic",
    });
  });

  it("should render status info", async () => {
    const renderResult = render(ProposalSystemInfoSection, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });

    await expectRenderedInfo({
      renderResult,
      label: en.proposal_detail.status_prefix,
      value: statusString,
      description: statusDescription,
      testId: "proposal-system-info-status",
    });
  });

  it("should render reward status info", async () => {
    const renderResult = render(ProposalSystemInfoSection, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });

    await expectRenderedInfo({
      renderResult,
      label: en.proposal_detail.reward_prefix,
      value: rewardStatusString,
      description: rewardStatusDescription,
      testId: "proposal-system-info-reward",
    });
  });

  const timestampSeconds = (): bigint =>
    BigInt(Math.round(new Date().getTime() / 1000 + 10000));

  it("should render created timestamp", async () => {
    const proposalTimestampSeconds = timestampSeconds();
    const renderResult = render(ProposalSystemInfoSection, {
      props: {
        proposalInfo: {
          ...mockProposalInfo,
          proposalTimestampSeconds,
        },
      },
    });

    await expectRenderedInfo({
      renderResult,
      label: en.proposal_detail.created_prefix,
      value: secondsToDateTime(proposalTimestampSeconds),
      description: en.proposal_detail.created_description,
      testId: "proposal-system-info-created",
    });
  });

  it("should not render any timestamps", async () => {
    const renderResult = render(ProposalSystemInfoSection, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });

    const { getByTestId } = renderResult;

    expect(() => getByTestId(`proposal-system-info-created-value`)).toThrow();
    expect(() => getByTestId(`proposal-system-info-decided-value`)).toThrow();
    expect(() => getByTestId(`proposal-system-info-executed-value`)).toThrow();
    expect(() => getByTestId(`proposal-system-info-failed-value`)).toThrow();
  });

  it("should render decided timestamp", async () => {
    const decidedTimestampSeconds = timestampSeconds();
    const renderResult = render(ProposalSystemInfoSection, {
      props: {
        proposalInfo: {
          ...mockProposalInfo,
          decidedTimestampSeconds,
        },
      },
    });

    await expectRenderedInfo({
      renderResult,
      label: en.proposal_detail.decided_prefix,
      value: secondsToDateTime(decidedTimestampSeconds),
      description: en.proposal_detail.decided_description,
      testId: "proposal-system-info-decided",
    });
  });

  it("should render executed timestamp", async () => {
    const executedTimestampSeconds = timestampSeconds();
    const renderResult = render(ProposalSystemInfoSection, {
      props: {
        proposalInfo: {
          ...mockProposalInfo,
          executedTimestampSeconds,
        },
      },
    });

    await expectRenderedInfo({
      renderResult,
      label: en.proposal_detail.executed_prefix,
      value: secondsToDateTime(executedTimestampSeconds),
      description: en.proposal_detail.executed_description,
      testId: "proposal-system-info-executed",
    });
  });

  it("should render failed timestamp", async () => {
    const failedTimestampSeconds = timestampSeconds();
    const renderResult = render(ProposalSystemInfoSection, {
      props: {
        proposalInfo: {
          ...mockProposalInfo,
          failedTimestampSeconds,
        },
      },
    });

    await expectRenderedInfo({
      renderResult,
      label: en.proposal_detail.failed_prefix,
      value: secondsToDateTime(failedTimestampSeconds),
      description: en.proposal_detail.failed_description,
      testId: "proposal-system-info-failed",
    });
  });

  it("should render proposer info", async () => {
    const renderResult = render(ProposalSystemInfoSection, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });

    await expectRenderedInfo({
      renderResult,
      label: en.proposal_detail.proposer_prefix,
      value: `${proposer}`,
      description: en.proposal_detail.proposer_description,
      testId: "proposal-system-info-proposer",
    });
  });

  it("should not render proposer if no defined", async () => {
    const renderResult = render(ProposalSystemInfoSection, {
      props: {
        proposalInfo: {
          ...mockProposalInfo,
          proposer: undefined,
        },
      },
    });

    const { getByTestId } = renderResult;

    expect(() => getByTestId(`proposal-system-info-proposer-value`)).toThrow();
  });
});
