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

  const { type, typeDescription, topicDescription, topic } =
    mapProposalInfo(mockProposalInfo);

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

  it("should render type info", async () => {
    const { getByText, getByTestId } = renderResult;
    expect(getByText(en.proposal_detail.type_prefix)).toBeInTheDocument();

    expect(type).not.toBeUndefined();
    expect(typeDescription).not.toBeUndefined();

    await waitFor(() =>
      expect(getByTestId("proposal-system-info-type")?.textContent).toEqual(
        type
      )
    );
    await waitFor(() =>
      expect(
        getByTestId("proposal-system-info-type-description")?.textContent
      ).toEqual(typeDescription)
    );
  });

  it("should render topic info", async () => {
    const { getByText, getByTestId } = renderResult;
    expect(getByText(en.proposal_detail.type_prefix)).toBeInTheDocument();

    expect(topic).not.toBeUndefined();
    expect(topicDescription).not.toBeUndefined();

    await waitFor(() =>
      expect(getByTestId("proposal-system-info-topic")?.textContent).toEqual(
        topic
      )
    );
    await waitFor(() =>
      expect(
        getByTestId("proposal-system-info-topic-description")?.textContent
      ).toEqual(topicDescription)
    );
  });
});
