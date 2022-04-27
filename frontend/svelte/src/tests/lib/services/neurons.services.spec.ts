import { ICP, LedgerCanister, Topic } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { mock } from "jest-mock-extended";
import { tick } from "svelte/internal";
import { get } from "svelte/store";
import * as api from "../../../lib/api/governance.api";
import * as ledgerApi from "../../../lib/api/ledger.api";
import { E8S_PER_ICP } from "../../../lib/constants/icp.constants";
import * as services from "../../../lib/services/neurons.services";
import {
  definedNeuronsStore,
  neuronsStore,
} from "../../../lib/stores/neurons.store";
import { toastsStore } from "../../../lib/stores/toasts.store";
import { mockMainAccount } from "../../mocks/accounts.store.mock";
import {
  mockIdentity,
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "../../mocks/auth.store.mock";
import { mockFullNeuron, mockNeuron } from "../../mocks/neurons.mock";

const {
  addHotkey,
  addFollowee,
  routePathNeuronId,
  joinCommunityFund,
  listNeurons,
  loadNeuron,
  removeFollowee,
  removeHotkey,
  stakeAndLoadNeuron,
  startDissolving,
  stopDissolving,
  updateDelay,
  mergeNeurons,
} = services;

jest.mock("../../../lib/stores/toasts.store", () => {
  return {
    toastsStore: {
      error: jest.fn(),
      show: jest.fn(),
    },
  };
});

jest.mock("../../../lib/services/accounts.services", () => {
  return {
    syncAccounts: jest.fn(),
  };
});

describe("neurons-services", () => {
  const notControlledNeuron = {
    ...mockNeuron,
    neuronId: BigInt(123),
    fullNeuron: {
      ...mockFullNeuron,
      controller: "not-controller",
    },
  };
  const controlledNeuron = {
    ...mockNeuron,
    neuronId: BigInt(1234),
    fullNeuron: {
      ...mockFullNeuron,
      controller: mockIdentity.getPrincipal().toText(),
    },
  };
  const sameControlledNeuron = {
    ...mockNeuron,
    neuronId: BigInt(1234555),
    fullNeuron: {
      ...mockFullNeuron,
      controller: mockIdentity.getPrincipal().toText(),
    },
  };

  const spyStakeNeuron = jest
    .spyOn(api, "stakeNeuron")
    .mockImplementation(() => Promise.resolve(mockNeuron.neuronId));

  const spyGetNeuron = jest
    .spyOn(api, "queryNeuron")
    .mockImplementation(() => Promise.resolve(mockNeuron));

  const neurons = [sameControlledNeuron, controlledNeuron];

  const spyQueryNeurons = jest
    .spyOn(api, "queryNeurons")
    .mockImplementation(() => Promise.resolve(neurons));

  const spyIncreaseDissolveDelay = jest
    .spyOn(api, "increaseDissolveDelay")
    .mockImplementation(() => Promise.resolve());

  const spyJoinCommunityFund = jest
    .spyOn(api, "joinCommunityFund")
    .mockImplementation(() => Promise.resolve());

  const spyDisburse = jest
    .spyOn(api, "disburse")
    .mockImplementation(() => Promise.resolve());

  const spyMergeMaturity = jest
    .spyOn(api, "mergeMaturity")
    .mockImplementation(() => Promise.resolve());

  const spyMergeNeurons = jest
    .spyOn(api, "mergeNeurons")
    .mockImplementation(() => Promise.resolve());

  const spyAddHotkey = jest
    .spyOn(api, "addHotkey")
    .mockImplementation(() => Promise.resolve());

  const spyRemoveHotkey = jest
    .spyOn(api, "removeHotkey")
    .mockImplementation(() => Promise.resolve());

  const spySplitNeuron = jest
    .spyOn(api, "splitNeuron")
    .mockImplementation(() => Promise.resolve(BigInt(11)));

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

  afterEach(() => {
    spyGetNeuron.mockClear();
  });

  describe("stake new neuron", () => {
    it("should stake and load a neuron", async () => {
      await stakeAndLoadNeuron({ amount: 10 });

      expect(spyStakeNeuron).toHaveBeenCalled();

      const neuron = get(definedNeuronsStore)[0];
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

      const neuronsList = get(definedNeuronsStore);
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
      await tick();
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
      neuronsStore.setNeurons({ neurons: [], certified: true });
    });
    it("should update delay", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      await updateDelay({
        neuronId: controlledNeuron.neuronId,
        dissolveDelayInSeconds: 12000,
      });

      expect(spyIncreaseDissolveDelay).toHaveBeenCalled();
    });

    it("should not update delay if no identity", async () => {
      setNoIdentity();

      await updateDelay({
        neuronId: BigInt(10),
        dissolveDelayInSeconds: 12000,
      });

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spyIncreaseDissolveDelay).not.toHaveBeenCalled();

      resetIdentity();
    });

    it("should not update delay if neuron not controlled by user", async () => {
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron],
        certified: true,
      });

      await updateDelay({
        neuronId: notControlledNeuron.neuronId,
        dissolveDelayInSeconds: 12000,
      });

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spyIncreaseDissolveDelay).not.toHaveBeenCalled();

      neuronsStore.setNeurons({ neurons: [], certified: true });
    });
  });

  describe("joinCommunityFund", () => {
    afterEach(() => {
      jest.clearAllMocks();
      neuronsStore.setNeurons({ neurons: [], certified: true });
    });
    it("should update neuron", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      await joinCommunityFund(controlledNeuron.neuronId);

      expect(spyJoinCommunityFund).toHaveBeenCalled();
    });

    it("should not update neuron if no identity", async () => {
      setNoIdentity();

      await joinCommunityFund(BigInt(10));

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spyJoinCommunityFund).not.toHaveBeenCalled();

      resetIdentity();
    });

    it("should not update neuron if not controlled by user", async () => {
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron],
        certified: true,
      });

      await joinCommunityFund(notControlledNeuron.neuronId);

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spyJoinCommunityFund).not.toHaveBeenCalled();
    });
  });

  describe("disburse", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should disburse neuron", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      const { success } = await services.disburse({
        neuronId: controlledNeuron.neuronId,
        toAccountId: mockMainAccount.identifier,
      });

      expect(spyDisburse).toHaveBeenCalled();
      expect(success).toBe(true);
    });

    it("should not disburse neuron if no identity", async () => {
      setNoIdentity();

      const { success } = await services.disburse({
        neuronId: controlledNeuron.neuronId,
        toAccountId: mockMainAccount.identifier,
      });

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spyDisburse).not.toHaveBeenCalled();
      expect(success).toBe(false);

      resetIdentity();
    });

    it("should not disburse neuron if not controlled by user", async () => {
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron],
        certified: true,
      });

      const { success } = await services.disburse({
        neuronId: notControlledNeuron.neuronId,
        toAccountId: mockMainAccount.identifier,
      });

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spyDisburse).not.toHaveBeenCalled();
      expect(success).toBe(false);
    });
  });

  describe("mergeMaturity", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should merge maturity of the neuron", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      const { success } = await services.mergeMaturity({
        neuronId: controlledNeuron.neuronId,
        percentageToMerge: 50,
      });

      expect(spyMergeMaturity).toHaveBeenCalled();
      expect(success).toBe(true);
    });

    it("should not merge maturity if no identity", async () => {
      setNoIdentity();

      const { success } = await services.mergeMaturity({
        neuronId: controlledNeuron.neuronId,
        percentageToMerge: 50,
      });

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spyMergeMaturity).not.toHaveBeenCalled();
      expect(success).toBe(false);

      resetIdentity();
    });

    it("should not merge maturity if not controlled by user", async () => {
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron],
        certified: true,
      });

      const { success } = await services.mergeMaturity({
        neuronId: notControlledNeuron.neuronId,
        percentageToMerge: 50,
      });

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spyMergeMaturity).not.toHaveBeenCalled();
      expect(success).toBe(false);
    });
  });

  describe("mergeNeurons", () => {
    afterEach(() => {
      jest.clearAllMocks();
      neuronsStore.setNeurons({ neurons: [], certified: true });
    });

    it("should update neuron", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      await mergeNeurons({
        sourceNeuronId: neurons[0].neuronId,
        targetNeuronId: neurons[1].neuronId,
      });

      expect(spyMergeNeurons).toHaveBeenCalled();
    });

    it("should not update neuron if no identity", async () => {
      setNoIdentity();

      await mergeNeurons({
        sourceNeuronId: neurons[0].neuronId,
        targetNeuronId: neurons[1].neuronId,
      });

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spyMergeNeurons).not.toHaveBeenCalled();

      resetIdentity();
    });
    it("should not update neuron if different controllers", async () => {
      const neuron = {
        ...mockNeuron,
        neuronId: BigInt(5555),
        fullNeuron: {
          ...mockFullNeuron,
          controller: "another",
        },
      };
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron, neuron],
        certified: true,
      });

      await mergeNeurons({
        sourceNeuronId: notControlledNeuron.neuronId,
        targetNeuronId: neuron.neuronId,
      });

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spyMergeNeurons).not.toHaveBeenCalled();
    });
  });

  describe("addHotkey", () => {
    afterEach(() => {
      jest.clearAllMocks();
      neuronsStore.setNeurons({ neurons: [], certified: true });
    });
    it("should update neuron", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      await addHotkey({
        neuronId: controlledNeuron.neuronId,
        principal: Principal.fromText("aaaaa-aa"),
      });

      expect(spyAddHotkey).toHaveBeenCalled();
    });

    it("should not update neuron if no identity", async () => {
      setNoIdentity();

      await addHotkey({
        neuronId: controlledNeuron.neuronId,
        principal: Principal.fromText("aaaaa-aa"),
      });

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spyAddHotkey).not.toHaveBeenCalled();

      resetIdentity();
    });

    it("should not update neuron if not controlled by user", async () => {
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron],
        certified: true,
      });

      await addHotkey({
        neuronId: controlledNeuron.neuronId,
        principal: Principal.fromText("aaaaa-aa"),
      });

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spyAddHotkey).not.toHaveBeenCalled();
    });
  });

  describe("removeHotkey", () => {
    afterEach(() => {
      jest.clearAllMocks();
      neuronsStore.setNeurons({ neurons: [], certified: true });
    });
    it("should update neuron", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      await removeHotkey({
        neuronId: controlledNeuron.neuronId,
        principalString: "aaaaa-aa",
      });

      expect(spyRemoveHotkey).toHaveBeenCalled();
    });

    it("should not update neuron if invalid principal", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      await removeHotkey({
        neuronId: controlledNeuron.neuronId,
        principalString: "not-valid",
      });

      expect(spyRemoveHotkey).not.toHaveBeenCalled();
    });

    it("should not update neuron if no identity", async () => {
      setNoIdentity();

      await removeHotkey({
        neuronId: controlledNeuron.neuronId,
        principalString: "aaaaa-aa",
      });

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spyRemoveHotkey).not.toHaveBeenCalled();

      resetIdentity();
    });

    it("should not update neuron if not controlled by user", async () => {
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron],
        certified: true,
      });

      await removeHotkey({
        neuronId: controlledNeuron.neuronId,
        principalString: "aaaaa-aa",
      });

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spyRemoveHotkey).not.toHaveBeenCalled();
    });
  });

  describe("startDissolving", () => {
    afterEach(() => {
      jest.clearAllMocks();
      neuronsStore.setNeurons({ neurons: [], certified: true });
    });
    it("should update neuron", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      await startDissolving(controlledNeuron.neuronId);

      expect(spyStartDissolving).toHaveBeenCalled();
    });

    it("should not update neuron if no identity", async () => {
      setNoIdentity();

      await startDissolving(BigInt(10));

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spyStartDissolving).not.toHaveBeenCalled();

      resetIdentity();
    });

    it("should not update neuron if not controlled by user", async () => {
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron],
        certified: true,
      });

      await startDissolving(notControlledNeuron.neuronId);

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spyStartDissolving).not.toHaveBeenCalled();
    });
  });

  describe("stopDissolving", () => {
    afterEach(() => {
      jest.clearAllMocks();
      neuronsStore.setNeurons({ neurons: [], certified: true });
    });
    it("should update neuron", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      await stopDissolving(controlledNeuron.neuronId);

      expect(spyStopDissolving).toHaveBeenCalled();
    });

    it("should not update neuron if no identity", async () => {
      setNoIdentity();

      await stopDissolving(BigInt(10));

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spyStopDissolving).not.toHaveBeenCalled();

      resetIdentity();
    });

    it("should not update neuron if not controlled by user", async () => {
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron],
        certified: true,
      });

      await stopDissolving(notControlledNeuron.neuronId);

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spyStopDissolving).not.toHaveBeenCalled();
    });
  });

  describe("splitNeuron", () => {
    afterEach(() => {
      jest.clearAllMocks();
      neuronsStore.setNeurons({ neurons: [], certified: true });
    });
    it("should update neuron", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      await services.splitNeuron({
        neuronId: controlledNeuron.neuronId,
        amount: 2.2,
      });

      expect(spySplitNeuron).toHaveBeenCalled();
    });

    it("should not update neuron if no identity", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      setNoIdentity();

      await services.splitNeuron({
        neuronId: controlledNeuron.neuronId,
        amount: 2.2,
      });

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spySplitNeuron).not.toHaveBeenCalled();

      resetIdentity();
    });

    it("should not update neuron if not controlled by user", async () => {
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron],
        certified: true,
      });

      await services.splitNeuron({
        neuronId: notControlledNeuron.neuronId,
        amount: 2.2,
      });

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spySplitNeuron).not.toHaveBeenCalled();

      neuronsStore.setNeurons({ neurons: [], certified: true });
    });
  });

  describe("add followee", () => {
    afterEach(() => {
      jest.clearAllMocks();
      neuronsStore.setNeurons({ neurons: [], certified: true });
    });
    it("should add the followee to next call", async () => {
      const followee = BigInt(8);
      neuronsStore.setNeurons({ neurons, certified: true });
      const topic = Topic.ExchangeRate;
      await addFollowee({
        neuronId: controlledNeuron.neuronId,
        topic,
        followee,
      });

      const expectedArgument = {
        neuronId: controlledNeuron.neuronId,
        identity: mockIdentity,
        topic,
        followees: [followee],
      };
      expect(spySetFollowees).toHaveBeenCalledWith(expectedArgument);
    });

    it("should not call api if no identity", async () => {
      const followee = BigInt(8);
      neuronsStore.setNeurons({ neurons, certified: true });
      const topic = Topic.ExchangeRate;

      setNoIdentity();

      await addFollowee({
        neuronId: controlledNeuron.neuronId,
        topic,
        followee,
      });

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spySetFollowees).not.toHaveBeenCalled();
      resetIdentity();
    });

    it("should not call api if not controlled by user nor hotkey", async () => {
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron],
        certified: true,
      });
      const followee = BigInt(8);
      const topic = Topic.ExchangeRate;

      await addFollowee({
        neuronId: notControlledNeuron.neuronId,
        topic,
        followee,
      });

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spySetFollowees).not.toHaveBeenCalled();
    });
  });

  describe("remove followee", () => {
    afterEach(() => {
      jest.clearAllMocks();
      neuronsStore.setNeurons({ neurons: [], certified: true });
    });
    const followee = BigInt(8);
    const topic = Topic.ExchangeRate;
    const neuronFollowing = {
      ...controlledNeuron,
      fullNeuron: {
        ...controlledNeuron.fullNeuron,
        followees: [{ topic, followees: [followee] }],
      },
    };
    it("should remove the followee to next call", async () => {
      const followee = BigInt(8);
      const topic = Topic.ExchangeRate;
      const neuronFollowing = {
        ...controlledNeuron,
        fullNeuron: {
          ...controlledNeuron.fullNeuron,
          followees: [{ topic, followees: [followee] }],
        },
      };
      neuronsStore.setNeurons({ neurons: [neuronFollowing], certified: true });
      await removeFollowee({
        neuronId: neuronFollowing.neuronId,
        topic,
        followee,
      });

      const expectedArgument = {
        neuronId: neuronFollowing.neuronId,
        identity: mockIdentity,
        topic,
        followees: [],
      };
      expect(spySetFollowees).toHaveBeenCalledWith(expectedArgument);
    });

    it("should not call api if no identity", async () => {
      neuronsStore.setNeurons({ neurons: [neuronFollowing], certified: true });

      setNoIdentity();

      await removeFollowee({
        neuronId: controlledNeuron.neuronId,
        topic,
        followee,
      });
      expect(toastsStore.show).toHaveBeenCalled();
      expect(spySetFollowees).not.toHaveBeenCalled();

      resetIdentity();
    });

    it("should not call api if user not controller nor hotkey", async () => {
      const followee = BigInt(8);
      const topic = Topic.ExchangeRate;
      const notControlled = {
        ...notControlledNeuron,
        fullNeuron: {
          ...notControlledNeuron.fullNeuron,
          followees: [{ topic, followees: [followee] }],
        },
      };
      neuronsStore.pushNeurons({
        neurons: [notControlled],
        certified: true,
      });

      await removeFollowee({
        neuronId: notControlled.neuronId,
        topic,
        followee,
      });
      expect(toastsStore.show).toHaveBeenCalled();
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
      expect(routePathNeuronId("/#/neuron/123")).toBe(BigInt(123));
      expect(routePathNeuronId("/#/neuron/0")).toBe(BigInt(0));
    });

    it("should not get neuronId from invalid path", async () => {
      expect(routePathNeuronId("/#/neuron/")).toBeUndefined();
      expect(routePathNeuronId("/#/neuron/1.5")).toBeUndefined();
      expect(routePathNeuronId("/#/neuron/123n")).toBeUndefined();
    });
  });

  describe("load neuron", () => {
    it("should get neuron from neurons store if presented and not call queryNeuron", async () => {
      neuronsStore.pushNeurons({ neurons: [mockNeuron], certified: true });
      await loadNeuron({
        neuronId: mockNeuron.neuronId,
        setNeuron: ({ neuron, certified }) => {
          neuronsStore.setNeurons({ neurons: [], certified });
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
