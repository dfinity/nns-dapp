import NeuronsTable from "$lib/components/neurons/NeuronsTable/NeuronsTable.svelte";
import {
  SECONDS_IN_DAY,
  SECONDS_IN_EIGHT_YEARS,
  SECONDS_IN_MONTH,
  SECONDS_IN_YEAR,
} from "$lib/constants/constants";
import type { TableNeuron } from "$lib/types/neurons-table";
import { mockTableNeuron } from "$tests/mocks/neurons.mock";
import { NeuronsTablePo } from "$tests/page-objects/NeuronsTable.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { NeuronState } from "@dfinity/nns";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";

describe("NeuronsTable", () => {
  const makeStake = (amount: bigint) =>
    TokenAmountV2.fromUlps({
      amount,
      token: ICPToken,
    });

  const neuron1: TableNeuron = {
    ...mockTableNeuron,
    rowHref: "/neurons/10",
    domKey: "10",
    neuronId: "10",
    stake: makeStake(1_300_000_000n),
    dissolveDelaySeconds: BigInt(6 * SECONDS_IN_MONTH),
    state: NeuronState.Dissolving,
  };

  const neuron2: TableNeuron = {
    ...mockTableNeuron,
    rowHref: "/neurons/99",
    domKey: "99",
    neuronId: "99",
    stake: makeStake(500_000_000n),
    dissolveDelaySeconds: BigInt(SECONDS_IN_EIGHT_YEARS),
    state: NeuronState.Locked,
  };

  const neuron3: TableNeuron = {
    ...mockTableNeuron,
    rowHref: "/neurons/200",
    domKey: "200",
    neuronId: "200",
    stake: makeStake(500_000_000n),
    dissolveDelaySeconds: BigInt(SECONDS_IN_YEAR),
    state: NeuronState.Dissolving,
  };

  const neuron4: TableNeuron = {
    ...mockTableNeuron,
    rowHref: "/neurons/1111",
    domKey: "1111",
    neuronId: "1111",
    stake: makeStake(500_000_000n),
    dissolveDelaySeconds: BigInt(SECONDS_IN_YEAR),
    state: NeuronState.Locked,
  };

  const spawningNeuron: TableNeuron = {
    ...mockTableNeuron,
    domKey: "101",
    neuronId: "101",
    stake: TokenAmountV2.fromUlps({
      amount: 300_000_000n,
      token: ICPToken,
    }),
    dissolveDelaySeconds: BigInt(5 * SECONDS_IN_DAY),
    state: NeuronState.Spawning,
  };

  const renderComponent = ({ neurons }) => {
    const { container } = render(NeuronsTable, {
      neurons,
    });
    return NeuronsTablePo.under(new JestPageObjectElement(container));
  };

  it("should render headers", async () => {
    const po = renderComponent({ neurons: [neuron1, neuron2] });
    expect(await po.getColumnHeaders()).toEqual([
      "Neuron ID",
      "Stake",
      "State",
      "Dissolve Delay",
      "", // No header for actions column.
    ]);
  });

  it("should render neuron URL", async () => {
    const po = renderComponent({ neurons: [neuron1, neuron2] });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getHref()).toBe(neuron1.rowHref);
    expect(await rowPos[1].getHref()).toBe(neuron2.rowHref);
  });

  it("should render neuron ID", async () => {
    const po = renderComponent({ neurons: [neuron1, neuron2] });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getNeuronId()).toBe(neuron1.neuronId);
    expect(await rowPos[1].getNeuronId()).toBe(neuron2.neuronId);
  });

  it("should render neuron stake", async () => {
    const po = renderComponent({ neurons: [neuron1, neuron2] });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getStake()).toBe("13.00 ICP");
    expect(await rowPos[1].getStake()).toBe("5.00 ICP");
  });

  it("should render neuron state", async () => {
    const po = renderComponent({ neurons: [neuron1, neuron2] });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getState()).toBe("Dissolving");
    expect(await rowPos[1].getState()).toBe("Locked");
  });

  it("should sort neurons", async () => {
    // Neurons passed in out of order ...
    const po = renderComponent({
      neurons: [neuron3, neuron1, neuron4, neuron2],
    });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(4);
    // ... appear in the UI in sorted order.
    expect(await rowPos[0].getNeuronId()).toBe(neuron1.neuronId);
    expect(await rowPos[1].getNeuronId()).toBe(neuron2.neuronId);
    expect(await rowPos[2].getNeuronId()).toBe(neuron3.neuronId);
    expect(await rowPos[3].getNeuronId()).toBe(neuron4.neuronId);
  });

  it("should render dissolve delay", async () => {
    const po = renderComponent({ neurons: [neuron1, neuron2] });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getDissolveDelay()).toBe("182 days, 15 hours");
    expect(await rowPos[1].getDissolveDelay()).toBe("8 years");
  });

  it("should render go-to-detail button iff there is a URL", async () => {
    const po = renderComponent({ neurons: [neuron1, spawningNeuron] });
    const rowPos = await po.getNeuronsTableRowPos();
    expect(rowPos).toHaveLength(2);
    expect(await rowPos[0].getHref()).toBe(neuron1.rowHref);
    expect(await rowPos[0].hasGoToDetailButton()).toBe(true);
    expect(await rowPos[1].getHref()).toBe(null);
    expect(await rowPos[1].hasGoToDetailButton()).toBe(false);
  });
});
