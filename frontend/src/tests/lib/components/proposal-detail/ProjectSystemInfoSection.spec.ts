/**
 * @jest-environment jsdom
 */

import type { RenderResult } from "@testing-library/svelte";
import { render, waitFor } from "@testing-library/svelte";
import ProposalSystemInfoSection from "../../../../lib/components/proposal-detail/ProposalSystemInfoSection.svelte";
import { mapProposalInfo } from "../../../../lib/utils/proposals.utils";
import en from "../../../mocks/i18n.mock";
import { mockProposalInfo } from "../../../mocks/proposal.mock";

jest.mock("../../../../lib/utils/html.utils", () => ({
  sanitizeHTML: (value) => Promise.resolve(value),
}));

describe("ProposalSystemInfoSection", () => {
  let renderResult: RenderResult;

  const {
    type,
    typeDescription,
    topicDescription,
    topic,
    statusDescription,
    statusString,
    rewardStatusString,
    rewardStatusDescription,
  } = mapProposalInfo(mockProposalInfo);

  beforeEach(() => {
    renderResult = render(ProposalSystemInfoSection, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });
  });

  it("should render type title", () => {
    const { container } = renderResult;
    expect(container.querySelector("h1")).not.toBeNull();
    expect(container.querySelector("h1")?.textContent).toEqual(type);
  });

  const expectRenderedInfo = async ({
    label,
    value,
    description,
    testId,
  }: {
    label: string;
    value: string | undefined;
    description: string | undefined;
    testId: string;
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

  it("should render type info", async () =>
    await expectRenderedInfo({
      label: en.proposal_detail.type_prefix,
      value: type,
      description: typeDescription,
      testId: "proposal-system-info-type",
    }));

  it("should render topic info", async () =>
    await expectRenderedInfo({
      label: en.proposal_detail.topic_prefix,
      value: topic,
      description: topicDescription,
      testId: "proposal-system-info-topic",
    }));

  it("should render status info", async () =>
    await expectRenderedInfo({
      label: en.proposal_detail.status_prefix,
      value: statusString,
      description: statusDescription,
      testId: "proposal-system-info-status",
    }));

  it("should render reward status info", async () =>
    await expectRenderedInfo({
      label: en.proposal_detail.reward_prefix,
      value: rewardStatusString,
      description: rewardStatusDescription,
      testId: "proposal-system-info-reward",
    }));
});
