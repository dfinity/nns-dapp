import * as agent from "$lib/api/agent.api";
import ProposalSystemInfoProposerEntry from "$lib/components/proposal-detail/ProposalSystemInfoProposerEntry.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import type { HttpAgent } from "@dfinity/agent";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/services/neurons.services");

describe("ProposalMeta", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockReturnValue();
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  const props = {
    proposer: mockProposalInfo.proposer,
  };

  // Proposer description display in tested in ProposalSystemInfoSection.spec.ts

  it("should render proposer id", () => {
    const { queryByTestId } = render(ProposalSystemInfoProposerEntry, {
      props,
    });
    expect(
      queryByTestId("proposal-system-info-proposer-value").textContent
    ).toBe(`${mockProposalInfo.proposer?.toString().substring(0, 7)}`);
  });

  describe("signed in", () => {
    beforeEach(() => {
      resetIdentity();
    });

    it("should open proposer modal", async () => {
      const { container, getByTestId } = render(
        ProposalSystemInfoProposerEntry,
        {
          props,
        }
      );

      const button = getByTestId("proposal-system-info-proposer-value");
      expect(button).not.toBeNull();
      button && (await fireEvent.click(button));

      await waitFor(() =>
        expect(container.querySelector("div.modal")).not.toBeNull()
      );
    });
  });

  describe("not signed in", () => {
    beforeEach(() => {
      setNoIdentity();
    });

    it("should render a static proposer information", async () => {
      const { getByTestId } = render(ProposalSystemInfoProposerEntry, {
        props,
      });

      expect(
        getByTestId(
          "proposal-system-info-proposer-value"
        ).nodeName.toLowerCase()
      ).toEqual("span");
    });
  });
});
