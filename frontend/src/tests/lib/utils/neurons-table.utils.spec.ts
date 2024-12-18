import { LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import {
  compareByDissolveDelay,
  compareById,
  compareByMaturity,
  compareByStake,
  compareByState,
  tableNeuronsFromNeuronInfos,
  tableNeuronsFromSnsNeurons,
} from "$lib/utils/neurons-table.utils";
import { hexStringToBytes } from "$lib/utils/utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockAccountsStoreData } from "$tests/mocks/icp-accounts.store.mock";
import { mockNeuron, mockTableNeuron } from "$tests/mocks/neurons.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { NeuronState, type NeuronInfo } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import type { SnsNeuron } from "@dfinity/sns";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";

describe("neurons-table.utils", () => {
  const now = new Date("2022-01-01T15:26:47Z");
  const icpPrice = 10;

  const makeStake = (amount: bigint) =>
    TokenAmountV2.fromUlps({
      amount,
      token: ICPToken,
    });

  const makeUsdStake = (amount: bigint) =>
    (Number(amount) * icpPrice) / 100_000_000;

  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(now);
  });

  describe("tableNeuronsFromNeuronInfos", () => {
    const defaultDissolveDelaySeconds = 15778800n;
    const defaultStake = 500_000_000n;

    const defaultNeuronInfo: NeuronInfo = {
      ...mockNeuron,
      neuronId: 42n,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        cachedNeuronStake: defaultStake,
        maturityE8sEquivalent: 0n,
        stakedMaturityE8sEquivalent: 0n,
      },
      dissolveDelaySeconds: defaultDissolveDelaySeconds,
      state: NeuronState.Locked,
    };

    const defaultExpectedTableNeuron = {
      rowHref: "/neuron/?u=qhbym-qaaaa-aaaaa-aaafq-cai&neuron=42",
      domKey: "42",
      neuronId: "42",
      stake: makeStake(defaultStake),
      stakeInUsd: makeUsdStake(defaultStake),
      availableMaturity: 0n,
      stakedMaturity: 0n,
      dissolveDelaySeconds: defaultDissolveDelaySeconds,
      state: NeuronState.Locked,
      tags: [],
      isPublic: false,
    };

    const convert = (neuronInfos: NeuronInfo[]) =>
      tableNeuronsFromNeuronInfos({
        neuronInfos,
        identity: mockIdentity,
        accounts: mockAccountsStoreData,
        icpSwapUsdPrices: {
          [LEDGER_CANISTER_ID.toText()]: icpPrice,
        },
        i18n: en,
      });

    it("should convert default neuronInfo to tableNeuron", () => {
      const tableNeurons = convert([defaultNeuronInfo]);
      expect(tableNeurons).toEqual([defaultExpectedTableNeuron]);
    });

    it("should convert multiple neuronInfos to tableNeurons", () => {
      const neuronId1 = 42n;
      const neuronId2 = 342n;
      const stake1 = 500_000_000n;
      const stake2 = 600_000_000n;
      const neuronInfo1 = {
        ...defaultNeuronInfo,
        neuronId: neuronId1,
        fullNeuron: {
          ...defaultNeuronInfo.fullNeuron,
          cachedNeuronStake: stake1,
        },
      };
      const neuronInfo2 = {
        ...defaultNeuronInfo,
        neuronId: neuronId2,
        fullNeuron: {
          ...defaultNeuronInfo.fullNeuron,
          cachedNeuronStake: stake2,
        },
      };
      const neuronInfos = [neuronInfo1, neuronInfo2];
      const tableNeurons = convert(neuronInfos);
      expect(tableNeurons).toEqual([
        {
          ...defaultExpectedTableNeuron,
          rowHref: "/neuron/?u=qhbym-qaaaa-aaaaa-aaafq-cai&neuron=42",
          domKey: "42",
          neuronId: "42",
          stake: makeStake(stake1),
          stakeInUsd: makeUsdStake(stake1),
        },
        {
          ...defaultExpectedTableNeuron,
          rowHref: "/neuron/?u=qhbym-qaaaa-aaaaa-aaafq-cai&neuron=342",
          domKey: "342",
          neuronId: "342",
          stake: makeStake(stake2),
          stakeInUsd: makeUsdStake(stake2),
        },
      ]);
    });

    it("should convert neuronInfo stake", () => {
      const stake = 675_000_000n;
      const tableNeurons = convert([
        {
          ...defaultNeuronInfo,
          fullNeuron: {
            ...defaultNeuronInfo.fullNeuron,
            cachedNeuronStake: stake,
          },
        },
      ]);
      expect(tableNeurons).toEqual([
        {
          ...defaultExpectedTableNeuron,
          stake: makeStake(stake),
          stakeInUsd: makeUsdStake(stake),
        },
      ]);
    });

    it("should convert neuronInfo dissolve delay", () => {
      const dissolveDelaySeconds = 123_456_000n;
      const tableNeurons = convert([
        {
          ...defaultNeuronInfo,
          dissolveDelaySeconds,
        },
      ]);
      expect(tableNeurons).toEqual([
        {
          ...defaultExpectedTableNeuron,
          dissolveDelaySeconds,
        },
      ]);
    });

    it("should convert neuronInfo maturity", () => {
      const availableMaturity = 50_000_000n;
      const stakedMaturity = 60_000_000n;
      const tableNeurons = convert([
        {
          ...defaultNeuronInfo,
          fullNeuron: {
            ...defaultNeuronInfo.fullNeuron,
            maturityE8sEquivalent: availableMaturity,
            stakedMaturityE8sEquivalent: stakedMaturity,
          },
        },
      ]);
      expect(tableNeurons).toEqual([
        {
          ...defaultExpectedTableNeuron,
          availableMaturity,
          stakedMaturity,
        },
      ]);
    });

    it("should convert neuronInfo for spawning neuron without href", () => {
      const spawningNeuronInfo = {
        ...defaultNeuronInfo,
        state: NeuronState.Spawning,
        fullNeuron: {
          ...defaultNeuronInfo.fullNeuron,
          cachedNeuronStake: 0n,
          spawnAtTimesSeconds: 12_312_313n,
        },
      };
      const neuronInfos = [spawningNeuronInfo];
      const tableNeurons = convert(neuronInfos);
      expect(tableNeurons).toEqual([
        {
          ...defaultExpectedTableNeuron,
          rowHref: undefined,
          stake: makeStake(0n),
          stakeInUsd: 0,
          state: NeuronState.Spawning,
        },
      ]);
    });

    it("should convert neuronInfo for dissolved neuron", () => {
      const dissolveDelaySeconds = 0n;
      const dissolvedNeuronInfo = {
        ...defaultNeuronInfo,
        state: NeuronState.Dissolved,
        dissolveDelaySeconds,
      };
      const neuronInfos = [dissolvedNeuronInfo];
      const tableNeurons = convert(neuronInfos);
      expect(tableNeurons).toEqual([
        {
          ...defaultExpectedTableNeuron,
          dissolveDelaySeconds,
          state: NeuronState.Dissolved,
        },
      ]);
    });

    it("should convert neuronInfo for hotkey neuron", () => {
      const hotkeyNeuronInfo = {
        ...defaultNeuronInfo,
        fullNeuron: {
          ...defaultNeuronInfo.fullNeuron,
          controller: "not-hardware-wallet",
          hotKeys: [mockIdentity.getPrincipal().toText()],
        },
      };
      const tableNeurons = tableNeuronsFromNeuronInfos({
        neuronInfos: [hotkeyNeuronInfo],
        identity: mockIdentity,
        accounts: mockAccountsStoreData,
        icpSwapUsdPrices: {
          [LEDGER_CANISTER_ID.toText()]: icpPrice,
        },
        i18n: en,
      });
      expect(tableNeurons).toEqual([
        {
          ...defaultExpectedTableNeuron,
          tags: [{ text: "Hotkey control" }],
        },
      ]);
    });
  });

  describe("tableNeuronsFromSnsNeurons", () => {
    const snsUniverseIdText = "br5f7-7uaaa-aaaaa-qaaca-cai";
    const ledgerCanisterId = Principal.fromText("wxkl4-qiqaa-2q");
    const neuronIdString = "123456789abcdef0";
    const neuronId = hexStringToBytes(neuronIdString);
    const stake = 300_000n;
    const dissolveDelaySeconds = 8640000n;
    const snsTokenPrice = 0.25;

    const defaultCreateMockSnsNeuronParams = {
      id: neuronId,
      stake,
      maturity: 0n,
      stakedMaturity: 0n,
      dissolveDelaySeconds,
      state: NeuronState.Locked,
    };

    const snsNeuron = createMockSnsNeuron(defaultCreateMockSnsNeuronParams);

    const makeSnsStake = (amount: bigint) =>
      TokenAmountV2.fromUlps({
        amount,
        token: mockSnsToken,
      });

    const makeSnsUsdStake = (amount: bigint) =>
      (Number(amount) * snsTokenPrice) / 100_000_000;

    const expectedTableNeuron = {
      rowHref: "/neuron/?u=br5f7-7uaaa-aaaaa-qaaca-cai&neuron=123456789abcdef0",
      domKey: neuronIdString,
      neuronId: neuronIdString,
      stake: makeSnsStake(stake),
      stakeInUsd: makeSnsUsdStake(stake),
      availableMaturity: 0n,
      stakedMaturity: 0n,
      dissolveDelaySeconds,
      state: NeuronState.Locked,
      tags: [],
      isPublic: false,
    };

    const convert = (snsNeurons: SnsNeuron[]) =>
      tableNeuronsFromSnsNeurons({
        snsNeurons: snsNeurons,
        universe: snsUniverseIdText,
        token: mockSnsToken,
        identity: mockIdentity,
        icpSwapUsdPrices: {
          [ledgerCanisterId.toText()]: snsTokenPrice,
        },
        ledgerCanisterId,
        i18n: en,
      });

    it("should convert SnsNeuron to TableNeuron", () => {
      const snsNeurons = [snsNeuron];
      const tableNeurons = convert(snsNeurons);
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
      const tableNeurons = convert(snsNeurons);
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

    it("should convert SnsNeuron maturity", () => {
      const availableMaturity = 70_000_000n;
      const stakedMaturity = 80_000_000n;
      const snsNeurons = [
        createMockSnsNeuron({
          ...defaultCreateMockSnsNeuronParams,
          maturity: availableMaturity,
          stakedMaturity,
        }),
      ];
      const tableNeurons = convert(snsNeurons);
      expect(tableNeurons).toEqual([
        {
          ...expectedTableNeuron,
          availableMaturity,
          stakedMaturity,
        },
      ]);
    });

    it("should convert multiple neurons", () => {
      const neuronIdString2 = "fafafafafafafafa";
      const neuronId2 = hexStringToBytes(neuronIdString2);
      const snsNeuron2 = createMockSnsNeuron({
        ...defaultCreateMockSnsNeuronParams,
        id: neuronId2,
        stake,
        dissolveDelaySeconds,
      });

      const snsNeurons = [snsNeuron, snsNeuron2];
      const tableNeurons = convert(snsNeurons);
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

    it("should convert hotkey SnsNeuron", () => {
      const snsNeurons: SnsNeuron[] = [
        {
          ...snsNeuron,
          permissions: [
            {
              principal: [mockIdentity.getPrincipal()],
              permission_type: Int32Array.from(HOTKEY_PERMISSIONS),
            },
          ],
        },
      ];
      const tableNeurons = convert(snsNeurons);
      expect(tableNeurons).toEqual([
        {
          ...expectedTableNeuron,
          tags: [{ text: "Hotkey control" }],
        },
      ]);
    });
  });

  describe("compareById", () => {
    it("should sort neurons by ascending id", () => {
      const neuron1 = {
        ...mockTableNeuron,
        neuronId: "9",
      };
      const neuron2 = {
        ...mockTableNeuron,
        neuronId: "10",
      };
      const neuron3 = {
        ...mockTableNeuron,
        neuronId: "222",
      };

      expect(compareById(neuron1, neuron1)).toBe(0);
      expect(compareById(neuron1, neuron2)).toBe(-1);
      expect(compareById(neuron2, neuron3)).toBe(-1);
      expect(compareById(neuron3, neuron2)).toBe(1);
      expect(compareById(neuron2, neuron1)).toBe(1);
    });
  });

  describe("compareByStake", () => {
    it("should sort neurons by descending stake", () => {
      const makeStake = (amount: bigint) =>
        TokenAmountV2.fromUlps({
          amount,
          token: ICPToken,
        });

      const neuron1 = {
        ...mockTableNeuron,
        stake: makeStake(100_000_000n),
      };
      const neuron2 = {
        ...mockTableNeuron,
        stake: makeStake(200_000_000n),
      };

      expect(compareByStake(neuron1, neuron1)).toBe(0);
      expect(compareByStake(neuron1, neuron2)).toBe(1);
      expect(compareByStake(neuron2, neuron1)).toBe(-1);
    });
  });

  describe("compareByMaturity", () => {
    it("should sort neurons by descending maturity, with just availableMaturity", () => {
      const neuron1 = {
        ...mockTableNeuron,
        availableMaturity: 100_000_000n,
      };
      const neuron2 = {
        ...mockTableNeuron,
        availableMaturity: 200_000_000n,
      };

      expect(compareByMaturity(neuron1, neuron2)).toBe(1);
      expect(compareByMaturity(neuron2, neuron1)).toBe(-1);
    });

    it("should sort neurons by descending maturity, with just stakedMaturity", () => {
      const neuron1 = {
        ...mockTableNeuron,
        stakedMaturity: 100_000_000n,
      };
      const neuron2 = {
        ...mockTableNeuron,
        stakedMaturity: 200_000_000n,
      };

      expect(compareByMaturity(neuron1, neuron2)).toBe(1);
      expect(compareByMaturity(neuron2, neuron1)).toBe(-1);
    });

    it("should treat available and staked maturity as equivalent", () => {
      const neuron1 = {
        ...mockTableNeuron,
        availableMaturity: 200_000_000n,
        stakedMaturity: 100_000_000n,
      };
      const neuron2 = {
        ...mockTableNeuron,
        availableMaturity: 100_000_000n,
        stakedMaturity: 200_000_000n,
      };

      expect(compareByMaturity(neuron1, neuron2)).toBe(0);
      expect(compareByMaturity(neuron2, neuron1)).toBe(0);
    });
  });

  describe("compareByDissolveDelay", () => {
    it("should sort neurons by descending dissolve delay", () => {
      const neuron1 = {
        ...mockTableNeuron,
        dissolveDelaySeconds: 86400n,
      };
      const neuron2 = {
        ...mockTableNeuron,
        dissolveDelaySeconds: 8640000n,
      };

      expect(compareByDissolveDelay(neuron1, neuron1)).toBe(0);
      expect(compareByDissolveDelay(neuron1, neuron2)).toBe(1);
      expect(compareByDissolveDelay(neuron2, neuron1)).toBe(-1);
    });
  });

  describe("compareByState", () => {
    it("should sort neurons by state", () => {
      const neuron1 = {
        ...mockTableNeuron,
        state: NeuronState.Spawning,
      };
      const neuron2 = {
        ...mockTableNeuron,
        state: NeuronState.Dissolved,
      };
      const neuron3 = {
        ...mockTableNeuron,
        state: NeuronState.Dissolving,
      };
      const neuron4 = {
        ...mockTableNeuron,
        state: NeuronState.Locked,
      };

      expect(compareByState(neuron1, neuron1)).toBe(0);
      expect(compareByState(neuron1, neuron2)).toBe(1);
      expect(compareByState(neuron2, neuron3)).toBe(1);
      expect(compareByState(neuron3, neuron4)).toBe(1);
      expect(compareByState(neuron2, neuron1)).toBe(-1);
      expect(compareByState(neuron3, neuron2)).toBe(-1);
      expect(compareByState(neuron4, neuron3)).toBe(-1);
    });
  });
});
