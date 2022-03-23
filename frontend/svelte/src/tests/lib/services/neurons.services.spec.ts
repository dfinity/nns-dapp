import type { NeuronInfo } from "@dfinity/nns";
import { LedgerCanister, Topic } from "@dfinity/nns";
import { mock } from "jest-mock-extended";
import { tick } from "svelte/internal";
import { get } from "svelte/store";
import * as api from "../../../lib/api/governance.api";
import { E8S_PER_ICP } from "../../../lib/constants/icp.constants";
import {
  addFollowee,
  getNeuronId,
  listNeurons,
  loadNeuron,
  removeFollowee,
  stakeAndLoadNeuron,
  updateDelay,
} from "../../../lib/services/neurons.services";
import { neuronsStore } from "../../../lib/stores/neurons.store";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockNeuron } from "../../mocks/neurons.mock";

describe("neurons-services", () => {
  const spyStakeNeuron = jest
    .spyOn(api, "stakeNeuron")
    .mockImplementation(() => Promise.resolve(mockNeuron.neuronId));

  const spyGetNeuron = jest
    .spyOn(api, "queryNeuron")
    .mockImplementation(() => Promise.resolve(mockNeuron));

  const neurons = [mockNeuron, { ...mockNeuron, neuronId: BigInt(2) }];

  const spyQueryNeurons = jest
    .spyOn(api, "queryNeurons")
    .mockImplementation(() => Promise.resolve(neurons));

  const spyIncreaseDissolveDelay = jest
    .spyOn(api, "increaseDissolveDelay")
    .mockImplementation(() => Promise.resolve());

  const spySetFollowees = jest
    .spyOn(api, "setFollowees")
    .mockImplementation(() => Promise.resolve());

  afterEach(() => {
    spyGetNeuron.mockClear();
    neuronsStore.setNeurons([]);
  });

  describe("stake new neuron", () => {
    it("should stake and load a neuron", async () => {
      await stakeAndLoadNeuron({ amount: 10, identity: mockIdentity });

      expect(spyStakeNeuron).toHaveBeenCalled();

      const neuron = get(neuronsStore)[0];
      expect(neuron).toEqual(mockNeuron);
    });

    it(`stakeNeuron should raise an error if amount less than ${
      E8S_PER_ICP / E8S_PER_ICP
    } ICP`, async () => {
      jest
        .spyOn(LedgerCanister, "create")
        .mockImplementation(() => mock<LedgerCanister>());

      const call = () =>
        stakeAndLoadNeuron({
          amount: 0.1,
          identity: mockIdentity,
        });

      await expect(call).rejects.toThrow(Error);
    });

    it("should not stake neuron if no identity", async () => {
      const call = async () =>
        await stakeAndLoadNeuron({ amount: 10, identity: null });

      await expect(call).rejects.toThrow(Error("No identity"));
    });
  });

  describe("list neurons", () => {
    it("should list neurons", async () => {
      await listNeurons({ identity: mockIdentity });

      expect(spyQueryNeurons).toHaveBeenCalled();

      const neuronsList = get(neuronsStore);
      expect(neuronsList).toEqual(neurons);
    });

    it("should not list neurons if no identity", async () => {
      const call = async () => await listNeurons({ identity: null });

      await expect(call).rejects.toThrow("No identity found listing neurons");
    });
  });

  describe("update delay", () => {
    it("should update delay", async () => {
      await updateDelay({
        neuronId: BigInt(10),
        dissolveDelayInSeconds: 12000,
        identity: mockIdentity,
      });

      expect(spyIncreaseDissolveDelay).toHaveBeenCalled();

      const neuron = get(neuronsStore)[0];
      expect(neuron).toEqual(mockNeuron);
    });

    it("should not update delay if no identity", async () => {
      const call = async () =>
        await updateDelay({
          neuronId: BigInt(10),
          dissolveDelayInSeconds: 12000,
          identity: null,
        });

      await expect(call).rejects.toThrow("No identity");
    });
  });

  describe("add followee", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it("should add the followee to next call", async () => {
      const followee = BigInt(8);
      const neuronId = neurons[0].neuronId;
      neuronsStore.setNeurons(neurons);
      const topic = Topic.ExchangeRate;
      await addFollowee({
        neuronId,
        identity: mockIdentity,
        topic,
        followee,
      });

      const expectedArgument = {
        neuronId,
        identity: mockIdentity,
        topic,
        followees: [followee],
      };
      expect(spySetFollowees).toHaveBeenCalledWith(expectedArgument);
    });

    it("should not call api if no identity", async () => {
      const followee = BigInt(8);
      const { neuronId } = neurons[0];
      neuronsStore.setNeurons(neurons);
      const topic = Topic.ExchangeRate;
      const call = async () =>
        await addFollowee({
          neuronId,
          identity: null,
          topic,
          followee,
        });
      await expect(call).rejects.toThrow("No identity");
    });
  });

  describe("remove followee", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it("should remove the followee to next call", async () => {
      const followee = BigInt(8);
      const topic = Topic.ExchangeRate;
      const neuron = neurons[0];
      // @ts-ignore mockNeuron has `fullNeuron`
      neuron.fullNeuron.followees = [{ topic, followees: [followee] }];
      neuronsStore.setNeurons(neurons);
      await removeFollowee({
        neuronId: neuron.neuronId,
        identity: mockIdentity,
        topic,
        followee,
      });

      const expectedArgument = {
        neuronId: neuron.neuronId,
        identity: mockIdentity,
        topic,
        followees: [],
      };
      expect(spySetFollowees).toHaveBeenCalledWith(expectedArgument);
    });

    it("should not call api if no identity", async () => {
      const followee = BigInt(8);
      const neuronId = neurons[0].neuronId;
      neuronsStore.setNeurons(neurons);
      const topic = Topic.ExchangeRate;
      const call = async () =>
        await removeFollowee({
          neuronId,
          identity: null,
          topic,
          followee,
        });
      await expect(call).rejects.toThrow("No identity");
    });
  });

  describe("details", () => {
    beforeAll(() => {
      // Avoid to print errors during test
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });
    afterAll(() => jest.clearAllMocks());
    it("should get neuronId from valid path", async () => {
      expect(getNeuronId("/#/neuron/123")).toBe(BigInt(123));
      expect(getNeuronId("/#/neuron/0")).toBe(BigInt(0));
    });

    it("should not get neuronId from invalid path", async () => {
      expect(getNeuronId("/#/neuron/")).toBeUndefined();
      expect(getNeuronId("/#/neuron/1.5")).toBeUndefined();
      expect(getNeuronId("/#/neuron/123n")).toBeUndefined();
    });
  });

  describe("load neuron", () => {
    it("should get neuron from neurons store if presented and not call queryNeuron", async () => {
      neuronsStore.pushNeurons([mockNeuron]);
      await loadNeuron({
        neuronId: mockNeuron.neuronId,
        identity: mockIdentity,
        setNeuron: (neuron: NeuronInfo) => {
          neuronsStore.setNeurons([]);
          expect(neuron?.neuronId).toBe(mockNeuron.neuronId);
        },
      });
      await tick();
      expect(spyGetNeuron).not.toBeCalled();
    });

    it("should call the api to get neuron if not in store", async () => {
      await loadNeuron({
        neuronId: mockNeuron.neuronId,
        identity: mockIdentity,
        setNeuron: jest.fn,
      });
      expect(spyGetNeuron).toBeCalled();
    });
  });
});
