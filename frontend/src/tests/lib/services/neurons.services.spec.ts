import { resetNeuronsApiService } from "$lib/api-services/governance.api-service";
import * as api from "$lib/api/governance.api";
import {
  DEFAULT_TRANSACTION_FEE_E8S,
  E8S_PER_ICP,
} from "$lib/constants/icp.constants";
import { MIN_NEURON_STAKE } from "$lib/constants/neurons.constants";
import {
  getAccountIdentityByPrincipal,
  loadBalance,
  transferICP,
} from "$lib/services/accounts.services";
import * as services from "$lib/services/neurons.services";
import { toggleAutoStakeMaturity } from "$lib/services/neurons.services";
import { accountsStore } from "$lib/stores/accounts.store";
import * as busyStore from "$lib/stores/busy.store";
import { definedNeuronsStore, neuronsStore } from "$lib/stores/neurons.store";
import { NotAuthorizedNeuronError } from "$lib/types/neurons.errors";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { numberToE8s } from "$lib/utils/token.utils";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/accounts.store.mock";
import {
  mockIdentity,
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { MockLedgerIdentity } from "$tests/mocks/ledger.identity.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import type { Identity } from "@dfinity/agent";
import { toastsStore } from "@dfinity/gix-components";
import { ICPToken, LedgerCanister, TokenAmount, Topic } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { LedgerError, type ResponseVersion } from "@zondax/ledger-icp";
import { mock } from "jest-mock-extended";
import { tick } from "svelte";
import { get } from "svelte/store";

const {
  addHotkey,
  addHotkeyForHardwareWalletNeuron,
  addFollowee,
  getIdentityOfControllerByNeuronId,
  toggleCommunityFund,
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
  topUpNeuron,
} = services;

const expectToastError = (contained: string) =>
  expect(get(toastsStore)).toMatchObject([
    {
      level: "error",
      text: expect.stringContaining(contained),
    },
  ]);

let testIdentity: Identity | null = mockIdentity;
const setNoAccountIdentity = () => (testIdentity = null);
const resetAccountIdentity = () => (testIdentity = mockIdentity);
const setAccountIdentity = (newIdentity: Identity) =>
  (testIdentity = newIdentity);

jest.mock("$lib/services/accounts.services", () => {
  return {
    loadBalance: jest.fn(),
    transferICP: jest.fn().mockResolvedValue({ success: true }),
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

jest.mock("$lib/proxy/ledger.services.proxy", () => {
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
  const newSpawnedNeuronId = BigInt(1234);

  const spyStakeNeuron = jest
    .spyOn(api, "stakeNeuron")
    .mockImplementation(() => Promise.resolve(mockNeuron.neuronId));

  const spyGetNeuron = jest
    .spyOn(api, "queryNeuron")
    .mockImplementation(() => Promise.resolve(mockNeuron));

  const neurons = [sameControlledNeuron, controlledNeuron];

  const spyIncreaseDissolveDelay = jest
    .spyOn(api, "increaseDissolveDelay")
    .mockImplementation(() => Promise.resolve());

  const spyJoinCommunityFund = jest
    .spyOn(api, "joinCommunityFund")
    .mockImplementation(() => Promise.resolve());

  const spyAutoStakeMaturity = jest
    .spyOn(api, "autoStakeMaturity")
    .mockImplementation(() => Promise.resolve());

  const spyLeaveCommunityFund = jest
    .spyOn(api, "leaveCommunityFund")
    .mockImplementation(() => Promise.resolve());

  const spyDisburse = jest
    .spyOn(api, "disburse")
    .mockImplementation(() => Promise.resolve());

  const spyMergeMaturity = jest
    .spyOn(api, "mergeMaturity")
    .mockImplementation(() => Promise.resolve());

  const spyStakeMaturity = jest
    .spyOn(api, "stakeMaturity")
    .mockImplementation(() => Promise.resolve());

  const spySpawnNeuron = jest
    .spyOn(api, "spawnNeuron")
    .mockImplementation(() => Promise.resolve(newSpawnedNeuronId));

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

  beforeEach(() => {
    spyGetNeuron.mockClear();
    jest.clearAllMocks();
    neuronsStore.reset();
    accountsStore.resetForTesting();
    resetIdentity();
    resetAccountIdentity();
    toastsStore.reset();
    resetNeuronsApiService();
  });

  describe("stake new neuron", () => {
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
      expectToastError(en.error.amount_not_enough_stake_neuron);
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
      expectToastError("Invalid number NaN");
    });

    it("stake neuron should return undefined if not enough funds in account", async () => {
      jest
        .spyOn(LedgerCanister, "create")
        .mockImplementation(() => mock<LedgerCanister>());

      // 10 ICPs
      const amount = 10;
      const response = await stakeNeuron({
        amount,
        account: {
          ...mockMainAccount,
          balance: TokenAmount.fromString({
            amount: String(amount - 1),
            token: ICPToken,
          }) as TokenAmount,
        },
      });

      expect(response).toBeUndefined();
      expectToastError(en.error.insufficient_funds);
    });

    it("should not stake neuron if no identity", async () => {
      setNoAccountIdentity();

      const response = await stakeNeuron({
        amount: 10,
        account: mockMainAccount,
      });

      expect(response).toBeUndefined();
      expectToastError("Cannot read properties of null");
    });
  });

  describe("list neurons", () => {
    const spyQueryNeurons = jest
      .spyOn(api, "queryNeurons")
      .mockResolvedValue(neurons);

    it("should list neurons", async () => {
      const oldNeuronsList = get(definedNeuronsStore);
      expect(oldNeuronsList).toEqual([]);

      await listNeurons();

      expect(spyQueryNeurons).toHaveBeenCalled();

      const newNeuronsList = get(definedNeuronsStore);
      expect(newNeuronsList).toEqual(neurons);
    });

    it("should not call api when called twice and cache is not reset", async () => {
      await listNeurons();

      expect(spyQueryNeurons).toHaveBeenCalledWith({
        identity: mockIdentity,
        certified: true,
      });

      expect(spyQueryNeurons).toHaveBeenCalledWith({
        identity: mockIdentity,
        certified: false,
      });

      expect(spyQueryNeurons).toHaveBeenCalledTimes(2);

      await listNeurons();

      expect(spyQueryNeurons).toHaveBeenCalledTimes(2);
    });

    it("should not list neurons if no identity", async () => {
      setNoIdentity();

      const call = async () => await listNeurons();

      await expect(call).rejects.toThrow(mockIdentityErrorMsg);
    });
  });

  describe("update delay", () => {
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

      expectToastError(en.error.missing_identity);
      expect(spyIncreaseDissolveDelay).not.toHaveBeenCalled();
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

      expectToastError(en.error.not_authorized_neuron_action);
      expect(spyIncreaseDissolveDelay).not.toHaveBeenCalled();

      neuronsStore.setNeurons({ neurons: [], certified: true });
    });
  });

  describe("toggleCommunityFund", () => {
    it("should call joinCommunity find if neuron is not part yet", async () => {
      const neuron = {
        ...controlledNeuron,
        joinedCommunityFundTimestampSeconds: undefined,
      };
      neuronsStore.pushNeurons({ neurons: [neuron], certified: true });
      await toggleCommunityFund(neuron);

      expect(spyJoinCommunityFund).toHaveBeenCalled();
    });

    it("should call leaveCommunity find if neuron is in the fund already", async () => {
      const neuron = {
        ...controlledNeuron,
        joinedCommunityFundTimestampSeconds: BigInt(2000),
      };
      neuronsStore.pushNeurons({ neurons: [neuron], certified: true });
      await toggleCommunityFund(neuron);

      expect(spyLeaveCommunityFund).toHaveBeenCalled();
    });

    it("should not update neuron if no identity", async () => {
      const neuron = {
        ...controlledNeuron,
        joinedCommunityFundTimestampSeconds: BigInt(2000),
      };
      setNoIdentity();

      await toggleCommunityFund(neuron);

      expectToastError(en.error.missing_identity);
      expect(spyJoinCommunityFund).not.toHaveBeenCalled();
      expect(spyLeaveCommunityFund).not.toHaveBeenCalled();
    });

    it("should not update neuron if not controlled by user", async () => {
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron],
        certified: true,
      });

      await toggleCommunityFund(notControlledNeuron);

      expectToastError(en.error.not_authorized_neuron_action);
      expect(spyJoinCommunityFund).not.toHaveBeenCalled();
      expect(spyLeaveCommunityFund).not.toHaveBeenCalled();
    });
  });

  describe("toggleAutoStakeMaturity", () => {
    const buildNeuron = (autoStakeMaturity: boolean | undefined) => ({
      ...controlledNeuron,
      fullNeuron: {
        ...controlledNeuron.fullNeuron,
        autoStakeMaturity,
      },
    });

    it("should toggle auto stake maturity if not yet defined", async () => {
      const neuron = buildNeuron(undefined);
      neuronsStore.pushNeurons({ neurons: [neuron], certified: true });
      await toggleAutoStakeMaturity(neuron);

      expect(spyAutoStakeMaturity).toHaveBeenCalledWith({
        neuronId: neuron.neuronId,
        autoStake: true,
        identity: testIdentity,
      });
    });

    it("should toggle auto stake maturity if currently set to false", async () => {
      const neuron = buildNeuron(undefined);
      neuronsStore.pushNeurons({ neurons: [neuron], certified: true });
      await toggleAutoStakeMaturity(neuron);

      expect(spyAutoStakeMaturity).toHaveBeenCalledWith({
        neuronId: neuron.neuronId,
        autoStake: true,
        identity: testIdentity,
      });
    });

    it("should disable auto stake maturity if already on", async () => {
      const neuron = buildNeuron(true);
      neuronsStore.pushNeurons({ neurons: [neuron], certified: true });
      await toggleAutoStakeMaturity(neuron);

      expect(spyAutoStakeMaturity).toHaveBeenCalledWith({
        neuronId: neuron.neuronId,
        autoStake: false,
        identity: testIdentity,
      });
    });

    it("should not toggle auto stake maturity for neuron if no identity", async () => {
      const neuron = buildNeuron(true);
      setNoIdentity();

      await toggleAutoStakeMaturity(neuron);

      expectToastError(en.error.missing_identity);
      expect(spyAutoStakeMaturity).not.toHaveBeenCalled();
    });

    it("should not toggle auto stake maturity if not controlled by user", async () => {
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron],
        certified: true,
      });

      await toggleAutoStakeMaturity(notControlledNeuron);

      expectToastError(en.error.not_authorized_neuron_action);
      expect(spyAutoStakeMaturity).not.toHaveBeenCalled();
    });

    it("should not toggle auto stake maturity if hw version is lower than candid parser version", async () => {
      const version: ResponseVersion = {
        testMode: false,
        major: 1,
        minor: 9,
        patch: 9,
        deviceLocked: false,
        targetId: "test",
        returnCode: LedgerError.NoErrors,
      };
      const smallerVersionIdentity = new MockLedgerIdentity({ version });
      setAccountIdentity(smallerVersionIdentity);
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: smallerVersionIdentity.getPrincipal().toText(),
        },
      };
      neuronsStore.pushNeurons({ neurons: [neuron], certified: true });

      await toggleAutoStakeMaturity(neuron);

      expectToastError(
        replacePlaceholders(en.error__ledger.version_not_supported, {
          $minVersion: "2.2.1",
          $currentVersion: "1.9.9",
        })
      );
      expect(spyAutoStakeMaturity).not.toHaveBeenCalled();
    });
  });

  describe("disburse", () => {
    it("should disburse neuron", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      const { success } = await services.disburse({
        neuronId: controlledNeuron.neuronId,
        toAccountId: mockMainAccount.identifier,
      });

      expect(spyDisburse).toHaveBeenCalled();
      expect(success).toBe(true);
    });

    it("should sync account balance", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      await services.disburse({
        neuronId: controlledNeuron.neuronId,
        toAccountId: mockMainAccount.identifier,
      });

      expect(loadBalance).toHaveBeenCalledTimes(1);
    });

    it("should not disburse neuron if no identity", async () => {
      setNoIdentity();

      const { success } = await services.disburse({
        neuronId: controlledNeuron.neuronId,
        toAccountId: mockMainAccount.identifier,
      });

      expectToastError(en.error.missing_identity);
      expect(spyDisburse).not.toHaveBeenCalled();
      expect(success).toBe(false);
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

      expectToastError(en.error.not_authorized_neuron_action);
      expect(spyDisburse).not.toHaveBeenCalled();
      expect(success).toBe(false);
    });
  });

  describe("mergeMaturity", () => {
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

      expectToastError(en.error.missing_identity);
      expect(spyMergeMaturity).not.toHaveBeenCalled();
      expect(success).toBe(false);
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

      expectToastError(en.error.not_authorized_neuron_action);
      expect(spyMergeMaturity).not.toHaveBeenCalled();
      expect(success).toBe(false);
    });
  });

  describe("stakeMaturity", () => {
    it("should stake maturity of the neuron", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      const { success } = await services.stakeMaturity({
        neuronId: controlledNeuron.neuronId,
        percentageToStake: 50,
      });

      expect(spyStakeMaturity).toHaveBeenCalled();
      expect(success).toBe(true);
    });

    it("should not stake maturity if no identity", async () => {
      setNoIdentity();

      const { success } = await services.stakeMaturity({
        neuronId: controlledNeuron.neuronId,
        percentageToStake: 50,
      });

      expectToastError(en.error.missing_identity);
      expect(spyStakeMaturity).not.toHaveBeenCalled();
      expect(success).toBe(false);
    });

    it("should not stake maturity if lower HW version than required", async () => {
      const version: ResponseVersion = {
        testMode: false,
        major: 1,
        minor: 9,
        patch: 9,
        deviceLocked: false,
        targetId: "test",
        returnCode: LedgerError.NoErrors,
      };
      const smallerVersionIdentity = new MockLedgerIdentity({ version });
      setAccountIdentity(smallerVersionIdentity);
      const neuron = {
        ...mockNeuron,
        fullNeuron: {
          ...mockFullNeuron,
          controller: smallerVersionIdentity.getPrincipal().toText(),
        },
      };
      neuronsStore.pushNeurons({ neurons: [neuron], certified: true });

      const { success } = await services.stakeMaturity({
        neuronId: neuron.neuronId,
        percentageToStake: 50,
      });

      expectToastError(
        replacePlaceholders(en.error__ledger.version_not_supported, {
          $minVersion: "2.2.1",
          $currentVersion: "1.9.9",
        })
      );
      expect(spyStakeMaturity).not.toHaveBeenCalled();
      expect(success).toBe(false);
    });

    it("should not stake maturity if not controlled by user", async () => {
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron],
        certified: true,
      });

      const { success } = await services.stakeMaturity({
        neuronId: notControlledNeuron.neuronId,
        percentageToStake: 50,
      });

      expectToastError(en.error.not_authorized_neuron_action);
      expect(spyStakeMaturity).not.toHaveBeenCalled();
      expect(success).toBe(false);
    });
  });

  describe("spawnNeuron", () => {
    it("should spawn a neuron from maturity", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      const newNeuronId = await services.spawnNeuron({
        neuronId: controlledNeuron.neuronId,
        percentageToSpawn: 50,
      });

      expect(spySpawnNeuron).toHaveBeenCalled();
      expect(newNeuronId).toEqual(newSpawnedNeuronId);
    });

    it("should not spawn neuron if no identity", async () => {
      setNoIdentity();

      const newNeuronId = await services.spawnNeuron({
        neuronId: controlledNeuron.neuronId,
        percentageToSpawn: 50,
      });

      expectToastError(en.error.missing_identity);
      expect(spySpawnNeuron).not.toHaveBeenCalled();
      expect(newNeuronId).toBeUndefined();
    });

    it("should not spawn neuron if not controlled by user", async () => {
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron],
        certified: true,
      });

      const newNeuronId = await services.spawnNeuron({
        neuronId: notControlledNeuron.neuronId,
        percentageToSpawn: 50,
      });

      expectToastError(en.error.not_authorized_neuron_action);
      expect(spySpawnNeuron).not.toHaveBeenCalled();
      expect(newNeuronId).toBeUndefined();
    });
  });

  describe("mergeNeurons", () => {
    it("should merge neurons", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      await mergeNeurons({
        sourceNeuronId: neurons[0].neuronId,
        targetNeuronId: neurons[1].neuronId,
      });

      expect(spyMergeNeurons).toHaveBeenCalled();
    });

    it("should not merge neurons if no identity", async () => {
      setNoIdentity();

      await mergeNeurons({
        sourceNeuronId: neurons[0].neuronId,
        targetNeuronId: neurons[1].neuronId,
      });

      expectToastError(en.error.missing_identity);
      expect(spyMergeNeurons).not.toHaveBeenCalled();
    });

    it("should not merge neurons if different controllers", async () => {
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

      expectToastError(en.error.merge_neurons_not_same_controller);
      expect(spyMergeNeurons).not.toHaveBeenCalled();
    });

    it("should not merge neurons if lower HW version than required", async () => {
      const version: ResponseVersion = {
        testMode: false,
        major: 1,
        minor: 9,
        patch: 9,
        deviceLocked: false,
        targetId: "test",
        returnCode: LedgerError.NoErrors,
      };
      const smallerVersionIdentity = new MockLedgerIdentity({ version });
      setAccountIdentity(smallerVersionIdentity);
      const hwAccount = {
        ...mockHardwareWalletAccount,
        principal: smallerVersionIdentity.getPrincipal(),
      };
      accountsStore.setForTesting({
        main: mockMainAccount,
        hardwareWallets: [hwAccount],
      });
      const neuron1 = {
        ...mockNeuron,
        neuronId: BigInt(5555),
        fullNeuron: {
          ...mockFullNeuron,
          controller: smallerVersionIdentity.getPrincipal().toText(),
        },
      };
      const neuron2 = {
        ...mockNeuron,
        neuronId: BigInt(5556),
        fullNeuron: {
          ...mockFullNeuron,
          controller: smallerVersionIdentity.getPrincipal().toText(),
        },
      };
      neuronsStore.pushNeurons({
        neurons: [neuron1, neuron2],
        certified: true,
      });

      await mergeNeurons({
        sourceNeuronId: neuron1.neuronId,
        targetNeuronId: neuron2.neuronId,
      });

      expectToastError(
        replacePlaceholders(en.error__ledger.version_not_supported, {
          $minVersion: "2.2.1",
          $currentVersion: "1.9.9",
        })
      );
      expect(spyMergeNeurons).not.toHaveBeenCalled();
    });
  });

  describe("addHotkey", () => {
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

      expectToastError(en.error.missing_identity);
      expect(spyAddHotkey).not.toHaveBeenCalled();
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

      expectToastError(en.error.not_authorized_neuron_action);
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

      expectToastError(en.error.missing_identity);
      expect(spyRemoveHotkey).not.toHaveBeenCalled();
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

      expectToastError(en.error.not_authorized_neuron_action);
      expect(spyRemoveHotkey).not.toHaveBeenCalled();
    });
  });

  describe("startDissolving", () => {
    it("should update neuron", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      await startDissolving(controlledNeuron.neuronId);

      expect(spyStartDissolving).toHaveBeenCalled();
    });

    it("should not update neuron if no identity", async () => {
      setNoIdentity();

      await startDissolving(BigInt(10));

      expectToastError(en.error.missing_identity);
      expect(spyStartDissolving).not.toHaveBeenCalled();
    });

    it("should not update neuron if not controlled by user", async () => {
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron],
        certified: true,
      });

      await startDissolving(notControlledNeuron.neuronId);

      expectToastError(en.error.not_authorized_neuron_action);
      expect(spyStartDissolving).not.toHaveBeenCalled();
    });
  });

  describe("stopDissolving", () => {
    it("should update neuron", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      await stopDissolving(controlledNeuron.neuronId);

      expect(spyStopDissolving).toHaveBeenCalled();
    });

    it("should not update neuron if no identity", async () => {
      setNoIdentity();

      await stopDissolving(BigInt(10));

      expectToastError(en.error.missing_identity);
      expect(spyStopDissolving).not.toHaveBeenCalled();
    });

    it("should not update neuron if not controlled by user", async () => {
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron],
        certified: true,
      });

      await stopDissolving(notControlledNeuron.neuronId);

      expectToastError(en.error.not_authorized_neuron_action);
      expect(spyStopDissolving).not.toHaveBeenCalled();
    });
  });

  describe("splitNeuron", () => {
    it("should update neuron", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      await services.splitNeuron({
        neuron: controlledNeuron,
        amount: 2.2,
      });

      expect(spySplitNeuron).toHaveBeenCalled();
    });

    it("should add transaction fee to the amount", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      const amount = 2.2;
      const transactionFee = DEFAULT_TRANSACTION_FEE_E8S / E8S_PER_ICP;
      // To avoid rounding errors, we round the amount with the fee to the nearest 8 decimals
      const amountWithFee =
        Math.round((amount + transactionFee) * E8S_PER_ICP) / E8S_PER_ICP;
      await services.splitNeuron({
        neuron: controlledNeuron,
        amount,
      });

      expect(spySplitNeuron).toHaveBeenCalledWith({
        identity: mockIdentity,
        neuronId: controlledNeuron.neuronId,
        amount: numberToE8s(amountWithFee),
      });
    });

    it("should not update neuron if no identity", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      setNoIdentity();

      await services.splitNeuron({
        neuron: controlledNeuron,
        amount: 2.2,
      });

      expectToastError(en.error.missing_identity);
      expect(spySplitNeuron).not.toHaveBeenCalled();
    });

    it("should not split neuron if lower HW version than required", async () => {
      const version: ResponseVersion = {
        testMode: false,
        major: 2,
        minor: 2,
        patch: 1,
        deviceLocked: false,
        targetId: "test",
        returnCode: LedgerError.NoErrors,
      };
      const smallerVersionIdentity = new MockLedgerIdentity({ version });
      setAccountIdentity(smallerVersionIdentity);
      const hwAccount = {
        ...mockHardwareWalletAccount,
        principal: smallerVersionIdentity.getPrincipal(),
      };
      accountsStore.setForTesting({
        main: mockMainAccount,
        hardwareWallets: [hwAccount],
      });
      const neuron = {
        ...mockNeuron,
        neuronId: BigInt(5555),
        fullNeuron: {
          ...mockFullNeuron,
          controller: smallerVersionIdentity.getPrincipal().toText(),
        },
      };
      neuronsStore.pushNeurons({ neurons: [neuron], certified: true });

      await services.splitNeuron({
        neuron,
        amount: 2.2,
      });

      expectToastError(
        replacePlaceholders(en.error__ledger.version_not_supported, {
          $minVersion: "2.3.0",
          $currentVersion: "2.2.1",
        })
      );
      expect(spySplitNeuron).not.toHaveBeenCalled();
    });
  });

  describe("add followee", () => {
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

    it("should call api if trying follow itself", async () => {
      neuronsStore.setNeurons({ neurons, certified: true });
      const topic = Topic.ExchangeRate;

      await addFollowee({
        neuronId: controlledNeuron.neuronId,
        topic,
        followee: controlledNeuron.neuronId,
      });

      expect(spySetFollowees).toHaveBeenCalledWith({
        neuronId: controlledNeuron.neuronId,
        topic,
        followees: [controlledNeuron.neuronId],
        identity: mockIdentity,
      });
      expect(spySetFollowees).toHaveBeenCalledTimes(1);
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

      expectToastError(en.new_followee.already_followed);
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

      expectToastError(en.error.missing_identity);
      expect(spySetFollowees).not.toHaveBeenCalled();
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

      expectToastError(en.error.not_authorized_neuron_action);
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
      expectToastError(en.error.missing_identity);
      expect(spySetFollowees).not.toHaveBeenCalled();
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
      expectToastError(en.error.not_authorized_neuron_action);
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
      jest.spyOn(console, "error").mockImplementation(jest.fn);
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
    });
  });

  describe("topUpNeuron", () => {
    it("should transfer ICPs, claim neuron and get the neuron info", async () => {
      const { success } = await topUpNeuron({
        neuron: mockNeuron,
        amount: 2,
        sourceAccount: mockMainAccount,
      });

      expect(success).toBe(true);
      expect(transferICP).toBeCalled();
      expect(spyClaimOrRefresh).toBeCalled();
      expect(spyGetNeuron).toBeCalled();
    });

    it("should fail if neuron has no account identifier", async () => {
      const { success } = await topUpNeuron({
        neuron: {
          ...mockNeuron,
          fullNeuron: undefined,
        },
        amount: 2,
        sourceAccount: mockMainAccount,
      });

      expect(success).toBe(false);
      expect(transferICP).not.toBeCalled();
      expect(spyClaimOrRefresh).not.toBeCalled();
      expect(spyGetNeuron).not.toBeCalled();
    });

    it("should fail if amount and neuron stake are not enough", async () => {
      const { success } = await topUpNeuron({
        neuron: {
          ...mockNeuron,
          fullNeuron: {
            ...mockFullNeuron,
            cachedNeuronStake: BigInt(MIN_NEURON_STAKE / 2 - 10),
          },
        },
        amount: 0.01,
        sourceAccount: mockMainAccount,
      });

      expect(success).toBe(false);
      expect(transferICP).not.toBeCalled();
      expect(spyClaimOrRefresh).not.toBeCalled();
      expect(spyGetNeuron).not.toBeCalled();
    });
  });
});
