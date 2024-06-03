import { SECONDS_IN_DAY } from "$lib/constants/constants";
import {
  compareByDissolveDelay,
  compareById,
  compareByStake,
  sortNeurons,
  tableNeuronsFromNeuronInfos,
  tableNeuronsFromSnsNeurons,
} from "$lib/utils/neurons-table.utils";
import { hexStringToBytes } from "$lib/utils/utils";
import { mockNeuron, mockTableNeuron } from "$tests/mocks/neurons.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { NeuronState } from "@dfinity/nns";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";

describe("neurons-table.utils", () => {
  const now = new Date("2022-01-01T15:26:47Z");

  const makeStake = (amount: bigint) =>
    TokenAmountV2.fromUlps({
      amount,
      token: ICPToken,
    });

  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(now);
  });

  describe("tableNeuronsFromNeuronInfos", () => {
    it("should convert neuronInfos to tableNeurons", () => {
      const neuronId1 = 42n;
      const neuronId2 = 342n;
      const stake1 = 500_000_000n;
      const stake2 = 600_000_000n;
      const dissolveDelay1 = 15778800n;
      const dissolveDelay2 = 252460800n;
      const neuronInfo1 = {
        ...mockNeuron,
        neuronId: neuronId1,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          cachedNeuronStake: stake1,
        },
        dissolveDelaySeconds: dissolveDelay1,
        state: NeuronState.Locked,
      };
      const neuronInfo2 = {
        ...mockNeuron,
        neuronId: neuronId2,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          cachedNeuronStake: stake2,
        },
        dissolveDelaySeconds: dissolveDelay2,
        state: NeuronState.Dissolving,
      };
      const neuronInfos = [neuronInfo1, neuronInfo2];
      const tableNeurons = tableNeuronsFromNeuronInfos(neuronInfos);
      expect(tableNeurons).toEqual([
        {
          rowHref: "/neuron/?u=qhbym-qaaaa-aaaaa-aaafq-cai&neuron=42",
          domKey: "42",
          neuronId: "42",
          stake: makeStake(500_000_000n),
          dissolveDelaySeconds: dissolveDelay1,
          state: NeuronState.Locked,
        },
        {
          rowHref: "/neuron/?u=qhbym-qaaaa-aaaaa-aaafq-cai&neuron=342",
          domKey: "342",
          neuronId: "342",
          stake: makeStake(600_000_000n),
          dissolveDelaySeconds: dissolveDelay2,
          state: NeuronState.Dissolving,
        },
      ]);
    });

    it("should convert neuronInfo for spawning neuron without href", () => {
      const neuronId = 52n;
      const dissolveDelaySeconds = BigInt(5 * SECONDS_IN_DAY);
      const spawningNeuronInfo = {
        ...mockNeuron,
        neuronId: neuronId,
        state: NeuronState.Spawning,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          cachedNeuronStake: 0n,
          spawnAtTimesSeconds: 12_312_313n,
        },
        dissolveDelaySeconds,
      };
      const neuronInfos = [spawningNeuronInfo];
      const tableNeurons = tableNeuronsFromNeuronInfos(neuronInfos);
      expect(tableNeurons).toEqual([
        {
          domKey: "52",
          neuronId: "52",
          stake: makeStake(0n),
          dissolveDelaySeconds,
          state: NeuronState.Spawning,
        },
      ]);
    });

    it("should convert neuronInfo for dissolved neuron", () => {
      const neuronId = 53n;
      const stake = 400_000_000n;
      const dissolveDelaySeconds = 0n;
      const dissolvedNeuronInfo = {
        ...mockNeuron,
        neuronId: neuronId,
        state: NeuronState.Dissolved,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          cachedNeuronStake: stake,
        },
        dissolveDelaySeconds,
      };
      const neuronInfos = [dissolvedNeuronInfo];
      const tableNeurons = tableNeuronsFromNeuronInfos(neuronInfos);
      expect(tableNeurons).toEqual([
        {
          rowHref: "/neuron/?u=qhbym-qaaaa-aaaaa-aaafq-cai&neuron=53",
          domKey: "53",
          neuronId: "53",
          stake: makeStake(stake),
          dissolveDelaySeconds,
          state: NeuronState.Dissolved,
        },
      ]);
    });
  });

  describe("tableNeuronsFromSnsNeurons", () => {
    const snsUniverseIdText = "br5f7-7uaaa-aaaaa-qaaca-cai";
    const neuronIdString = "123456789abcdef0";
    const neuronId = hexStringToBytes(neuronIdString);
    const stake = 300_000n;
    const dissolveDelaySeconds = 8640000n;

    const defaultCreateMockSnsNeuronParams = {
      id: neuronId,
      stake,
      dissolveDelaySeconds,
      state: NeuronState.Locked,
    };

    const snsNeuron = createMockSnsNeuron(defaultCreateMockSnsNeuronParams);

    const makeSnsStake = (amount: bigint) =>
      TokenAmountV2.fromUlps({
        amount,
        token: mockSnsToken,
      });

    const expectedTableNeuron = {
      rowHref: "/neuron/?u=br5f7-7uaaa-aaaaa-qaaca-cai&neuron=123456789abcdef0",
      domKey: neuronIdString,
      neuronId: neuronIdString,
      stake: makeSnsStake(stake),
      dissolveDelaySeconds,
      state: NeuronState.Locked,
    };

    it("should convert SnsNeuron to TableNeuron", () => {
      const snsNeurons = [snsNeuron];
      const tableNeurons = tableNeuronsFromSnsNeurons({
        universe: snsUniverseIdText,
        token: mockSnsToken,
        snsNeurons: snsNeurons,
      });
      expect(tableNeurons).toEqual([expectedTableNeuron]);
    });

    it("should convert SnsNeuron state to TableNeuron", () => {
      const snsNeurons = [
        createMockSnsNeuron({
          ...defaultCreateMockSnsNeuronParams,
          state: NeuronState.Locked,
        }),
        createMockSnsNeuron({
          ...defaultCreateMockSnsNeuronParams,
          whenDissolvedTimestampSeconds:
            BigInt(Math.floor(now.getTime() / 1000)) + dissolveDelaySeconds,
          state: NeuronState.Dissolving,
        }),
        createMockSnsNeuron({
          ...defaultCreateMockSnsNeuronParams,
          dissolveDelaySeconds: 0n,
          state: NeuronState.Dissolved,
        }),
      ];
      const tableNeurons = tableNeuronsFromSnsNeurons({
        universe: snsUniverseIdText,
        token: mockSnsToken,
        snsNeurons: snsNeurons,
      });
      expect(tableNeurons).toEqual([
        {
          ...expectedTableNeuron,
          state: NeuronState.Locked,
        },
        {
          ...expectedTableNeuron,
          state: NeuronState.Dissolving,
        },
        {
          ...expectedTableNeuron,
          dissolveDelaySeconds: 0n,
          state: NeuronState.Dissolved,
        },
      ]);
    });

    it("should convert multiple neurons", () => {
      const neuronIdString2 = "fafafafafafafafa";
      const neuronId2 = hexStringToBytes(neuronIdString2);
      const snsNeuron2 = createMockSnsNeuron({
        id: neuronId2,
        stake,
        dissolveDelaySeconds,
      });

      const snsNeurons = [snsNeuron, snsNeuron2];
      const tableNeurons = tableNeuronsFromSnsNeurons({
        universe: snsUniverseIdText,
        token: mockSnsToken,
        snsNeurons: snsNeurons,
      });
      expect(tableNeurons).toEqual([
        expectedTableNeuron,
        {
          ...expectedTableNeuron,
          rowHref:
            "/neuron/?u=br5f7-7uaaa-aaaaa-qaaca-cai&neuron=fafafafafafafafa",
          domKey: neuronIdString2,
          neuronId: neuronIdString2,
        },
      ]);
    });
  });

  describe("sortNeurons", () => {
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
});
