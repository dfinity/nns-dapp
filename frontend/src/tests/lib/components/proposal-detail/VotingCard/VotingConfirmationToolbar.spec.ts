import VotingConfirmationToolbar from "$lib/components/proposal-detail/VotingCard/VotingConfirmationToolbar.svelte";
import { E8S_PER_ICP } from "$lib/constants/icp.constants";
import { votingNeuronSelectStore } from "$lib/stores/vote-registration.store";
import type { VotingNeuron } from "$lib/types/proposals";
import { formatVotingPower } from "$lib/utils/neuron.utils";
import { mockVoteRegistration } from "$tests/mocks/proposal.mock";
import { Vote } from "@dfinity/nns";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { vi } from "vitest";

describe("VotingConfirmationToolbar", () => {
  const votingPower = BigInt(100 * E8S_PER_ICP);
  const neuronIdString = `111`;

  beforeEach(() => {
    votingNeuronSelectStore.set([
      {
        neuronIdString,
        votingPower,
      } as VotingNeuron,
    ]);
  });

  it("should disable buttons if nothing is selected", async () => {
    const { container } = render(VotingConfirmationToolbar);
    votingNeuronSelectStore.toggleSelection(neuronIdString);
    await waitFor(() =>
      expect(
        container.querySelector('[data-tid="vote-yes"][disabled]')
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        container.querySelector('[data-tid="vote-no"][disabled]')
      ).toBeInTheDocument()
    );
  });

  it("should display Vote.Yes modal", async () => {
    const { container } = render(VotingConfirmationToolbar);
    fireEvent.click(
      container.querySelector('[data-tid="vote-yes"]') as Element
    );
    await waitFor(() =>
      expect(
        container.querySelector('[data-tid="thumb-up"]')
      ).toBeInTheDocument()
    );
  });

  it("should display Vote.No modal", async () => {
    const { container } = render(VotingConfirmationToolbar);
    fireEvent.click(container.querySelector('[data-tid="vote-no"]') as Element);
    await waitFor(() =>
      expect(
        container.querySelector('[data-tid="thumb-down"]')
      ).toBeInTheDocument()
    );
  });

  it("should disable Adapt/Reject buttons when voteInProgress", async () => {
    const { getByTestId } = render(VotingConfirmationToolbar, {
      props: { voteRegistration: mockVoteRegistration },
    });
    const adaptButton = getByTestId("vote-yes");
    const rejectButton = getByTestId("vote-no");

    expect(adaptButton?.getAttribute("disabled")).not.toBeNull();
    expect(rejectButton?.getAttribute("disabled")).not.toBeNull();
  });

  it('should display "total" in modal', async () => {
    const { getByText, container } = render(VotingConfirmationToolbar);
    fireEvent.click(
      container.querySelector('[data-tid="vote-yes"]') as Element
    );
    await waitFor(() =>
      expect(
        getByText(formatVotingPower(votingPower), { exact: false })
      ).toBeInTheDocument()
    );
  });

  it("should hide confirmation on cancel", async () => {
    const { container } = render(VotingConfirmationToolbar);
    fireEvent.click(
      container.querySelector('[data-tid="vote-yes"]') as Element
    );
    await waitFor(() =>
      expect(
        container.querySelector('[data-tid="confirm-no"]')
      ).toBeInTheDocument()
    );
    await fireEvent.click(
      container.querySelector('[data-tid="confirm-no"]') as Element
    );
    await waitFor(() =>
      expect(
        container.querySelector('[data-tid="confirm-no"]')
      ).not.toBeInTheDocument()
    );
  });

  it("should hide confirmation and dispatch on confirm", async () => {
    const { component, container } = render(VotingConfirmationToolbar);
    let calledVoteType: Vote = Vote.Unspecified;
    const onConfirm = vi.fn((ev) => (calledVoteType = ev?.detail?.voteType));
    component.$on("nnsConfirm", onConfirm);

    await fireEvent.click(
      container.querySelector('[data-tid="vote-no"]') as Element
    );
    await waitFor(() => container.querySelector('[data-tid="confirm-yes"]'));
    await fireEvent.click(
      container.querySelector('[data-tid="confirm-yes"]') as Element
    );
    await waitFor(() =>
      expect(
        container.querySelector('[data-tid="confirm-no"]')
      ).not.toBeInTheDocument()
    );
    expect(onConfirm).toBeCalled();
    expect(calledVoteType).toBe(Vote.No);
  });
});
