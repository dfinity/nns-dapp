/**
 * @jest-environment jsdom
 */

import { Topic } from "@dfinity/nns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import ProposalMeta from "../../../../../lib/components/proposal-detail/ProposalDetailCard/ProposalMeta.svelte";
import * as en from "../../../../../lib/i18n/en.json";
import { mockProposalInfo } from "../../../../mocks/proposal.mock";

describe("ProposalMeta", () => {
  const props = {
    proposalInfo: mockProposalInfo,
  };

  it("should render proposal url", () => {
    const { getByText } = render(ProposalMeta, {
      props,
    });
    expect(getByText("url").getAttribute("href")).toBe("url");
  });

  it("should render proposer id", () => {
    const { getByText } = render(ProposalMeta, {
      props,
    });
    expect(
      getByText(new RegExp(`${mockProposalInfo.proposer?.toString()}$`))
    ).toBeInTheDocument();
  });

  it("should render topic", () => {
    const { getByText } = render(ProposalMeta, {
      props,
    });
    expect(
      getByText(new RegExp(`${en.topics[Topic[mockProposalInfo.topic]]}$`))
    ).toBeInTheDocument();
  });

  it("should render id", () => {
    const { getByText } = render(ProposalMeta, {
      props,
    });
    expect(
      getByText(new RegExp(`${mockProposalInfo.id?.toString()}$`))
    ).toBeInTheDocument();
  });

  it("should open proposer modal", async () => {
    const { container } = render(ProposalMeta, {
      props,
    });

    const button = container.querySelector("button.text");
    expect(button).not.toBeNull();
    button && (await fireEvent.click(button));

    await waitFor(() =>
      expect(container.querySelector("div.modal")).not.toBeNull()
    );
  });
});
