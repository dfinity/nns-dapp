/**
 * @jest-environment jsdom
 */

import { fireEvent, render, waitFor } from "@testing-library/svelte";
import ProposalSystemInfoProposerEntry from "../../../../lib/components/proposal-detail/ProposalSystemInfoProposerEntry.svelte";
import { mockProposalInfo } from "../../../mocks/proposal.mock";

describe("ProposalMeta", () => {
  jest.spyOn(console, "error").mockImplementation(jest.fn);

  const props = {
    proposer: mockProposalInfo.proposer,
  };

  // Proposer description display in tested in ProposalSystemInfoSection.spec.ts

  it("should render proposer id", () => {
    const { getByText } = render(ProposalSystemInfoProposerEntry, {
      props,
    });
    expect(
      getByText(new RegExp(`${mockProposalInfo.proposer?.toString()}$`))
    ).toBeInTheDocument();
  });

  it("should open proposer modal", async () => {
    const { container } = render(ProposalSystemInfoProposerEntry, {
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
