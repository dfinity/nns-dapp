import type { NeuronInfo } from "@dfinity/nns";
import { ICP, LedgerCanister, Topic } from "@dfinity/nns";
import { mock } from "jest-mock-extended";
import { tick } from "svelte/internal";
import { get } from "svelte/store";
import * as api from "../../../lib/api/governance.api";
import * as ledgerApi from "../../../lib/api/ledger.api";
import { E8S_PER_ICP } from "../../../lib/constants/icp.constants";
import * as services from "../../../lib/services/neurons.services";
import { accountsStore } from "../../../lib/stores/accounts.store";
import { neuronsStore } from "../../../lib/stores/neurons.store";
import { toastsStore } from "../../../lib/stores/toasts.store";
import {
  mockIdentity,
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "../../mocks/auth.store.mock";
import { mockFullNeuron, mockNeuron } from "../../mocks/neurons.mock";

const {
  addFollowee,
  getNeuronId,
  joinCommunityFund,
  listNeurons,
  loadNeuron,
  removeFollowee,
  stakeAndLoadNeuron,
  startDissolving,
  stopDissolving,
  updateDelay,
  assertNeuronUserControlled,
  assertNeuronControllable,
} = services;

jest.mock("../../../lib/stores/toasts.store", () => {
  return {
    toastsStore: {
      error: jest.fn(),
      show: jest.fn(),
    },
  };
});

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

  const spyJoinCommunityFund = jest
    .spyOn(api, "joinCommunityFund")
    .mockImplementation(() => Promise.resolve());

  const spyStartDissolving = jest
    .spyOn(api, "startDissolving")
    .mockImplementation(() => Promise.resolve());

  const spyStopDissolving = jest
    .spyOn(api, "stopDissolving")
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

  const mockAssertUserControlled = (mock = async () => undefined) => {
    jest.spyOn(services, "assertNeuronUserControlled").mockImplementation(mock);
  };
  const mockAssertControllable = (mock = async () => undefined) => {
    jest.spyOn(services, "assertNeuronControllable").mockImplementation(mock);
  };
  const throwMock = jest.fn().mockRejectedValue(new Error());

  afterEach(() => {
    spyGetNeuron.mockClear();
    neuronsStore.setNeurons([]);
  });

  describe("assertNeuronUserControlled", () => {
    afterEach(() => {
      neuronsStore.setNeurons([]);
    });
    it("does not raise error if neuron is controlled by user", async () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: mockIdentity.getPrincipal().toText(),
        },
      };
      neuronsStore.pushNeurons([neuron]);
      await assertNeuronUserControlled(neuron.neuronId);
    });

    it("raises error if neuron is not controlled by user", async () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "bbbbb-bb",
        },
      };
      neuronsStore.pushNeurons([neuron]);
      const call = () => assertNeuronUserControlled(neuron.neuronId);
      await expect(call).rejects.toThrowError();
    });
  });

  describe("assertNeuronControllable", () => {
    afterEach(() => {
      accountsStore.reset();
      neuronsStore.setNeurons([]);
    });
    it("does not raise error if neuron is controlled by user", async () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: mockIdentity.getPrincipal().toText(),
        },
      };
      neuronsStore.pushNeurons([neuron]);
      await assertNeuronControllable(neuron.neuronId);
    });

    // TODO: Support hardware wallets
    xit("does not raise error if neuron is controlled by linked hardware wallet", async () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: mockIdentity.getPrincipal().toText(),
        },
      };
      neuronsStore.pushNeurons([neuron]);
      await assertNeuronControllable(neuron.neuronId);
    });

    it("raises error if neuron is not controlled by user", async () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: "bbbbb-bb",
        },
      };
      neuronsStore.pushNeurons([neuron]);
      const call = () => assertNeuronControllable(neuron.neuronId);
      await expect(call).rejects.toThrowError();
    });
  });

  describe("stake new neuron", () => {
    it("should stake and load a neuron", async () => {
      await stakeAndLoadNeuron({ amount: 10 });

      expect(spyStakeNeuron).toHaveBeenCalled();

      const neuron = get(neuronsStore)[0];
      expect(neuron).toEqual(mockNeuron);
    });

    it(`stakeNeuron return undefined if amount less than ${
      E8S_PER_ICP / E8S_PER_ICP
    } ICP`, async () => {
      jest
        .spyOn(LedgerCanister, "create")
        .mockImplementation(() => mock<LedgerCanister>());

      const response = await stakeAndLoadNeuron({
        amount: 0.1,
      });

      expect(response).toBeUndefined();
      expect(toastsStore.error).toBeCalled();
    });

    it("stake neuron should return undefined if amount not valid", async () => {
      jest
        .spyOn(LedgerCanister, "create")
        .mockImplementation(() => mock<LedgerCanister>());

      const response = await stakeAndLoadNeuron({
        amount: NaN,
      });

      expect(response).toBeUndefined();
      expect(toastsStore.error).toBeCalled();
    });

    it("should not stake neuron if no identity", async () => {
      setNoIdentity();

      const response = await stakeAndLoadNeuron({
        amount: 10,
      });

      expect(response).toBeUndefined();
      expect(toastsStore.error).toBeCalled();

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
    afterEach(() => {
      jest.clearAllMocks();
    });
    it("should update delay", async () => {
      mockAssertUserControlled();
      await updateDelay({
        neuronId: BigInt(10),
        dissolveDelayInSeconds: 12000,
      });

      expect(spyIncreaseDissolveDelay).toHaveBeenCalled();

      const neuron = get(neuronsStore)[0];
      expect(neuron).toEqual(mockNeuron);
    });

    it("should not update delay if no identity", async () => {
      mockAssertUserControlled();
      setNoIdentity();

      await updateDelay({
        neuronId: BigInt(10),
        dissolveDelayInSeconds: 12000,
      });

      expect(toastsStore.error).toHaveBeenCalled();
      expect(spyIncreaseDissolveDelay).not.toHaveBeenCalled();

      resetIdentity();
    });

    it("should not update delay if no neuron not controlled by user", async () => {
      mockAssertUserControlled(throwMock);
      setNoIdentity();

      await updateDelay({
        neuronId: BigInt(10),
        dissolveDelayInSeconds: 12000,
      });

      expect(toastsStore.error).toHaveBeenCalled();
      expect(spyIncreaseDissolveDelay).not.toHaveBeenCalled();

      resetIdentity();
    });
  });

  describe("joinCommunityFund", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it("should update neuron", async () => {
      mockAssertUserControlled();
      await joinCommunityFund(BigInt(10));

      expect(spyJoinCommunityFund).toHaveBeenCalled();
    });

    it("should not update neuron if no identity", async () => {
      mockAssertUserControlled();
      setNoIdentity();

      const call = async () => await joinCommunityFund(BigInt(10));

      await expect(call).rejects.toThrow(mockIdentityErrorMsg);

      resetIdentity();
    });

    it("should not update neuron if not controlled by user", async () => {
      mockAssertUserControlled(throwMock);
      setNoIdentity();

      const call = async () => await joinCommunityFund(BigInt(10));

      await expect(call).rejects.toThrowError();
      expect(spyJoinCommunityFund).not.toHaveBeenCalled();

      resetIdentity();
    });
  });

  describe("startDissolving", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it("should update neuron", async () => {
      mockAssertUserControlled();
      await startDissolving(BigInt(10));

      expect(spyStartDissolving).toHaveBeenCalled();
    });

    it("should not update neuron if no identity", async () => {
      mockAssertUserControlled();
      setNoIdentity();

      const call = async () => await startDissolving(BigInt(10));

      await expect(call).rejects.toThrow(mockIdentityErrorMsg);
      expect(spyStartDissolving).not.toHaveBeenCalled();

      resetIdentity();
    });

    it("should not update neuron if not controlled by user", async () => {
      mockAssertUserControlled(throwMock);

      const call = async () => await startDissolving(BigInt(10));

      await expect(call).rejects.toThrowError();
      expect(spyStartDissolving).not.toHaveBeenCalled();
    });
  });

  describe("stopDissolving", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it("should update neuron", async () => {
      mockAssertUserControlled();
      await stopDissolving(BigInt(10));

      expect(spyStopDissolving).toHaveBeenCalled();
    });

    it("should not update neuron if no identity", async () => {
      mockAssertUserControlled();
      setNoIdentity();

      const call = async () => await stopDissolving(BigInt(10));

      await expect(call).rejects.toThrow(mockIdentityErrorMsg);
      expect(spyStopDissolving).not.toHaveBeenCalled();

      resetIdentity();
    });

    it("should not update neuron if not controlled by user", async () => {
      mockAssertUserControlled();
      setNoIdentity();

      const call = async () => await stopDissolving(BigInt(10));

      await expect(call).rejects.toThrowError();
      expect(spyStopDissolving).not.toHaveBeenCalled();

      resetIdentity();
    });
  });

  describe("add followee", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it("should add the followee to next call", async () => {
      mockAssertControllable();
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
      mockAssertControllable();
      const followee = BigInt(8);
      const { neuronId } = neurons[0];
      neuronsStore.setNeurons(neurons);
      const topic = Topic.ExchangeRate;

      setNoIdentity();

      await addFollowee({
        neuronId,
        topic,
        followee,
      });

      expect(toastsStore.error).toHaveBeenCalled();
      expect(spySetFollowees).not.toHaveBeenCalled();
      resetIdentity();
    });

    it("should not call api if not controlled by user", async () => {
      mockAssertControllable(throwMock);
      const followee = BigInt(8);
      const { neuronId } = neurons[0];
      neuronsStore.setNeurons(neurons);
      const topic = Topic.ExchangeRate;

      await addFollowee({
        neuronId,
        topic,
        followee,
      });

      expect(toastsStore.error).toHaveBeenCalled();
      expect(spySetFollowees).not.toHaveBeenCalled();
    });
  });

  describe("remove followee", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it("should remove the followee to next call", async () => {
      mockAssertControllable();
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
      mockAssertControllable();
      const followee = BigInt(8);
      const neuronId = neurons[0].neuronId;
      neuronsStore.setNeurons(neurons);
      const topic = Topic.ExchangeRate;

      setNoIdentity();

      await removeFollowee({
        neuronId,
        topic,
        followee,
      });
      expect(toastsStore.error).toHaveBeenCalled();
      expect(spySetFollowees).not.toHaveBeenCalled();

      resetIdentity();
    });

    it("should not call api if no identity", async () => {
      mockAssertControllable(throwMock);
      const followee = BigInt(8);
      const neuronId = neurons[0].neuronId;
      neuronsStore.setNeurons(neurons);
      const topic = Topic.ExchangeRate;

      await removeFollowee({
        neuronId,
        topic,
        followee,
      });
      expect(toastsStore.error).toHaveBeenCalled();
      expect(spySetFollowees).not.toHaveBeenCalled();
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
