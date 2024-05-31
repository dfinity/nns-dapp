import {
  compareByDissolveDelay,
  compareById,
  compareByStake,
  sortNeurons,
} from "$lib/utils/neurons-table.utils";
import { mockTableNeuron } from "$tests/mocks/neurons.mock";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";

describe("neurons-table.utils", () => {
  const makeStake = (amount: bigint) =>
    TokenAmountV2.fromUlps({
      amount,
      token: ICPToken,
    });

  const neurons = [
    {
      ...mockTableNeuron,
      neuronId: "9",
      stake: makeStake(100_000_000n),
      dissolveDelaySeconds: 8640000n,
    },
    {
      ...mockTableNeuron,
      neuronId: "88",
      stake: makeStake(300_000_000n),
      dissolveDelaySeconds: 864000n,
    },
    {
      ...mockTableNeuron,
      neuronId: "10",
      stake: makeStake(200_000_000n),
      dissolveDelaySeconds: 86400000n,
    },
    {
      ...mockTableNeuron,
      neuronId: "777",
      stake: makeStake(100_000_000n),
      dissolveDelaySeconds: 86400000n,
    },
    {
      ...mockTableNeuron,
      neuronId: "200",
      stake: makeStake(300_000_000n),
      dissolveDelaySeconds: 864000n,
    },
    {
      ...mockTableNeuron,
      neuronId: "11111",
      stake: makeStake(200_000_000n),
      dissolveDelaySeconds: 8640000n,
    },
    {
      ...mockTableNeuron,
      neuronId: "3000",
      stake: makeStake(200_000_000n),
      dissolveDelaySeconds: 8640000n,
    },
  ];

  it("should sort neurons by decreasing stake", () => {
    expect(
      sortNeurons({ neurons, order: [compareByStake] }).map((neuron) =>
        neuron.stake.toUlps()
      )
    ).toEqual([
      300_000_000n,
      300_000_000n,
      200_000_000n,
      200_000_000n,
      200_000_000n,
      100_000_000n,
      100_000_000n,
    ]);
  });

  it("should sort neurons by decreasing dissolve delay", () => {
    expect(
      sortNeurons({ neurons, order: [compareByDissolveDelay] }).map(
        (neuron) => neuron.dissolveDelaySeconds
      )
    ).toEqual([
      86400000n,
      86400000n,
      8640000n,
      8640000n,
      8640000n,
      864000n,
      864000n,
    ]);
  });

  it("should sort neurons by increasing neuron ID", () => {
    expect(
      sortNeurons({ neurons, order: [compareById] }).map(
        (neuron) => neuron.neuronId
      )
    ).toEqual(["9", "10", "88", "200", "777", "3000", "11111"]);
  });

  it("should sort neurons by stake, then dissolve delay, then ID", () => {
    expect(
      sortNeurons({
        neurons,
        order: [compareByStake, compareByDissolveDelay, compareById],
      }).map((neuron) => [
        neuron.stake.toUlps(),
        neuron.dissolveDelaySeconds,
        neuron.neuronId,
      ])
    ).toEqual([
      [300_000_000n, 864000n, "88"],
      [300_000_000n, 864000n, "200"],
      [200_000_000n, 86400000n, "10"],
      [200_000_000n, 8640000n, "3000"],
      [200_000_000n, 8640000n, "11111"],
      [100_000_000n, 86400000n, "777"],
      [100_000_000n, 8640000n, "9"],
    ]);
  });
});
