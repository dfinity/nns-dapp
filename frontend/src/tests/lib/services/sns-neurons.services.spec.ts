import type { SnsNeuron } from "@dfinity/sns";
import { tick } from "svelte";
import { get } from "svelte/store";
import * as api from "../../../lib/api/sns.api";
import * as services from "../../../lib/services/sns-neurons.services";
import { snsNeuronsStore } from "../../../lib/stores/sns-neurons.store";
import { bytesToHexString } from "../../../lib/utils/utils";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import { mockSnsNeuron } from "../../mocks/sns-neurons.mock";

const { loadSnsNeurons, getSnsNeuron } = services;

describe("sns-neurons-services", () => {
  describe("loadSnsNeurons", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      snsNeuronsStore.reset();
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });
    it("should call api.querySnsNeurons and load neurons in store", async () => {
      const spyQuery = jest
        .spyOn(api, "querySnsNeurons")
        .mockImplementation(() => Promise.resolve([mockSnsNeuron]));
      await loadSnsNeurons(mockPrincipal);

      await tick();
      const store = get(snsNeuronsStore);
      expect(store[mockPrincipal.toText()]?.neurons).toHaveLength(1);
      expect(spyQuery).toBeCalled();
    });

    it("should empty store if update call fails", async () => {
      snsNeuronsStore.setNeurons({
        rootCanisterId: mockPrincipal,
        neurons: [mockSnsNeuron],
        certified: true,
      });
      const spyQuery = jest
        .spyOn(api, "querySnsNeurons")
        .mockImplementation(() => Promise.reject(undefined));

      await loadSnsNeurons(mockPrincipal);

      await tick();
      const store = get(snsNeuronsStore);
      expect(store[mockPrincipal.toText()]).toBeUndefined();
      expect(spyQuery).toBeCalled();
    });
  });

  describe("getSnsNeuron", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      snsNeuronsStore.reset();
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });
    it("should call api.querySnsNeuron and call load neuron when neuron not in store", (done) => {
      const spyQuery = jest
        .spyOn(api, "querySnsNeuron")
        .mockImplementation(() => Promise.resolve(mockSnsNeuron));
      const onLoad = ({
        neuron,
        certified,
      }: {
        neuron: SnsNeuron;
        certified: boolean;
      }) => {
        expect(spyQuery).toBeCalled();
        expect(neuron).toEqual(mockSnsNeuron);
        if (certified) {
          done();
        }
      };
      getSnsNeuron({
        neuronIdHex: bytesToHexString(mockSnsNeuron.id[0]?.id as number[]),
        rootCanisterId: mockPrincipal,
        onLoad,
      });
    });

    it("should return neuron if it's in the store", (done) => {
      const spyQuery = jest
        .spyOn(api, "querySnsNeuron")
        .mockImplementation(() => Promise.resolve(mockSnsNeuron));
      snsNeuronsStore.setNeurons({
        rootCanisterId: mockPrincipal,
        neurons: [mockSnsNeuron],
        certified: true,
      });
      const onLoad = ({
        neuron,
        certified,
      }: {
        neuron: SnsNeuron;
        certified: boolean;
      }) => {
        expect(spyQuery).not.toBeCalled();
        expect(neuron).toEqual(mockSnsNeuron);
        if (certified) {
          done();
        }
      };
      getSnsNeuron({
        neuronIdHex: bytesToHexString(mockSnsNeuron.id[0]?.id as number[]),
        rootCanisterId: mockPrincipal,
        onLoad,
      });
    });

    it("should call onError callback when call failes", (done) => {
      const spyQuery = jest
        .spyOn(api, "querySnsNeuron")
        .mockImplementation(() => Promise.reject());
      const onLoad = jest.fn();
      const onError = ({ certified }: { certified: boolean }) => {
        expect(spyQuery).toBeCalled();
        expect(onLoad).not.toBeCalled();
        if (certified) {
          done();
        }
      };
      getSnsNeuron({
        neuronIdHex: bytesToHexString(mockSnsNeuron.id[0]?.id as number[]),
        rootCanisterId: mockPrincipal,
        onLoad,
        onError,
      });
    });
  });
});
