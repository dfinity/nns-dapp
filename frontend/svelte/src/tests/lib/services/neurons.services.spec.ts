import type { NeuronInfo } from "@dfinity/nns";
import { ICP, LedgerCanister, Topic } from "@dfinity/nns";
import { mock } from "jest-mock-extended";
import { tick } from "svelte/internal";
import { get } from "svelte/store";
import * as api from "../../../lib/api/governance.api";
import * as ledgerApi from "../../../lib/api/ledger.api";
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
import {
  mockIdentity,
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "../../mocks/auth.store.mock";
import { mockFullNeuron, mockNeuron } from "../../mocks/neurons.mock";

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

  const spyClaimOrRefresh = jest
    .spyOn(api, "claimOrRefreshNeuron")
    .mockImplementation(() => Promise.resolve(undefined));

  const spyGetNeuronBalance = jest
    .spyOn(ledgerApi, "getNeuronBalance")
    .mockImplementation(() => Promise.resolve(ICP.fromString("1") as ICP));

  afterEach(() => {
    spyGetNeuron.mockClear();
    neuronsStore.setNeurons([]);
  });

  describe("stake new neuron", () => {
    it("should stake and load a neuron", async () => {
      await stakeAndLoadNeuron({ amount: 10 });

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
        });

      await expect(call).rejects.toThrow(Error);
    });

    it("should not stake neuron if no identity", async () => {
      setNoIdentity();

      const call = async () => await stakeAndLoadNeuron({ amount: 10 });

      await expect(call).rejects.toThrow(Error(mockIdentityErrorMsg));

      resetIdentity();
    });
  });

  describe("list neurons", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it("should list neurons", async () => {
      await listNeurons();

      expect(spyQueryNeurons).toHaveBeenCalled();

      const neuronsList = get(neuronsStore);
      expect(neuronsList).toEqual(neurons);
    });

    it("should check neurons balances", async () => {
      await listNeurons();
      // `await` does not wait for `onLoad` to finish
      await tick();

      expect(spyGetNeuronBalance).toBeCalledTimes(neurons.length);
    });

    it("should claim or refresh neurons whose balance does not match stake", async () => {
      const balance = ICP.fromString("2") as ICP;
      const neuronMatchingStake = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: balance.toE8s(),
        },
      };
      const neuronNotMatchingStake = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: BigInt(3_000_000_000),
        },
      };
      spyGetNeuronBalance.mockImplementation(() => Promise.resolve(balance));
      spyQueryNeurons.mockImplementation(() =>
        Promise.resolve([neuronNotMatchingStake, neuronMatchingStake])
      );
      await listNeurons();
      // `await` does not wait for `onLoad` to finish
      await tick();

      expect(spyClaimOrRefresh).toBeCalledTimes(1);
    });

    it("should not claim or refresh neurons whose balance does not match stake but ICP is less than one", async () => {
      const balance = ICP.fromString("0.9") as ICP;
      const neuronMatchingStake = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: balance.toE8s(),
        },
      };
      const neuronNotMatchingStake = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          cachedNeuronStake: BigInt(3_000_000_000),
        },
      };
      spyGetNeuronBalance.mockImplementation(() => Promise.resolve(balance));
      spyQueryNeurons.mockImplementation(() =>
        Promise.resolve([neuronNotMatchingStake, neuronMatchingStake])
      );
      await listNeurons();
      // `await` does not wait for `onLoad` to finish
      await tick();

      expect(spyClaimOrRefresh).not.toBeCalled();
    });

    it("should not list neurons if no identity", async () => {
      setNoIdentity();

      const call = async () => await listNeurons();

      await expect(call).rejects.toThrow(mockIdentityErrorMsg);

      resetIdentity();
    });
  });

  describe("update delay", () => {
    it("should update delay", async () => {
      await updateDelay({
        neuronId: BigInt(10),
        dissolveDelayInSeconds: 12000,
      });

      expect(spyIncreaseDissolveDelay).toHaveBeenCalled();

      const neuron = get(neuronsStore)[0];
      expect(neuron).toEqual(mockNeuron);
    });

    it("should not update delay if no identity", async () => {
      setNoIdentity();

      const call = async () =>
        await updateDelay({
          neuronId: BigInt(10),
          dissolveDelayInSeconds: 12000,
        });

      await expect(call).rejects.toThrow(mockIdentityErrorMsg);

      resetIdentity();
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

      setNoIdentity();

      const call = async () =>
        await addFollowee({
          neuronId,
          topic,
          followee,
        });
      await expect(call).rejects.toThrow(mockIdentityErrorMsg);

      resetIdentity();
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

      setNoIdentity();

      const call = async () =>
        await removeFollowee({
          neuronId,
          topic,
          followee,
        });
      await expect(call).rejects.toThrow(mockIdentityErrorMsg);

      resetIdentity();
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
        setNeuron: jest.fn,
      });
      expect(spyGetNeuron).toBeCalled();
    });
  });
});
