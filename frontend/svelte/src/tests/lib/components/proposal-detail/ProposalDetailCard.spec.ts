/**
 * @jest-environment jsdom
 */

import { render, RenderResult } from "@testing-library/svelte";
import ProposalDetailCard from "../../../../lib/components/proposal-detail/ProposalDetailCard.svelte";
import {
  proposalActionFields,
  proposalFirstActionKey,
} from "../../../../lib/utils/proposals.utils";
import { mockProposalInfo } from "../../../mocks/proposal.mock";

const en = require("../../../../lib/i18n/en.json");

describe("ProposalDetailCard", () => {
  let renderResult: RenderResult;

  beforeEach(() => {
    renderResult = render(ProposalDetailCard, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });
  });

  it("should render title", () => {
    const { getByText, container } = renderResult;
    expect(getByText("title")).toBeInTheDocument();
  });

  it("should render status", () => {
    const { getByText } = renderResult;
    expect(getByText("Rejected")).toBeInTheDocument();
  });

  it("should render summary", () => {
    const { getByText } = renderResult;
    expect(getByText("summary")).toBeInTheDocument();
  });

  it("should render summary", () => {
    const { getByText } = renderResult;
    expect(getByText("summary")).toBeInTheDocument();
  });

  it("should render proposal url", () => {
    const { getByText } = renderResult;
    expect(getByText("url").getAttribute("href")).toBe("url");
  });

  it("should render proposer id", () => {
    const { getByText } = renderResult;
    expect(
      getByText(new RegExp(`${mockProposalInfo.proposer.toString()}$`))
    ).toBeInTheDocument();
  });

  it("should render topic", () => {
    const { getByText } = renderResult;
    expect(
      getByText(new RegExp(`${en.topics[mockProposalInfo.topic]}$`))
    ).toBeInTheDocument();
  });

  it.only("should render id", () => {
    const { getByText } = renderResult;
    expect(
      getByText(new RegExp(`${mockProposalInfo.id.toString()}$`))
    ).toBeInTheDocument();
  });

  it("should render action key", () => {
    const { getByText } = renderResult;
    const key = proposalFirstActionKey(mockProposalInfo.proposal);
    expect(getByText(key)).toBeInTheDocument();
  });

  it("should render action fields", () => {
    const { getByText } = renderResult;
    const fields = proposalActionFields(mockProposalInfo.proposal);
    for (const [key, value] of fields) {
      expect(getByText(key)).toBeInTheDocument();
      expect(getByText(key).nextElementSibling.textContent).toBe(value);
    }
  });
});
