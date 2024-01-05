import VotingCard from "$lib/components/proposal-detail/VotingCard/VotingCard.svelte";
import { authStore } from "$lib/stores/auth.store";
import { votingNeuronSelectStore } from "$lib/stores/vote-registration.store";
import type { CompactNeuronInfo } from "$lib/utils/neuron.utils";
import { nnsNeuronToVotingNeuron } from "$lib/utils/proposals.utils";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { VotingCardPo } from "$tests/page-objects/VotingCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { Vote, type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import { describe } from "vitest";

describe("VotingCard", () => {
  const neuron1 = {
    ...mockNeuron,
    neuronId: 111n,
    votingPower: 10_000_000_000n,
  };
  const neuron2 = {
    ...mockNeuron,
    neuronId: 222n,
    votingPower: 30_000_000_000n,
  };
  const neuron3 = {
    ...mockNeuron,
    neuronId: 333n,
    votingPower: 50_000_000_000n,
  };
  const neurons: NeuronInfo[] = [neuron1, neuron2, neuron3];
  const ballots = neurons.map(({ neuronId, votingPower }) => ({
    neuronId,
    // Ballots and neurons have different voting power
    votingPower: votingPower - 100_000_000n,
    vote: Vote.No,
  }));
  const proposalInfo = {
    ...mockProposalInfo,
    ballots,
  };
  const yesVoted: CompactNeuronInfo = {
    idString: "200",
    votingPower: 200n,
    vote: Vote.Yes,
  };

  const renderComponent = async (props = {}) => {
    const { container } = render(VotingCard, {
      props: {
        hasNeurons: true,
        visible: false,
        neuronsReady: true,
        voteRegistration: undefined,
        neuronsVotedForProposal: [yesVoted],
        ineligibleNeurons: [
          {
            neuronIdString: "111",
            reason: "since",
          },
        ],
        minSnsDissolveDelaySeconds: 100n,
        ...props,
      },
    });

    await runResolvedPromises();

    return VotingCardPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    votingNeuronSelectStore.set(
      neurons.map((neuron) =>
        nnsNeuronToVotingNeuron({ neuron, proposal: proposalInfo })
      )
    );
  });

  it("should SignIn button", async () => {
    const po = await renderComponent();

    expect(await po.getSignInButtonPo().isPresent()).toBe(true);
  });

  describe("Signed in", () => {
    beforeEach(() => {
      vi.spyOn(authStore, "subscribe").mockImplementation(
        mockAuthStoreSubscribe
      );
    });

    it("should spinner when neurons not ready", async () => {
      const po = await renderComponent({
        neuronsReady: false,
      });
      expect(await po.getSpinnerPo().isPresent()).toBe(true);
    });

    it("should hide spinner when neurons are ready", async () => {
      const po = await renderComponent({
        neuronsReady: true,
      });
      expect(await po.getSpinnerPo().isPresent()).toBe(false);
    });

    it("should display all neuron blocks", async () => {
      const po = await renderComponent();

      expect(await po.getVotableNeurons().isPresent()).toBe(true);
      expect(await po.getVotedNeurons().isPresent()).toBe(true);
      expect(await po.getIneligibleNeurons().isPresent()).toBe(true);
    });

    it("should not display votable neurons block", async () => {
      votingNeuronSelectStore.reset();
      const po = await renderComponent({});

      expect(await po.getVotableNeurons().isPresent()).toBe(false);
      expect(await po.getVotedNeurons().isPresent()).toBe(true);
      expect(await po.getIneligibleNeurons().isPresent()).toBe(true);
    });

    it("should not display voted neurons block", async () => {
      const po = await renderComponent({
        neuronsVotedForProposal: [],
      });

      expect(await po.getVotableNeurons().isPresent()).toBe(true);
      expect(await po.getVotedNeurons().isPresent()).toBe(false);
      expect(await po.getIneligibleNeurons().isPresent()).toBe(true);
    });

    it("should not display ineligible neurons block", async () => {
      const po = await renderComponent({
        ineligibleNeurons: [],
      });

      expect(await po.getVotableNeurons().isPresent()).toBe(true);
      expect(await po.getVotedNeurons().isPresent()).toBe(true);
      expect(await po.getIneligibleNeurons().isPresent()).toBe(false);
    });
  });
});
