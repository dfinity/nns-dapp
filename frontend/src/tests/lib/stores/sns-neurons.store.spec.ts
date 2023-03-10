import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { createMockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { Principal } from "@dfinity/principal";
import type { SnsNeuron } from "@dfinity/sns";
import { get } from "svelte/store";

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

    it("should add neurons to a project with neurons", () => {
      const neuron1 = createMockSnsNeuron({
        stake: BigInt(1_000_000_000),
        id: [1, 5, 3, 9, 1, 1, 1],
      });
      const neuron2 = createMockSnsNeuron({
        stake: BigInt(2_000_000_000),
        id: [1, 5, 3, 9, 9, 3, 2],
      });
      const neuron3 = createMockSnsNeuron({
        stake: BigInt(2_000_000_000),
        id: [1, 5, 2, 9, 9, 3, 2],
      });
      const neurons1: SnsNeuron[] = [neuron1, neuron2];
      snsNeuronsStore.setNeurons({
        rootCanisterId: mockPrincipal,
        neurons: neurons1,
        certified: true,
      });
      const neurons2: SnsNeuron[] = [neuron1, neuron3];
      snsNeuronsStore.addNeurons({
        rootCanisterId: mockPrincipal,
        neurons: neurons2,
        certified: true,
      });

      const neuronsInStore = get(snsNeuronsStore);
      expect(neuronsInStore[mockPrincipal.toText()].neurons.length).toEqual(3);
    });
  });
});
