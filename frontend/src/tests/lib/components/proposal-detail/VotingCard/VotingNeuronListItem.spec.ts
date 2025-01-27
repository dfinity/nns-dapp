import VotingNeuronListItem from "$lib/components/proposal-detail/VotingCard/VotingNeuronListItem.svelte";
import type { VotingNeuron } from "$lib/types/proposals";
import { nnsNeuronToVotingNeuron } from "$lib/utils/proposals.utils";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { VotingNeuronListItemPo } from "$tests/page-objects/VotingNeuronListItem.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("VotingNeuronListItem", () => {
  const createVotingNeuron = ({
    neuronId = 1n,
    votingPower = 100_000_000n,
  }: {
    neuronId?: bigint;
    votingPower?: bigint;
  }): VotingNeuron => {
    return nnsNeuronToVotingNeuron({
      neuron: {
        ...mockNeuron,
        neuronId,
        decidingVotingPower: votingPower,
      },
      proposal: mockProposalInfo,
    });
  };

  const renderComponent = ({
    votingNeuron,
    disabled = false,
    toggleSelection = () => undefined,
  }: {
    votingNeuron: VotingNeuron;
    disabled?: boolean;
    toggleSelection?: (neuronId: string) => void;
  }) => {
    const { container } = render(VotingNeuronListItem, {
      neuron: votingNeuron,
      disabled,
      toggleSelection,
    });
    return VotingNeuronListItemPo.under(new JestPageObjectElement(container));
  };

  it("should render neuron ID", async () => {
    const neuronId = 1133n;

    const votingNeuron = createVotingNeuron({ neuronId });

    const po = renderComponent({
      votingNeuron,
    });

    expect(await po.getNeuronId()).toBe("1133");
  });

  it("should shorten neuron ID with ellipses", async () => {
    const neuronId = 1234567890123456789012345678901234567890n;

    const votingNeuron = createVotingNeuron({ neuronId });

    const po = renderComponent({
      votingNeuron,
    });

    expect(await po.getNeuronId()).toBe("12345678901234...78901234567890");
  });

  it("should call toggleSelection when checkbox is clicked", async () => {
    const neuronId = 1133n;

    const votingNeuron = createVotingNeuron({ neuronId });
    const toggleSelection = vi.fn();

    const po = renderComponent({
      votingNeuron,
      toggleSelection,
    });

    expect(toggleSelection).not.toBeCalled();

    expect(await po.getCheckboxPo().isDisabled()).toBe(false);
    await po.getCheckboxPo().click();

    expect(toggleSelection).toBeCalledWith("1133");
    expect(toggleSelection).toBeCalledTimes(1);
  });

  it("should disable checkbox", async () => {
    const votingNeuron = createVotingNeuron({});

    const po = renderComponent({
      votingNeuron,
      disabled: true,
    });

    expect(await po.getCheckboxPo().isDisabled()).toBe(true);
  });

  it("should render voting power", async () => {
    const votingPower = 123_000_000n;

    const votingNeuron = createVotingNeuron({ votingPower });

    const po = renderComponent({
      votingNeuron,
    });

    expect(await po.getDisplayedVotingPower()).toBe("1.23");
  });

  it("should round voting power", async () => {
    const votingPower = 123_456_000n;

    const votingNeuron = createVotingNeuron({ votingPower });

    const po = renderComponent({
      votingNeuron,
    });

    expect(await po.getDisplayedVotingPower()).toBe("1.23");
  });

  it("should have tooltip with exact voting power", async () => {
    const votingPower = 123_456_000n;

    const votingNeuron = createVotingNeuron({ votingPower });

    const po = renderComponent({
      votingNeuron,
    });

    expect(await po.getVotingPowerDisplayPo().getTooltipText()).toBe(
      "1.23456000"
    );
  });
});
