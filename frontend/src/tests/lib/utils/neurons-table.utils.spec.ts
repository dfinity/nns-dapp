import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import {
  tableNeuronsFromNeuronInfos,
  tableNeuronsFromSnsNeurons,
} from "$lib/utils/neurons-table.utils";
import { hexStringToBytes } from "$lib/utils/utils";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockAccountsStoreData } from "$tests/mocks/icp-accounts.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { NeuronState, type NeuronInfo } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
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
      availableMaturity: 0n,
      stakedMaturity: 0n,
      dissolveDelaySeconds: defaultDissolveDelaySeconds,
      state: NeuronState.Locked,
      tags: [],
    };

    const convert = (neuronInfos: NeuronInfo[]) =>
      tableNeuronsFromNeuronInfos({
        neuronInfos,
        identity: mockIdentity,
        accounts: mockAccountsStoreData,
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
        },
        {
          ...defaultExpectedTableNeuron,
          rowHref: "/neuron/?u=qhbym-qaaaa-aaaaa-aaafq-cai&neuron=342",
          domKey: "342",
          neuronId: "342",
          stake: makeStake(stake2),
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
        i18n: en,
      });
      expect(tableNeurons).toEqual([
        {
          ...defaultExpectedTableNeuron,
          tags: ["Hotkey control"],
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

    const expectedTableNeuron = {
      rowHref: "/neuron/?u=br5f7-7uaaa-aaaaa-qaaca-cai&neuron=123456789abcdef0",
      domKey: neuronIdString,
      neuronId: neuronIdString,
      stake: makeSnsStake(stake),
      availableMaturity: 0n,
      stakedMaturity: 0n,
      dissolveDelaySeconds,
      state: NeuronState.Locked,
      tags: [],
    };

    const convert = (snsNeurons: SnsNeuron[]) =>
      tableNeuronsFromSnsNeurons({
        snsNeurons: snsNeurons,
        universe: snsUniverseIdText,
        token: mockSnsToken,
        identity: mockIdentity,
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
          tags: ["Hotkey control"],
        },
      ]);
    });
  });
});
