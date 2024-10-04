import VotingCard from "$lib/components/proposal-detail/VotingCard/VotingCard.svelte";
import { votingNeuronSelectStore } from "$lib/stores/vote-registration.store";
import type { CompactNeuronInfo } from "$lib/utils/neuron.utils";
import { nnsNeuronToVotingNeuron } from "$lib/utils/proposals.utils";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { VotingCardPo } from "$tests/page-objects/VotingCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { Vote, type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

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
  const noVoted: CompactNeuronInfo = {
    idString: "200",
    votingPower: 200n,
    vote: Vote.No,
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

  it("should display SignIn button", async () => {
    const po = await renderComponent();

    expect(await po.getSignInButtonPo().isPresent()).toBe(true);
  });

  it("should not display voting buttons when not signed in", async () => {
    const po = await renderComponent();

    expect(await po.getVoteYesButtonPo().isPresent()).toBe(false);
    expect(await po.getVoteNoButtonPo().isPresent()).toBe(false);
  });

  describe("Signed in", () => {
    beforeEach(() => {
      resetIdentity();
    });

    it("should display voting buttons when no neurons available", async () => {
      const po = await renderComponent({
        hasNeurons: false,
        visible: true,
      });

      expect(await po.getVoteYesButtonPo().isPresent()).toBe(true);
      expect(await po.getVoteNoButtonPo().isPresent()).toBe(true);
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

    it('should not display "stake a neuron" when user has neurons', async () => {
      const po = await renderComponent();

      expect(await po.getStakeNeuronToVotePo().isPresent()).toBe(false);
    });

    it('should display "stake a neuron" when user possess no neurons', async () => {
      const po = await renderComponent({
        hasNeurons: false,
        neuronsVotedForProposal: [],
        ineligibleNeurons: [],
      });

      expect(await po.getStakeNeuronToVotePo().isPresent()).toBe(true);
    });

    describe("Voted neuron header", () => {
      it("should display ineligible neurons block", async () => {
        const po = await renderComponent({
          neuronsVotedForProposal: [yesVoted],
        });

        expect(await po.getVotedNeuronHeadlineText()).toBe("1 neuron voted");
      });

      it("should display ineligible neurons block", async () => {
        const po = await renderComponent({
          neuronsVotedForProposal: [yesVoted, noVoted],
        });

        expect(await po.getVotedNeuronHeadlineText()).toBe("2 neurons voted");
      });
    });

    describe("Ineligible neuron header", () => {
      it("should display ineligible neurons block", async () => {
        const po = await renderComponent({
          ineligibleNeurons: [
            {
              neuronIdString: "1",
              reason: "since",
            },
          ],
        });

        expect(await po.getIneligibleNeuronsHeaderText()).toBe(
          "1 Ineligible neuron"
        );
      });

      it("should display ineligible neurons block", async () => {
        const po = await renderComponent({
          ineligibleNeurons: [
            {
              neuronIdString: "1",
              reason: "since",
            },
            {
              neuronIdString: "2",
              reason: "since",
            },
          ],
        });

        expect(await po.getIneligibleNeuronsHeaderText()).toBe(
          "2 Ineligible neurons"
        );
      });
    });

    describe("Voted neurons headline state", () => {
      it("should display Yes state when all voted yes", async () => {
        const po = await renderComponent({
          neuronsVotedForProposal: [yesVoted],
        });

        expect(await po.getVotedNeuronHeadlineYesIcon().isPresent()).toBe(true);
        expect(await po.getVotedNeuronHeadlineNoIcon().isPresent()).toBe(false);
      });

      it("should display No state when all voted yes", async () => {
        const po = await renderComponent({
          neuronsVotedForProposal: [noVoted],
        });

        expect(await po.getVotedNeuronHeadlineNoIcon().isPresent()).toBe(true);
        expect(await po.getVotedNeuronHeadlineYesIcon().isPresent()).toBe(
          false
        );
      });

      it("should not display a voting state when all not voted the same", async () => {
        const po = await renderComponent({
          neuronsVotedForProposal: [yesVoted, noVoted],
        });

        expect(await po.getVotedNeuronHeadlineYesIcon().isPresent()).toBe(
          false
        );
        expect(await po.getVotedNeuronHeadlineNoIcon().isPresent()).toBe(false);
      });
    });
  });
});
