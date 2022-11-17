import * as governanceApi from "$lib/api/sns-governance.api";
import * as api from "$lib/api/sns.api";
import * as services from "$lib/services/sns-neurons.services";
import {
  disburse,
  startDissolving,
  stopDissolving,
  updateDelay,
} from "$lib/services/sns-neurons.services";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { bytesToHexString } from "$lib/utils/utils";
import { Principal } from "@dfinity/principal";
import type { SnsNeuron } from "@dfinity/sns";
import { SnsNeuronPermissionType, type SnsNeuronId } from "@dfinity/sns";
import { fromDefinedNullable } from "@dfinity/utils";
import { tick } from "svelte";
import { get } from "svelte/store";
import { mockIdentity, mockPrincipal } from "../../mocks/auth.store.mock";
import { mockSnsMainAccount } from "../../mocks/sns-accounts.mock";
import { mockSnsNeuron } from "../../mocks/sns-neurons.mock";

const { loadSnsNeurons, getSnsNeuron, addHotkey, removeHotkey, stakeNeuron } =
  services;

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
        .spyOn(governanceApi, "addNeuronPermissions")
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
        permissions: [
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL,
        ],
      });
    });
  });

  describe("removeHotkey", () => {
    it("should call api.addNeuronPermissions", async () => {
      const spyAdd = jest
        .spyOn(governanceApi, "removeNeuronPermissions")
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
        permissions: [
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
          SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL,
        ],
      });
    });
  });

  describe("disburse", () => {
    it("should call api.disburse", async () => {
      const neuronId = mockSnsNeuron.id[0] as SnsNeuronId;
      const identity = mockIdentity;
      const rootCanisterId = mockPrincipal;

      const spyOnDisburse = jest
        .spyOn(governanceApi, "disburse")
        .mockImplementation(() => Promise.resolve());

      const { success } = await disburse({
        rootCanisterId,
        neuronId,
      });

      expect(success).toBeTruthy();

      expect(spyOnDisburse).toBeCalledWith({
        neuronId,
        identity,
        rootCanisterId,
      });
    });
  });

  describe("start dissolving", () => {
    it("should call sns api startDissolving", async () => {
      const neuronId = mockSnsNeuron.id[0] as SnsNeuronId;
      const identity = mockIdentity;
      const rootCanisterId = mockPrincipal;

      const spyOnStartDissolving = jest
        .spyOn(governanceApi, "startDissolving")
        .mockImplementation(() => Promise.resolve());

      const { success } = await startDissolving({
        rootCanisterId,
        neuronId,
      });

      expect(success).toBeTruthy();

      expect(spyOnStartDissolving).toBeCalledWith({
        neuronId,
        identity,
        rootCanisterId,
      });
    });
  });

  describe("stop dissolving", () => {
    it("should call sns api stopDissolving", async () => {
      const neuronId = mockSnsNeuron.id[0] as SnsNeuronId;
      const identity = mockIdentity;
      const rootCanisterId = mockPrincipal;

      const spyOnStopDissolving = jest
        .spyOn(governanceApi, "stopDissolving")
        .mockImplementation(() => Promise.resolve());

      const { success } = await stopDissolving({
        rootCanisterId,
        neuronId,
      });

      expect(success).toBeTruthy();

      expect(spyOnStopDissolving).toBeCalledWith({
        neuronId,
        identity,
        rootCanisterId,
      });
    });
  });

  describe("updateDelay ", () => {
    const spyOnIncreaseDissolveDelay = jest
      .spyOn(governanceApi, "increaseDissolveDelay")
      .mockImplementation(() => Promise.resolve());

    beforeEach(spyOnIncreaseDissolveDelay.mockClear);

    it("should call sns api increaseDissolveDelay", async () => {
      const neuronId = fromDefinedNullable(mockSnsNeuron.id);
      const identity = mockIdentity;
      const rootCanisterId = mockPrincipal;
      const { success } = await updateDelay({
        rootCanisterId,
        dissolveDelaySeconds: 123,
        neuron: mockSnsNeuron,
      });

      expect(success).toBeTruthy();

      expect(spyOnIncreaseDissolveDelay).toBeCalledWith({
        neuronId,
        identity,
        rootCanisterId,
        additionalDissolveDelaySeconds: 123,
      });
    });

    it("should calculate additionalDissolveDelaySeconds", async () => {
      const rootCanisterId = mockPrincipal;
      const { success } = await updateDelay({
        rootCanisterId,
        dissolveDelaySeconds: 333,
        neuron: {
          ...mockSnsNeuron,
          dissolve_state: [{ DissolveDelaySeconds: BigInt(111) }],
        },
      });

      expect(success).toBeTruthy();

      expect(spyOnIncreaseDissolveDelay).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          additionalDissolveDelaySeconds: 222,
        })
      );
    });
  });

  describe("stakeNeuron", () => {
    it("should call sns api stakeNeuron and query neurons again", async () => {
      const spyStake = jest
        .spyOn(api, "stakeNeuron")
        .mockImplementation(() => Promise.resolve(mockSnsNeuron.id[0]));
      const spyQuery = jest
        .spyOn(api, "querySnsNeurons")
        .mockImplementation(() => Promise.resolve([mockSnsNeuron]));

      const { success } = await stakeNeuron({
        rootCanisterId: mockPrincipal,
        amount: BigInt(200_000_000),
        account: mockSnsMainAccount,
      });

      expect(success).toBeTruthy();
      expect(spyStake).toBeCalled();
      expect(spyQuery).toBeCalled();
    });
  });
});
