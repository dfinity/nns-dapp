/**
 * @jest-environment jsdom
 */

import { Topic } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import ProposalMeta from "../../../../../lib/components/proposal-detail/ProposalDetailCard/ProposalMeta.svelte";
import * as en from "../../../../../lib/i18n/en.json";
import { mockProposalInfo } from "../../../../mocks/proposal.mock";

describe("ProposalMeta", () => {
  it("should render proposal url", () => {
    const { getByText } = render(ProposalMeta, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });
    expect(getByText("url").getAttribute("href")).toBe("url");
  });

  it("should render proposer id", () => {
    const { getByText } = render(ProposalMeta, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });
    expect(
      getByText(new RegExp(`${mockProposalInfo.proposer?.toString()}$`))
    ).toBeInTheDocument();
  });

  it("should render topic", () => {
    const { getByText } = render(ProposalMeta, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });
    expect(
      getByText(new RegExp(`${en.topics[Topic[mockProposalInfo.topic]]}$`))
    ).toBeInTheDocument();
  });

  it("should render id", () => {
    const { getByText } = render(ProposalMeta, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });
    expect(
      getByText(new RegExp(`${mockProposalInfo.id?.toString()}$`))
    ).toBeInTheDocument();
  });
});
