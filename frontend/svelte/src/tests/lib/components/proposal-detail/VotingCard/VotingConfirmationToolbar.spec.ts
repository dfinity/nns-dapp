/**
 * @jest-environment jsdom
 */

import { Vote } from "@dfinity/nns";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import VotingConfirmationToolbar from "../../../../../lib/components/proposal-detail/VotingCard/VotingConfirmationToolbar.svelte";
import { E8S_PER_ICP } from "../../../../../lib/constants/icp.constants";
import { votingNeuronSelectStore } from "../../../../../lib/stores/proposals.store";
import { formatVotingPower } from "../../../../../lib/utils/proposals.utils";
import { neuronMock } from "../../../../mocks/neurons.mock";

describe("VotingConfirmationToolbar", () => {
  const votingPower = BigInt(100 * E8S_PER_ICP);
  const neuron = {
    ...neuronMock,
    neuronId: BigInt(111),
    votingPower,
  };

  beforeEach(() => {
    votingNeuronSelectStore.set([neuron]);
  });

  it("should disable buttons if nothing is selected", () => {
    const { container } = render(VotingConfirmationToolbar);
    votingNeuronSelectStore.toggleSelection(neuron.neuronId);
    waitFor(() =>
      expect(
        container.querySelectorAll('[data-tid="vote-yes"][disabled]')
      ).toBeInTheDocument()
    );
    waitFor(() =>
      expect(
        container.querySelectorAll('[data-tid="vote-no"][disabled]')
      ).toBeInTheDocument()
    );
  });

  it("should display Vote.YES modal", () => {
    const { container } = render(VotingConfirmationToolbar);
    fireEvent.click(
      container.querySelector('[data-tid="vote-yes"]') as Element
    );
    waitFor(() =>
      expect(
        container.querySelector('[data-tid="thumb-up"]')
      ).toBeInTheDocument()
    );
  });

  it("should display Vote.NO modal", () => {
    const { container } = render(VotingConfirmationToolbar);
    fireEvent.click(container.querySelector('[data-tid="vote-no"]') as Element);
    waitFor(() =>
      expect(
        container.querySelector('[data-tid="thumb-down"]')
      ).toBeInTheDocument()
    );
  });

  it('should display "total" in modal', () => {
    const { getByText, container } = render(VotingConfirmationToolbar);
    fireEvent.click(
      container.querySelector('[data-tid="vote-yes"]') as Element
    );
    waitFor(() =>
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
    fireEvent.click(
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
    let calledVoteType: Vote = Vote.UNSPECIFIED;
    const onConfirm = jest.fn((ev) => (calledVoteType = ev?.detail?.voteType));
    component.$on("nnsConfirm", onConfirm);

    fireEvent.click(container.querySelector('[data-tid="vote-no"]') as Element);
    await waitFor(() => container.querySelector('[data-tid="confirm-yes"]'));
    fireEvent.click(
      container.querySelector('[data-tid="confirm-yes"]') as Element
    );
    await waitFor(() =>
      expect(
        container.querySelector('[data-tid="confirm-no"]')
      ).not.toBeInTheDocument()
    );
    expect(onConfirm).toBeCalled();
    expect(calledVoteType).toBe(Vote.NO);
  });
});
