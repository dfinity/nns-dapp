/**
 * @jest-environment jsdom
 */

import * as governanceApi from "$lib/api/sns-governance.api";
import * as api from "$lib/api/sns.api";
import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import * as services from "$lib/services/sns-neurons.services";
import {
  disburse,
  startDissolving,
  stopDissolving,
  updateDelay,
} from "$lib/services/sns-neurons.services";
import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { bytesToHexString } from "$lib/utils/utils";
import { Principal } from "@dfinity/principal";
import {
  neuronSubaccount,
  type SnsNeuron,
  type SnsNeuronId,
} from "@dfinity/sns";
import { fromDefinedNullable } from "@dfinity/utils";
import { waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import { get } from "svelte/store";
import { mockIdentity, mockPrincipal } from "../../mocks/auth.store.mock";
import { mockSnsMainAccount } from "../../mocks/sns-accounts.mock";
import { nervousSystemFunctionMock } from "../../mocks/sns-functions.mock";
import { mockSnsNeuron } from "../../mocks/sns-neurons.mock";

const {
  syncSnsNeurons,
  getSnsNeuron,
  addHotkey,
  removeHotkey,
  stakeNeuron,
  loadSnsNervousSystemFunctions: loadSnsNervousSystemFunctions,
} = services;

describe("sns-neurons-services", () => {
  describe("syncSnsNeurons", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      snsNeuronsStore.reset();
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("should call api.querySnsNeurons and load neurons in store", async () => {
      const subaccount: Uint8Array = neuronSubaccount({
        controller: mockIdentity.getPrincipal(),
        index: 0,
      });
      const neuronId: SnsNeuronId = { id: subaccount };
      const neuron = {
        ...mockSnsNeuron,
        id: [neuronId] as [SnsNeuronId],
      };
      const spyQuery = jest
        .spyOn(api, "querySnsNeurons")
        .mockImplementation(() => Promise.resolve([neuron]));
      const spyNeuronBalance = jest
        .spyOn(governanceApi, "getNeuronBalance")
        .mockImplementationOnce(() =>
          Promise.resolve(mockSnsNeuron.cached_neuron_stake_e8s)
        )
        .mockImplementation(() => Promise.resolve(BigInt(0)));
      await syncSnsNeurons(mockPrincipal);

      await tick();
      const store = get(snsNeuronsStore);
      expect(store[mockPrincipal.toText()]?.neurons).toHaveLength(1);
      expect(spyQuery).toBeCalled();
      expect(spyNeuronBalance).toBeCalled();
    });

    it("should refresh and refetch the neuron if balance doesn't match", async () => {
      const subaccount: Uint8Array = neuronSubaccount({
        controller: mockIdentity.getPrincipal(),
        index: 0,
      });
      const neuronId: SnsNeuronId = { id: subaccount };
      const neuron = {
        ...mockSnsNeuron,
        id: [neuronId] as [SnsNeuronId],
      };
      const spyQuery = jest
        .spyOn(api, "querySnsNeurons")
        .mockImplementation(() => Promise.resolve([neuron]));
      const spyNeuronQuery = jest
        .spyOn(api, "querySnsNeuron")
        .mockImplementation(() => Promise.resolve(neuron));
      const spyNeuronBalance = jest
        .spyOn(governanceApi, "getNeuronBalance")
        .mockImplementationOnce(() =>
          Promise.resolve(
            mockSnsNeuron.cached_neuron_stake_e8s + BigInt(10_000)
          )
        )
        .mockImplementation(() => Promise.resolve(BigInt(0)));
      const spyRefreshNeuron = jest
        .spyOn(governanceApi, "refreshNeuron")
        .mockImplementation(() => Promise.resolve(undefined));
      await syncSnsNeurons(mockPrincipal);

      await tick();
      const store = get(snsNeuronsStore);
      expect(store[mockPrincipal.toText()]?.neurons).toHaveLength(1);
      expect(spyQuery).toBeCalled();
      expect(spyNeuronBalance).toBeCalled();
      expect(spyRefreshNeuron).toBeCalled();
      expect(spyNeuronQuery).toBeCalled();
    });

    it("should claim neuron if find a subaccount without neuron", async () => {
      const subaccount: Uint8Array = neuronSubaccount({
        controller: mockIdentity.getPrincipal(),
        index: 1,
      });
      const neuronId: SnsNeuronId = { id: subaccount };
      const neuron = {
        ...mockSnsNeuron,
        id: [neuronId] as [SnsNeuronId],
      };
      const spyQuery = jest
        .spyOn(api, "querySnsNeurons")
        .mockImplementation(() => Promise.resolve([neuron]));
      const spyNeuronQuery = jest
        .spyOn(api, "querySnsNeuron")
        .mockImplementation(() => Promise.resolve(neuron));
      const spyNeuronBalance = jest
        .spyOn(governanceApi, "getNeuronBalance")
        .mockImplementationOnce(() =>
          Promise.resolve(mockSnsNeuron.cached_neuron_stake_e8s)
        )
        .mockImplementationOnce(() => Promise.resolve(BigInt(200_000_000)))
        .mockImplementation(() => Promise.resolve(BigInt(0)));
      const spyClaimNeuron = jest
        .spyOn(governanceApi, "claimNeuron")
        .mockImplementation(() => Promise.resolve(undefined));
      await syncSnsNeurons(mockPrincipal);

      await tick();
      await tick();
      const store = get(snsNeuronsStore);
      expect(store[mockPrincipal.toText()]?.neurons).toHaveLength(1);
      expect(spyQuery).toBeCalled();
      expect(spyNeuronBalance).toBeCalled();
      expect(spyClaimNeuron).toBeCalled();
      expect(spyNeuronQuery).toBeCalled();
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

      await syncSnsNeurons(mockPrincipal);

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
      const subaccount: Uint8Array = neuronSubaccount({
        controller: mockIdentity.getPrincipal(),
        index: 0,
      });
      const neuronId: SnsNeuronId = { id: subaccount };
      const neuron = {
        ...mockSnsNeuron,
        id: [neuronId] as [SnsNeuronId],
      };
      const spyNeuronBalance = jest
        .spyOn(governanceApi, "getNeuronBalance")
        .mockImplementationOnce(() =>
          Promise.resolve(mockSnsNeuron.cached_neuron_stake_e8s)
        )
        .mockImplementation(() => Promise.resolve(BigInt(0)));
      const spyQuery = jest
        .spyOn(api, "querySnsNeuron")
        .mockImplementation(() => Promise.resolve(neuron));
      const onLoad = async ({
        neuron: neuronToLoad,
        certified,
      }: {
        neuron: SnsNeuron;
        certified: boolean;
      }) => {
        expect(spyQuery).toBeCalled();
        expect(neuronToLoad).toEqual(neuron);
        if (certified) {
          await waitFor(() => expect(spyNeuronBalance).toBeCalled());
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

    it("should refresh neuron if balance does not match and load again", (done) => {
      const subaccount: Uint8Array = neuronSubaccount({
        controller: mockIdentity.getPrincipal(),
        index: 0,
      });
      const neuronId: SnsNeuronId = { id: subaccount };
      const neuron = {
        ...mockSnsNeuron,
        id: [neuronId] as [SnsNeuronId],
      };
      const stake = neuron.cached_neuron_stake_e8s + BigInt(10_000);
      const updatedNeuron = {
        ...neuron,
        cached_neuron_stake_e8s: stake,
      };
      const spyNeuronBalance = jest
        .spyOn(governanceApi, "getNeuronBalance")
        .mockImplementationOnce(() => Promise.resolve(stake))
        .mockImplementation(() => Promise.resolve(BigInt(0)));
      const spyQuery = jest
        .spyOn(api, "querySnsNeuron")
        // First is the query call and returns old neuron
        .mockImplementationOnce(() => Promise.resolve(neuron))
        // Second is the update call and returns old neuron. It will be checked.
        .mockImplementationOnce(() => Promise.resolve(neuron))
        // After refreshing we get the updated neuron.
        .mockImplementation(() => Promise.resolve(updatedNeuron));
      const spyRefreshNeuron = jest
        .spyOn(governanceApi, "refreshNeuron")
        .mockImplementation(() => Promise.resolve(undefined));
      const onLoad = ({
        neuron: neuronToLoad,
      }: {
        neuron: SnsNeuron;
        certified: boolean;
      }) => {
        // Wait until we get the updated neuron to finish the test.
        if (neuronToLoad.cached_neuron_stake_e8s === stake) {
          expect(spyQuery).toBeCalledTimes(3);
          expect(spyNeuronBalance).toBeCalledTimes(1);
          expect(spyRefreshNeuron).toBeCalledTimes(1);
          expect(neuronToLoad).toEqual(updatedNeuron);
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
        permissions: HOTKEY_PERMISSIONS,
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
        permissions: HOTKEY_PERMISSIONS,
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

  describe("loadSnsNervousSystemFunctions", () => {
    it("should call sns api getNervousSystemFunctions and load the nervous system functions store", async () => {
      const spyGetFunctions = jest
        .spyOn(governanceApi, "getNervousSystemFunctions")
        .mockImplementation(() => Promise.resolve([nervousSystemFunctionMock]));

      await loadSnsNervousSystemFunctions(mockPrincipal);

      const store = get(snsFunctionsStore);
      expect(store[mockPrincipal.toText()]).toEqual([
        nervousSystemFunctionMock,
      ]);
      expect(spyGetFunctions).toBeCalled();
    });
  });
});
