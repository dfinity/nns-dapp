import { Principal } from "@dfinity/principal";
import { SnsNeuronPermissionType, type SnsNeuronId } from "@dfinity/sns";
import { tick } from "svelte";
import { get } from "svelte/store";
import * as api from "../../../lib/api/sns.api";
import * as services from "../../../lib/services/sns-neurons.services";
import { snsNeuronsStore } from "../../../lib/stores/sns-neurons.store";
import { mockIdentity, mockPrincipal } from "../../mocks/auth.store.mock";
import { mockSnsNeuron } from "../../mocks/sns-neurons.mock";

const { loadSnsNeurons, addHotkey } = services;

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

  describe("addHotkey", () => {
    it("should call api.addNeuronPermissions", async () => {
      const spyAdd = jest
        .spyOn(api, "addNeuronPermissions")
        .mockImplementation(() => Promise.resolve());
      const hotkey = "aaaaa-aa";
      const { success } = await addHotkey({
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
});
