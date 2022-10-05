import * as api from "$lib/api/sns.api";
import * as services from "$lib/services/sns-neurons.services";
import { disburse } from "$lib/services/sns-neurons.services";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { bytesToHexString } from "$lib/utils/utils";
import { Principal } from "@dfinity/principal";
import type { SnsNeuron } from "@dfinity/sns";
import { SnsNeuronPermissionType, type SnsNeuronId } from "@dfinity/sns";
import { tick } from "svelte";
import { get } from "svelte/store";
import { mockIdentity, mockPrincipal } from "../../mocks/auth.store.mock";
import { mockSnsNeuron } from "../../mocks/sns-neurons.mock";

const { loadSnsNeurons, getSnsNeuron, addHotkey, removeHotkey } = services;

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
        neuronIdHex: bytesToHexString(
          Array.from(mockSnsNeuron.id[0]?.id as Uint8Array)
        ),
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
        neuronIdHex: bytesToHexString(
          Array.from(mockSnsNeuron.id[0]?.id as Uint8Array)
        ),
        rootCanisterId: mockPrincipal,
        onLoad,
      });
    });

    it("should call api even if it's in the store when forceFetch", (done) => {
      const spyQuery = jest
        .spyOn(api, "querySnsNeuron")
        .mockImplementation(() => Promise.resolve({ ...mockSnsNeuron }));
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
        expect(spyQuery).toBeCalled();
        expect(neuron).not.toBe(mockSnsNeuron);
        if (certified) {
          done();
        }
      };
      getSnsNeuron({
        forceFetch: true,
        neuronIdHex: bytesToHexString(
          Array.from(mockSnsNeuron.id[0]?.id as Uint8Array)
        ),
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
        neuronIdHex: bytesToHexString(
          Array.from(mockSnsNeuron.id[0]?.id as Uint8Array)
        ),
        rootCanisterId: mockPrincipal,
        onLoad,
        onError,
      });
    });
  });

  describe("addHotkey", () => {
    it("should call api.addNeuronPermissions", async () => {
      const spyAdd = jest
        .spyOn(api, "addNeuronPermissions")
        .mockImplementation(() => Promise.resolve());
      const hotkey = Principal.fromText("aaaaa-aa");
      const { success } = await addHotkey({
        neuronId: mockSnsNeuron.id[0] as SnsNeuronId,
        hotkey,
        rootCanisterId: mockPrincipal,
      });
      expect(success).toBeTruthy();
      expect(spyAdd).toBeCalledWith({
        neuronId: mockSnsNeuron.id[0] as SnsNeuronId,
        identity: mockIdentity,
        principal: hotkey,
        rootCanisterId: mockPrincipal,
        permissions: [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE],
      });
    });
  });

  describe("removeHotkey", () => {
    it("should call api.addNeuronPermissions", async () => {
      const spyAdd = jest
        .spyOn(api, "removeNeuronPermissions")
        .mockImplementation(() => Promise.resolve());
      const hotkey = "aaaaa-aa";
      const { success } = await removeHotkey({
        neuronId: mockSnsNeuron.id[0] as SnsNeuronId,
        hotkey,
        rootCanisterId: mockPrincipal,
      });
      expect(success).toBeTruthy();
      expect(spyAdd).toBeCalledWith({
        neuronId: mockSnsNeuron.id[0] as SnsNeuronId,
        identity: mockIdentity,
        principal: Principal.fromText(hotkey),
        rootCanisterId: mockPrincipal,
        permissions: [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE],
      });
    });
  });

  describe("disburse", () => {
    it("should call api.disburse", async () => {
      const neuronId = mockSnsNeuron.id[0] as SnsNeuronId;
      const identity = mockIdentity;
      const rootCanisterId = mockPrincipal;

      const spyAdd = jest
        .spyOn(api, "disburse")
        .mockImplementation(() => Promise.resolve());

      const { success } = await disburse({
        rootCanisterId,
        neuronId,
      });

      expect(success).toBeTruthy();

      expect(spyAdd).toBeCalledWith({
        neuronId,
        identity,
        rootCanisterId,
      });
    });
  });
});
