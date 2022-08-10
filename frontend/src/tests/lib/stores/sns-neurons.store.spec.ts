import { Principal } from "@dfinity/principal";
import type { SnsNeuron } from "@dfinity/sns";
import { tick } from "svelte";
import { get } from "svelte/store";
import { snsProjectSelectedStore } from "../../../lib/stores/projects.store";
import {
  snsNeuronsStore,
  sortedSnsNeuronStore,
} from "../../../lib/stores/sns-neurons.store";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import { createMockSnsNeuron } from "../../mocks/sns-neurons.mock";

describe("SNS Neurons stores", () => {
  describe("snsNeurons store", () => {
    afterEach(() => snsNeuronsStore.reset());
    it("should set neurons for a project", () => {
      const neurons: SnsNeuron[] = [
        createMockSnsNeuron({
          stake: BigInt(1_000_000_000),
          id: [1, 5, 3, 9, 1, 1, 1],
        }),
        createMockSnsNeuron({
          stake: BigInt(2_000_000_000),
          id: [1, 5, 3, 9, 9, 3, 2],
        }),
      ];
      snsNeuronsStore.setNeurons({
        rootCanisterId: mockPrincipal,
        neurons,
        certified: true,
      });

      const neuronsInStore = get(snsNeuronsStore);
      expect(neuronsInStore[mockPrincipal.toText()].neurons).toEqual(neurons);
    });

    it("should reset neurons for a project", () => {
      const neurons: SnsNeuron[] = [
        createMockSnsNeuron({
          stake: BigInt(1_000_000_000),
          id: [1, 5, 3, 9, 1, 1, 1],
        }),
        createMockSnsNeuron({
          stake: BigInt(2_000_000_000),
          id: [1, 5, 3, 9, 9, 3, 2],
        }),
      ];
      snsNeuronsStore.setNeurons({
        rootCanisterId: mockPrincipal,
        neurons,
        certified: true,
      });
      snsNeuronsStore.resetProject(mockPrincipal);

      const neuronsInStore = get(snsNeuronsStore);
      expect(neuronsInStore[mockPrincipal.toText()]).toBeUndefined();
    });

    it("should add neurons for another project", () => {
      const neurons1: SnsNeuron[] = [
        createMockSnsNeuron({
          stake: BigInt(1_000_000_000),
          id: [1, 5, 3, 9, 1, 1, 1],
        }),
        createMockSnsNeuron({
          stake: BigInt(2_000_000_000),
          id: [1, 5, 3, 9, 9, 3, 2],
        }),
      ];
      snsNeuronsStore.setNeurons({
        rootCanisterId: mockPrincipal,
        neurons: neurons1,
        certified: true,
      });
      const neurons2: SnsNeuron[] = [
        createMockSnsNeuron({
          stake: BigInt(1_000_000_000),
          id: [1, 5, 3, 4, 1, 1, 1],
        }),
        createMockSnsNeuron({
          stake: BigInt(2_000_000_000),
          id: [1, 5, 2, 9, 9, 3, 2],
        }),
      ];
      const principal2 = Principal.fromText("aaaaa-aa");
      snsNeuronsStore.setNeurons({
        rootCanisterId: principal2,
        neurons: neurons2,
        certified: true,
      });
      const neuronsInStore = get(snsNeuronsStore);
      expect(neuronsInStore[mockPrincipal.toText()].neurons).toEqual(neurons1);
      expect(neuronsInStore[principal2.toText()].neurons).toEqual(neurons2);
    });
  });

  describe("sortedSnsNeuronStore", () => {
    afterEach(() => snsNeuronsStore.reset());
    it("returns an empty array if no neurons", () => {
      expect(get(sortedSnsNeuronStore).length).toBe(0);
    });

    it("should sort neurons by createdTimestampSeconds", async () => {
      const neurons: SnsNeuron[] = [
        {
          ...createMockSnsNeuron({
            stake: BigInt(1_000_000_000),
            id: [1, 5, 3, 9, 1, 1, 1],
          }),
          created_timestamp_seconds: BigInt(1),
        },
        {
          ...createMockSnsNeuron({
            stake: BigInt(2_000_000_000),
            id: [1, 5, 3, 9, 9, 3, 2],
          }),
          created_timestamp_seconds: BigInt(3),
        },
        {
          ...createMockSnsNeuron({
            stake: BigInt(10_000_000_000),
            id: [1, 2, 2, 9, 9, 3, 2],
          }),
          created_timestamp_seconds: BigInt(2),
        },
      ];
      snsNeuronsStore.setNeurons({
        rootCanisterId: mockPrincipal,
        neurons,
        certified: true,
      });
      snsProjectSelectedStore.set(mockPrincipal);
      await tick();
      expect(get(sortedSnsNeuronStore)).toEqual([
        neurons[1],
        neurons[2],
        neurons[0],
      ]);
    });

    it("should return the sorted neurons of the selected project", async () => {
      const neurons1: SnsNeuron[] = [
        {
          ...createMockSnsNeuron({
            stake: BigInt(1_000_000_000),
            id: [1, 5, 3, 9, 1, 1, 1],
          }),
          created_timestamp_seconds: BigInt(1),
        },
        {
          ...createMockSnsNeuron({
            stake: BigInt(2_000_000_000),
            id: [1, 5, 3, 9, 9, 3, 2],
          }),
          created_timestamp_seconds: BigInt(3),
        },
        {
          ...createMockSnsNeuron({
            stake: BigInt(10_000_000_000),
            id: [1, 2, 2, 9, 9, 3, 2],
          }),
          created_timestamp_seconds: BigInt(2),
        },
      ];
      snsNeuronsStore.setNeurons({
        rootCanisterId: mockPrincipal,
        neurons: neurons1,
        certified: true,
      });
      const neurons2: SnsNeuron[] = [
        {
          ...createMockSnsNeuron({
            stake: BigInt(1_000_000_000),
            id: [1, 5, 3, 9, 1, 1, 1],
          }),
          created_timestamp_seconds: BigInt(2),
        },
        {
          ...createMockSnsNeuron({
            stake: BigInt(2_000_000_000),
            id: [1, 5, 3, 9, 9, 3, 2],
          }),
          created_timestamp_seconds: BigInt(1),
        },
        {
          ...createMockSnsNeuron({
            stake: BigInt(10_000_000_000),
            id: [1, 2, 2, 9, 9, 3, 2],
          }),
          created_timestamp_seconds: BigInt(3),
        },
      ];
      const principal2 = Principal.fromText("aaaaa-aa");
      snsNeuronsStore.setNeurons({
        rootCanisterId: principal2,
        neurons: neurons2,
        certified: true,
      });
      snsProjectSelectedStore.set(mockPrincipal);
      await tick();
      expect(get(sortedSnsNeuronStore)).toEqual([
        neurons1[1],
        neurons1[2],
        neurons1[0],
      ]);

      snsProjectSelectedStore.set(principal2);
      await tick();
      expect(get(sortedSnsNeuronStore)).toEqual([
        neurons2[2],
        neurons2[0],
        neurons2[1],
      ]);
    });
  });
});
