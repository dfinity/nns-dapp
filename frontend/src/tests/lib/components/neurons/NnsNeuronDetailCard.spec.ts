import NnsNeuronDetailCard from "$lib/components/neurons/NnsNeuronDetailCard.svelte";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronDetailCardPo } from "$tests/page-objects/NnsNeuronDetailCard.page-object";
import { VitestPageObjectElement } from "$tests/page-objects/vitest.page-object";
import { render } from "@testing-library/svelte";

describe("NnsNeuronDetailCard", () => {
  const renderComponent = (neuron) => {
    const { container } = render(NnsNeuronDetailCard, { neuron });
    return NnsNeuronDetailCardPo.under({
      element: new VitestPageObjectElement(container),
    });
  };

  it("should render neuron id", async () => {
    const po = renderComponent({
      ...mockNeuron,
      neuronId: BigInt(123789),
    });

    expect(await po.getNeuronId()).toBe("123789");
  });

  it("should render neuron stake", async () => {
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        cachedNeuronStake: BigInt(3_000_000_000),
        neuronFees: BigInt(1_000_000_000),
      },
    });

    expect(await po.getStake()).toBe("20.00 ICP");
  });

  it("should render neuron dissolve delay", async () => {
    const po = renderComponent({
      ...mockNeuron,
      dissolveDelaySeconds: BigInt(180 * 24 * 3600),
    });

    expect(await po.getDissolveDelay()).toBe("180 days");
  });

  it("should render neuron age", async () => {
    const po = renderComponent({
      ...mockNeuron,
      ageSeconds: BigInt(90.5 * 24 * 3600),
    });

    expect(await po.getAge()).toBe("90 days, 12 hours");
  });

  it("should render neuron voting power", async () => {
    const po = renderComponent({
      ...mockNeuron,
      votingPower: BigInt(3_000_000_000),
    });

    expect(await po.getVotingPower()).toBe("30.00");
  });

  it("should render neuron maturiry", async () => {
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        maturityE8sEquivalent: BigInt(300_000_000),
        stakedMaturityE8sEquivalent: BigInt(500_000_000),
      },
    });

    expect(await po.getMaturity()).toBe("8.00");
  });

  it("should render neuron staked maturiry", async () => {
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        maturityE8sEquivalent: BigInt(300_000_000),
        stakedMaturityE8sEquivalent: BigInt(500_000_000),
      },
    });

    expect(await po.getStakedMaturity()).toBe("5.00");
  });
});
