import type { Identity } from "@dfinity/agent";
import { ICP, LedgerCanister, Topic } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { mock } from "jest-mock-extended";
import { tick } from "svelte/internal";
import { get } from "svelte/store";
import * as api from "../../../lib/api/governance.api";
import {
  E8S_PER_ICP,
  TRANSACTION_FEE_E8S,
} from "../../../lib/constants/icp.constants";
import { getAccountIdentityByPrincipal } from "../../../lib/services/accounts.services";
import * as services from "../../../lib/services/neurons.services";
import * as busyStore from "../../../lib/stores/busy.store";
import {
  definedNeuronsStore,
  neuronsStore,
} from "../../../lib/stores/neurons.store";
import { toastsStore } from "../../../lib/stores/toasts.store";
import { NotAuthorizedNeuronError } from "../../../lib/types/neurons.errors";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "../../mocks/accounts.store.mock";
import {
  mockIdentity,
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "../../mocks/auth.store.mock";
import { mockFullNeuron, mockNeuron } from "../../mocks/neurons.mock";

const {
  addHotkey,
  addHotkeyForHardwareWalletNeuron,
  addFollowee,
  routePathNeuronId,
  getIdentityOfControllerByNeuronId,
  joinCommunityFund,
  listNeurons,
  loadNeuron,
  removeFollowee,
  removeHotkey,
  stakeNeuron,
  startDissolving,
  stopDissolving,
  updateDelay,
  mergeNeurons,
  reloadNeuron,
} = services;

jest.mock("../../../lib/stores/toasts.store", () => {
  return {
    toastsStore: {
      error: jest.fn(),
      show: jest.fn(),
    },
  };
});

let testIdentity: Identity | null = mockIdentity;
const setNoAccountIdentity = () => (testIdentity = null);
const resetAccountIdentity = () => (testIdentity = mockIdentity);
const setAccountIdentity = (newIdentity: Identity) =>
  (testIdentity = newIdentity);

jest.mock("../../../lib/services/accounts.services", () => {
  return {
    syncAccounts: jest.fn(),
    getAccountIdentityByPrincipal: jest
      .fn()
      .mockImplementation(() => Promise.resolve(testIdentity)),
    getAccountIdentity: jest
      .fn()
      .mockImplementation(() => Promise.resolve(testIdentity)),
  };
});

const mockLedgerIdentity = () => Promise.resolve(mockIdentity);
let getLedgerIdentityImplementation = mockLedgerIdentity;
const setLedgerThrow = () =>
  (getLedgerIdentityImplementation = () => {
    throw new Error("Test");
  });
const resetLedger = () =>
  (getLedgerIdentityImplementation = mockLedgerIdentity);

jest.mock("../../../lib/proxy/ledger.services.proxy", () => {
  return {
    getLedgerIdentityProxy: jest
      .fn()
      .mockImplementation(() => getLedgerIdentityImplementation()),
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

  const spySpawnNeuron = jest
    .spyOn(api, "spawnNeuron")
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

  afterEach(() => {
    spyGetNeuron.mockClear();
    jest.clearAllMocks();
  });

  describe("stake new neuron", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it("should stake a neuron from main account", async () => {
      const newNeuronId = await stakeNeuron({
        amount: 10,
        account: mockMainAccount,
      });

      expect(spyStakeNeuron).toHaveBeenCalled();
      expect(newNeuronId).toEqual(mockNeuron.neuronId);
    });

    it("should stake and load a neuron from subaccount", async () => {
      const newNeuronId = await stakeNeuron({
        amount: 10,
        account: mockSubAccount,
      });

      expect(spyStakeNeuron).toHaveBeenCalled();
      expect(newNeuronId).toEqual(mockNeuron.neuronId);
    });

    it("should stake neuron from hardware wallet", async () => {
      const newNeuronId = await stakeNeuron({
        amount: 10,
        account: mockHardwareWalletAccount,
      });

      expect(spyStakeNeuron).toHaveBeenCalled();
      expect(newNeuronId).toEqual(mockNeuron.neuronId);
    });

    it(`stakeNeuron return undefined if amount less than ${
      E8S_PER_ICP / E8S_PER_ICP
    } ICP`, async () => {
      jest
        .spyOn(LedgerCanister, "create")
        .mockImplementation(() => mock<LedgerCanister>());

      const response = await stakeNeuron({
        amount: 0.1,
        account: mockMainAccount,
      });

      expect(response).toBeUndefined();
      expect(toastsStore.error).toBeCalled();
    });

    it("stake neuron should return undefined if amount not valid", async () => {
      jest
        .spyOn(LedgerCanister, "create")
        .mockImplementation(() => mock<LedgerCanister>());

      const response = await stakeNeuron({
        amount: NaN,
        account: mockMainAccount,
      });

      expect(response).toBeUndefined();
      expect(toastsStore.error).toBeCalled();
    });

    it("should not stake neuron if no identity", async () => {
      setNoAccountIdentity();

      const response = await stakeNeuron({
        amount: 10,
        account: mockMainAccount,
      });

      expect(response).toBeUndefined();
      expect(toastsStore.error).toBeCalled();

      resetAccountIdentity();
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

  describe("spawnNeuron", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should spawn a neuron from maturity", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      const { success } = await services.spawnNeuron({
        neuronId: controlledNeuron.neuronId,
        percentageToSpawn: 50,
      });

      expect(spySpawnNeuron).toHaveBeenCalled();
      expect(success).toBe(true);
    });

    it("should not spawn neuron if no identity", async () => {
      setNoIdentity();

      const { success } = await services.spawnNeuron({
        neuronId: controlledNeuron.neuronId,
        percentageToSpawn: 50,
      });

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spySpawnNeuron).not.toHaveBeenCalled();
      expect(success).toBe(false);

      resetIdentity();
    });

    it("should not spawn neuron if not controlled by user", async () => {
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron],
        certified: true,
      });

      const { success } = await services.spawnNeuron({
        neuronId: notControlledNeuron.neuronId,
        percentageToSpawn: 50,
      });

      expect(toastsStore.show).toHaveBeenCalled();
      expect(spySpawnNeuron).not.toHaveBeenCalled();
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

  describe("addHotkeyForHardwareWalletNeuron", () => {
    it("should update neuron", async () => {
      await addHotkeyForHardwareWalletNeuron({
        neuronId: controlledNeuron.neuronId,
        accountIdentifier: mockMainAccount.identifier,
      });

      expect(spyAddHotkey).toHaveBeenCalled();
    });

    it("should display appropriate busy screen", async () => {
      const spyBusyStart = jest.spyOn(busyStore, "startBusy");
      const spyBusyStop = jest.spyOn(busyStore, "stopBusy");

      await addHotkeyForHardwareWalletNeuron({
        neuronId: controlledNeuron.neuronId,
        accountIdentifier: mockMainAccount.identifier,
      });

      expect(spyBusyStart).toBeCalledWith({
        initiator: "add-hotkey-neuron",
        labelKey: "busy_screen.pending_approval_hw",
      });
      expect(spyBusyStop).toBeCalledWith("add-hotkey-neuron");
    });

    it("should load and append neuron to store once added", async () => {
      await addHotkeyForHardwareWalletNeuron({
        neuronId: controlledNeuron.neuronId,
        accountIdentifier: mockMainAccount.identifier,
      });

      const neurons = get(neuronsStore);
      expect(neurons).toEqual({ certified: true, neurons: [mockNeuron] });
    });

    it("should not update if ledger connection throws an error", async () => {
      setLedgerThrow();
      await addHotkeyForHardwareWalletNeuron({
        neuronId: controlledNeuron.neuronId,
        accountIdentifier: mockMainAccount.identifier,
      });

      expect(spyAddHotkey).not.toHaveBeenCalled();
      resetLedger();
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

    it("should update neuron and return success when user removes itself", async () => {
      spyGetNeuron.mockImplementation(
        jest.fn().mockRejectedValue(new NotAuthorizedNeuronError())
      );
      neuronsStore.pushNeurons({ neurons, certified: true });

      const expectedId = await removeHotkey({
        neuronId: controlledNeuron.neuronId,
        principalString: mockIdentity.getPrincipal().toText() as string,
      });

      expect(spyRemoveHotkey).toHaveBeenCalled();
      expect(expectedId).toBeDefined();
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

    it("should add transaction fee to the amount", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      const amount = 2.2;
      const transactionFee = TRANSACTION_FEE_E8S / E8S_PER_ICP;
      const amountWithFee = amount + transactionFee;
      await services.splitNeuron({
        neuronId: controlledNeuron.neuronId,
        amount,
      });

      expect(spySplitNeuron).toHaveBeenCalledWith({
        identity: mockIdentity,
        neuronId: controlledNeuron.neuronId,
        amount: ICP.fromE8s(BigInt(Math.round(amountWithFee * E8S_PER_ICP))),
      });
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

    it("should not call api if trying follow itself", async () => {
      neuronsStore.setNeurons({ neurons, certified: true });
      const topic = Topic.ExchangeRate;

      await addFollowee({
        neuronId: controlledNeuron.neuronId,
        topic,
        followee: controlledNeuron.neuronId,
      });

      expect(toastsStore.error).toHaveBeenCalled();
      expect(spySetFollowees).not.toHaveBeenCalled();
    });

    it("should not call api if trying follow a neuron already added", async () => {
      const topic = Topic.ExchangeRate;
      const followee = BigInt(10);
      const neuron = {
        ...controlledNeuron,
        fullNeuron: {
          ...controlledNeuron.fullNeuron,
          followees: [{ topic, followees: [followee] }],
        },
      };
      neuronsStore.setNeurons({ neurons: [neuron], certified: true });

      await addFollowee({
        neuronId: neuron.neuronId,
        topic,
        followee: followee,
      });

      expect(toastsStore.error).toHaveBeenCalled();
      expect(spySetFollowees).not.toHaveBeenCalled();
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

    it("should call api if not controlled by user but controlled by hotkey", async () => {
      const followee = BigInt(8);
      const topic = Topic.ExchangeRate;
      const hotkeyNeuron = {
        ...notControlledNeuron,
        fullNeuron: {
          ...notControlledNeuron.fullNeuron,
          hotKeys: [mockIdentity.getPrincipal().toText()],
        },
      };
      neuronsStore.pushNeurons({
        neurons: [hotkeyNeuron],
        certified: true,
      });

      await addFollowee({
        neuronId: hotkeyNeuron.neuronId,
        topic,
        followee,
      });

      expect(spySetFollowees).toHaveBeenCalled();
    });

    it("should not call api if not controlled by user but controlled by hotkey for topic Manage Neuron", async () => {
      const followee = BigInt(8);
      const topic = Topic.ManageNeuron;
      const hotkeyNeuron = {
        ...notControlledNeuron,
        fullNeuron: {
          ...notControlledNeuron.fullNeuron,
          hotKeys: [mockIdentity.getPrincipal().toText()],
        },
      };
      neuronsStore.pushNeurons({
        neurons: [hotkeyNeuron],
        certified: true,
      });

      await addFollowee({
        neuronId: hotkeyNeuron.neuronId,
        topic,
        followee,
      });

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

    it("should call api if user not controller but controlled by hotkey", async () => {
      const followee = BigInt(8);
      const topic = Topic.ExchangeRate;
      const hotkeyNeuron = {
        ...notControlledNeuron,
        fullNeuron: {
          ...notControlledNeuron.fullNeuron,
          followees: [{ topic, followees: [followee] }],
          hotKeys: [mockIdentity.getPrincipal().toText()],
        },
      };
      neuronsStore.pushNeurons({
        neurons: [hotkeyNeuron],
        certified: true,
      });

      await removeFollowee({
        neuronId: hotkeyNeuron.neuronId,
        topic,
        followee,
      });
      expect(spySetFollowees).toHaveBeenCalled();
    });

    it("should not call api if user not controller but controlled by hotkey and topic is manage neuron", async () => {
      const followee = BigInt(8);
      const topic = Topic.ManageNeuron;
      const hotkeyNeuron = {
        ...notControlledNeuron,
        fullNeuron: {
          ...notControlledNeuron.fullNeuron,
          followees: [{ topic, followees: [followee] }],
          hotKeys: [mockIdentity.getPrincipal().toText()],
        },
      };
      neuronsStore.pushNeurons({
        neurons: [hotkeyNeuron],
        certified: true,
      });

      await removeFollowee({
        neuronId: hotkeyNeuron.neuronId,
        topic,
        followee,
      });
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
    afterEach(() => jest.clearAllMocks());
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
        setNeuron: jest.fn(),
      });
      expect(spyGetNeuron).toBeCalled();
    });

    it("should call setNeuron even if the neuron doesn't have fullNeuron", async () => {
      const neuronId = BigInt(333333);
      const publicInfoNeuron = {
        ...mockNeuron,
        neuronId,
        fullNeuron: undefined,
      };
      spyGetNeuron.mockImplementation(() => Promise.resolve(publicInfoNeuron));
      const setNeuronSpy = jest.fn();
      await loadNeuron({
        neuronId,
        setNeuron: setNeuronSpy,
      });
      expect(spyGetNeuron).toBeCalled();
      expect(setNeuronSpy).toBeCalled();
      // Reset spy implementation
      spyGetNeuron.mockImplementation(() => Promise.resolve(mockNeuron));
    });
  });

  describe("reloadNeuron", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      neuronsStore.setNeurons({ neurons: [], certified: true });
    });
    it("should call the api", async () => {
      await reloadNeuron(mockNeuron.neuronId);
      expect(spyGetNeuron).toBeCalled();
    });

    it("should add neuron to the store", async () => {
      await reloadNeuron(mockNeuron.neuronId);
      const store = get(neuronsStore);
      expect(
        store.neurons?.find(({ neuronId }) => neuronId === mockNeuron.neuronId)
      ).toBeDefined();
    });

    it("should claim or refresh neuron", async () => {
      await reloadNeuron(mockNeuron.neuronId);
      expect(spyClaimOrRefresh).toBeCalled();
    });
  });

  describe("getIdentityOfControllerByNeuronId", () => {
    afterEach(() => {
      jest.clearAllMocks();
      neuronsStore.setNeurons({ neurons: [], certified: true });
    });
    it("should return identity from authStore first", async () => {
      const controlledNeuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: mockIdentity.getPrincipal().toText(),
        },
      };
      neuronsStore.setNeurons({ neurons: [controlledNeuron], certified: true });
      const identity = await getIdentityOfControllerByNeuronId(
        controlledNeuron.neuronId
      );
      expect(identity).toBe(mockIdentity);
      expect(getAccountIdentityByPrincipal).not.toBeCalled();
    });

    it("should return identity from accounts service", async () => {
      const controller =
        "gje2w-p7x7x-yuy72-bllam-x2itq-znokr-jnvf6-5dzn4-45jiy-5wvbo-uqe";
      const newIdentity = {
        getPrincipal: () => Principal.fromText(controller),
      } as unknown as Identity;
      setAccountIdentity(newIdentity);
      const controlledNeuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller,
        },
      };
      neuronsStore.setNeurons({ neurons: [controlledNeuron], certified: true });
      const identity = await getIdentityOfControllerByNeuronId(
        controlledNeuron.neuronId
      );
      expect(identity).toBe(newIdentity);
      expect(getAccountIdentityByPrincipal).toBeCalled();
      resetIdentity();
    });

    it("should raise NotAuthorizedNeuronError if fullNeuron is not defined", () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: undefined,
      };
      neuronsStore.setNeurons({ neurons: [neuron], certified: true });
      const call = () => getIdentityOfControllerByNeuronId(neuron.neuronId);
      expect(call).rejects.toThrow(NotAuthorizedNeuronError);
    });

    it("should raise NotAuthorizedNeuronError if contoller is not in authStore nor accounts helper", async () => {
      setNoAccountIdentity();
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller:
            "gje2w-p7x7x-yuy72-bllam-x2itq-znokr-jnvf6-5dzn4-45jiy-5wvbo-uqe",
        },
      };
      neuronsStore.setNeurons({ neurons: [neuron], certified: true });
      const call = () => getIdentityOfControllerByNeuronId(neuron.neuronId);
      expect(call).rejects.toThrow(NotAuthorizedNeuronError);
      resetAccountIdentity();
    });
  });
});
