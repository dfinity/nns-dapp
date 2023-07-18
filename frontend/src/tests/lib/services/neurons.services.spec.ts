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
import * as busyStore from "$lib/stores/busy.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
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
import { AnonymousIdentity } from "@dfinity/agent";
import { toastsStore } from "@dfinity/gix-components";
import { LedgerCanister, Topic } from "@dfinity/nns";
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
  simulateMergeNeurons,
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

jest.mock("$lib/proxy/icp-ledger.services.proxy", () => {
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

  const neurons = [sameControlledNeuron, controlledNeuron];

  const spyStakeNeuron = jest.spyOn(api, "stakeNeuron");
  const spyGetNeuron = jest.spyOn(api, "queryNeuron");
  const spyIncreaseDissolveDelay = jest.spyOn(api, "increaseDissolveDelay");
  const spyJoinCommunityFund = jest.spyOn(api, "joinCommunityFund");
  const spyAutoStakeMaturity = jest.spyOn(api, "autoStakeMaturity");
  const spyLeaveCommunityFund = jest.spyOn(api, "leaveCommunityFund");
  const spyDisburse = jest.spyOn(api, "disburse");
  const spyMergeMaturity = jest.spyOn(api, "mergeMaturity");
  const spyStakeMaturity = jest.spyOn(api, "stakeMaturity");
  const spySpawnNeuron = jest.spyOn(api, "spawnNeuron");
  const spyMergeNeurons = jest.spyOn(api, "mergeNeurons");
  const spySimulateMergeNeurons = jest.spyOn(api, "simulateMergeNeurons");
  const spyAddHotkey = jest.spyOn(api, "addHotkey");
  const spyRemoveHotkey = jest.spyOn(api, "removeHotkey");
  const spySplitNeuron = jest.spyOn(api, "splitNeuron");
  const spyStartDissolving = jest.spyOn(api, "startDissolving");
  const spyStopDissolving = jest.spyOn(api, "stopDissolving");
  const spySetFollowees = jest.spyOn(api, "setFollowees");
  const spyClaimOrRefresh = jest.spyOn(api, "claimOrRefreshNeuron");

  beforeEach(() => {
    spyGetNeuron.mockClear();
    jest.clearAllMocks();
    neuronsStore.reset();
    icpAccountsStore.resetForTesting();
    resetIdentity();
    resetAccountIdentity();
    toastsStore.reset();
    resetNeuronsApiService();

    spyStakeNeuron.mockImplementation(() =>
      Promise.resolve(mockNeuron.neuronId)
    );
    spyGetNeuron.mockResolvedValue(mockNeuron);
    spyIncreaseDissolveDelay.mockResolvedValue();
    spyJoinCommunityFund.mockResolvedValue();
    spyAutoStakeMaturity.mockResolvedValue();
    spyLeaveCommunityFund.mockResolvedValue();
    spyDisburse.mockResolvedValue();
    spyMergeMaturity.mockResolvedValue();
    spyStakeMaturity.mockResolvedValue();
    spySpawnNeuron.mockImplementation(() =>
      Promise.resolve(newSpawnedNeuronId)
    );
    spyMergeNeurons.mockResolvedValue();
    spySimulateMergeNeurons.mockImplementation(() =>
      Promise.resolve(mockNeuron)
    );
    spyAddHotkey.mockResolvedValue();
    spyRemoveHotkey.mockResolvedValue();
    spySplitNeuron.mockResolvedValue(BigInt(11));
    spyStartDissolving.mockResolvedValue();
    spyStopDissolving.mockResolvedValue();
    spySetFollowees.mockResolvedValue();
    spyClaimOrRefresh.mockResolvedValue(undefined);
  });

  describe("stake new neuron", () => {
    it("should stake a neuron from main account", async () => {
      expect(spyStakeNeuron).not.toBeCalled();
      const newNeuronId = await stakeNeuron({
        amount: 10,
        account: mockMainAccount,
      });

      expect(spyStakeNeuron).toBeCalledWith({
        controller: mockIdentity.getPrincipal(),
        fromSubAccount: undefined,
        identity: mockIdentity,
        ledgerCanisterIdentity: mockIdentity,
        stake: BigInt(10 * E8S_PER_ICP),
      });
      expect(spyStakeNeuron).toBeCalledTimes(1);
      expect(newNeuronId).toEqual(mockNeuron.neuronId);
    });

    it("should stake and load a neuron from subaccount", async () => {
      expect(spyStakeNeuron).not.toBeCalled();
      const newNeuronId = await stakeNeuron({
        amount: 10,
        account: mockSubAccount,
      });

      expect(spyStakeNeuron).toBeCalledWith({
        controller: mockIdentity.getPrincipal(),
        fromSubAccount: mockSubAccount.subAccount,
        identity: mockIdentity,
        ledgerCanisterIdentity: mockIdentity,
        stake: BigInt(10 * E8S_PER_ICP),
      });
      expect(spyStakeNeuron).toBeCalledTimes(1);
      expect(newNeuronId).toEqual(mockNeuron.neuronId);
    });

    it("should stake neuron from hardware wallet", async () => {
      expect(spyStakeNeuron).not.toBeCalled();
      const newNeuronId = await stakeNeuron({
        amount: 10,
        account: mockHardwareWalletAccount,
      });

      expect(spyStakeNeuron).toBeCalledWith({
        controller: mockHardwareWalletAccount.principal,
        identity: new AnonymousIdentity(),
        fromSubAccount: undefined,
        ledgerCanisterIdentity: mockIdentity,
        stake: BigInt(10 * E8S_PER_ICP),
      });
      expect(spyStakeNeuron).toBeCalledTimes(1);
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
      expect(spyStakeNeuron).not.toBeCalled();
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
      expect(spyStakeNeuron).not.toBeCalled();
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
          balanceE8s: BigInt(amount - 1),
        },
      });

      expect(response).toBeUndefined();
      expectToastError(en.error.insufficient_funds);
      expect(spyStakeNeuron).not.toBeCalled();
    });

    it("should not stake neuron if no identity", async () => {
      setNoAccountIdentity();

      const response = await stakeNeuron({
        amount: 10,
        account: mockMainAccount,
      });

      expect(response).toBeUndefined();
      expectToastError("Cannot read properties of null");
      expect(spyStakeNeuron).not.toBeCalled();
    });
  });

  describe("list neurons", () => {
    const spyQueryNeurons = jest
      .spyOn(api, "queryNeurons")
      .mockResolvedValue(neurons);

    it("should list neurons", async () => {
      const oldNeuronsList = get(definedNeuronsStore);
      expect(oldNeuronsList).toEqual([]);

      expect(spyQueryNeurons).not.toBeCalled();
      await listNeurons();

      expect(spyQueryNeurons).toBeCalledWith({
        certified: false,
        identity: mockIdentity,
      });
      expect(spyQueryNeurons).toBeCalledWith({
        certified: true,
        identity: mockIdentity,
      });
      expect(spyQueryNeurons).toBeCalledTimes(2);

      const newNeuronsList = get(definedNeuronsStore);
      expect(newNeuronsList).toEqual(neurons);
    });

    it("should not call api when called twice and cache is not reset", async () => {
      expect(spyQueryNeurons).not.toBeCalled();
      await listNeurons();

      expect(spyQueryNeurons).toBeCalledWith({
        identity: mockIdentity,
        certified: true,
      });

      expect(spyQueryNeurons).toBeCalledWith({
        identity: mockIdentity,
        certified: false,
      });

      expect(spyQueryNeurons).toBeCalledTimes(2);

      await listNeurons();

      expect(spyQueryNeurons).toBeCalledTimes(2);
    });

    it("should not list neurons if no identity", async () => {
      setNoIdentity();

      const call = async () => await listNeurons();

      await expect(call).rejects.toThrow(mockIdentityErrorMsg);
      expect(spyQueryNeurons).not.toBeCalled();
    });
  });

  describe("update delay", () => {
    it("should update delay", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      expect(spyIncreaseDissolveDelay).not.toBeCalled();
      await updateDelay({
        neuronId: controlledNeuron.neuronId,
        dissolveDelayInSeconds: 12000,
      });

      expect(spyIncreaseDissolveDelay).toBeCalledWith({
        identity: mockIdentity,
        dissolveDelayInSeconds: 12000,
        neuronId: controlledNeuron.neuronId,
      });
      expect(spyIncreaseDissolveDelay).toBeCalledTimes(1);
    });

    it("should not update delay if no identity", async () => {
      setNoIdentity();

      await updateDelay({
        neuronId: BigInt(10),
        dissolveDelayInSeconds: 12000,
      });

      expectToastError(en.error.missing_identity);
      expect(spyIncreaseDissolveDelay).not.toBeCalled();
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
      expect(spyIncreaseDissolveDelay).not.toBeCalled();
    });
  });

  describe("toggleCommunityFund", () => {
    it("should call joinCommunity find if neuron is not part yet", async () => {
      const neuron = {
        ...controlledNeuron,
        joinedCommunityFundTimestampSeconds: undefined,
      };
      neuronsStore.pushNeurons({ neurons: [neuron], certified: true });
      expect(spyJoinCommunityFund).not.toBeCalled();
      await toggleCommunityFund(neuron);

      expect(spyJoinCommunityFund).toBeCalledWith({
        identity: mockIdentity,
        neuronId: neuron.neuronId,
      });
      expect(spyJoinCommunityFund).toBeCalledTimes(1);
    });

    it("should call leaveCommunity find if neuron is in the fund already", async () => {
      const neuron = {
        ...controlledNeuron,
        joinedCommunityFundTimestampSeconds: BigInt(2000),
      };
      neuronsStore.pushNeurons({ neurons: [neuron], certified: true });
      expect(spyLeaveCommunityFund).not.toBeCalled();
      await toggleCommunityFund(neuron);

      expect(spyLeaveCommunityFund).toBeCalledWith({
        identity: mockIdentity,
        neuronId: neuron.neuronId,
      });
      expect(spyLeaveCommunityFund).toBeCalledTimes(1);
    });

    it("should not update neuron if no identity", async () => {
      const neuron = {
        ...controlledNeuron,
        joinedCommunityFundTimestampSeconds: BigInt(2000),
      };
      setNoIdentity();

      await toggleCommunityFund(neuron);

      expectToastError(en.error.missing_identity);
      expect(spyJoinCommunityFund).not.toBeCalled();
      expect(spyLeaveCommunityFund).not.toBeCalled();
    });

    it("should not update neuron if not controlled by user", async () => {
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron],
        certified: true,
      });

      await toggleCommunityFund(notControlledNeuron);

      expectToastError(en.error.not_authorized_neuron_action);
      expect(spyJoinCommunityFund).not.toBeCalled();
      expect(spyLeaveCommunityFund).not.toBeCalled();
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
      expect(spyAutoStakeMaturity).not.toBeCalled();
      await toggleAutoStakeMaturity(neuron);

      expect(spyAutoStakeMaturity).toBeCalledWith({
        neuronId: neuron.neuronId,
        autoStake: true,
        identity: testIdentity,
      });
      expect(spyAutoStakeMaturity).toBeCalledTimes(1);
    });

    it("should toggle auto stake maturity if currently set to false", async () => {
      const neuron = buildNeuron(undefined);
      neuronsStore.pushNeurons({ neurons: [neuron], certified: true });
      expect(spyAutoStakeMaturity).not.toBeCalled();
      await toggleAutoStakeMaturity(neuron);

      expect(spyAutoStakeMaturity).toBeCalledWith({
        neuronId: neuron.neuronId,
        autoStake: true,
        identity: testIdentity,
      });
      expect(spyAutoStakeMaturity).toBeCalledTimes(1);
    });

    it("should disable auto stake maturity if already on", async () => {
      const neuron = buildNeuron(true);
      neuronsStore.pushNeurons({ neurons: [neuron], certified: true });
      expect(spyAutoStakeMaturity).not.toBeCalled();
      await toggleAutoStakeMaturity(neuron);

      expect(spyAutoStakeMaturity).toBeCalledWith({
        neuronId: neuron.neuronId,
        autoStake: false,
        identity: testIdentity,
      });
      expect(spyAutoStakeMaturity).toBeCalledTimes(1);
    });

    it("should not toggle auto stake maturity for neuron if no identity", async () => {
      const neuron = buildNeuron(true);
      setNoIdentity();

      await toggleAutoStakeMaturity(neuron);

      expectToastError(en.error.missing_identity);
      expect(spyAutoStakeMaturity).not.toBeCalled();
    });

    it("should not toggle auto stake maturity if not controlled by user", async () => {
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron],
        certified: true,
      });

      await toggleAutoStakeMaturity(notControlledNeuron);

      expectToastError(en.error.not_authorized_neuron_action);
      expect(spyAutoStakeMaturity).not.toBeCalled();
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
      expect(spyAutoStakeMaturity).not.toBeCalled();
    });
  });

  describe("disburse", () => {
    it("should disburse neuron", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      expect(spyDisburse).not.toBeCalled();
      const { success } = await services.disburse({
        neuronId: controlledNeuron.neuronId,
        toAccountId: mockMainAccount.identifier,
      });

      expect(spyDisburse).toBeCalledWith({
        identity: mockIdentity,
        neuronId: controlledNeuron.neuronId,
        toAccountId: mockMainAccount.identifier,
      });
      expect(spyDisburse).toBeCalledTimes(1);
      expect(success).toBe(true);
    });

    it("should sync account balance", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      expect(loadBalance).not.toBeCalled();
      await services.disburse({
        neuronId: controlledNeuron.neuronId,
        toAccountId: mockMainAccount.identifier,
      });

      expect(loadBalance).toBeCalledWith({
        accountIdentifier: mockMainAccount.identifier,
      });
      expect(loadBalance).toBeCalledTimes(1);
    });

    it("should not disburse neuron if no identity", async () => {
      setNoIdentity();

      const { success } = await services.disburse({
        neuronId: controlledNeuron.neuronId,
        toAccountId: mockMainAccount.identifier,
      });

      expectToastError(en.error.missing_identity);
      expect(spyDisburse).not.toBeCalled();
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
      expect(spyDisburse).not.toBeCalled();
      expect(success).toBe(false);
    });
  });

  describe("mergeMaturity", () => {
    it("should merge maturity of the neuron", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      expect(spyMergeMaturity).not.toBeCalled();
      const { success } = await services.mergeMaturity({
        neuronId: controlledNeuron.neuronId,
        percentageToMerge: 50,
      });

      expect(spyMergeMaturity).toBeCalledWith({
        identity: mockIdentity,
        neuronId: controlledNeuron.neuronId,
        percentageToMerge: 50,
      });
      expect(spyMergeMaturity).toBeCalledTimes(1);
      expect(success).toBe(true);
    });

    it("should not merge maturity if no identity", async () => {
      setNoIdentity();

      const { success } = await services.mergeMaturity({
        neuronId: controlledNeuron.neuronId,
        percentageToMerge: 50,
      });

      expectToastError(en.error.missing_identity);
      expect(spyMergeMaturity).not.toBeCalled();
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
      expect(spyMergeMaturity).not.toBeCalled();
      expect(success).toBe(false);
    });
  });

  describe("stakeMaturity", () => {
    it("should stake maturity of the neuron", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      expect(spyStakeMaturity).not.toBeCalled();
      const { success } = await services.stakeMaturity({
        neuronId: controlledNeuron.neuronId,
        percentageToStake: 50,
      });

      expect(spyStakeMaturity).toBeCalledWith({
        identity: mockIdentity,
        neuronId: controlledNeuron.neuronId,
        percentageToStake: 50,
      });
      expect(spyStakeMaturity).toBeCalledTimes(1);
      expect(success).toBe(true);
    });

    it("should not stake maturity if no identity", async () => {
      setNoIdentity();

      const { success } = await services.stakeMaturity({
        neuronId: controlledNeuron.neuronId,
        percentageToStake: 50,
      });

      expectToastError(en.error.missing_identity);
      expect(spyStakeMaturity).not.toBeCalled();
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
      expect(spyStakeMaturity).not.toBeCalled();
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
      expect(spyStakeMaturity).not.toBeCalled();
      expect(success).toBe(false);
    });
  });

  describe("spawnNeuron", () => {
    it("should spawn a neuron from maturity", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      expect(spySpawnNeuron).not.toBeCalled();
      const newNeuronId = await services.spawnNeuron({
        neuronId: controlledNeuron.neuronId,
        percentageToSpawn: 50,
      });

      expect(spySpawnNeuron).toBeCalledWith({
        identity: mockIdentity,
        neuronId: controlledNeuron.neuronId,
        percentageToSpawn: 50,
      });
      expect(spySpawnNeuron).toBeCalledTimes(1);
      expect(newNeuronId).toEqual(newSpawnedNeuronId);
    });

    it("should not spawn neuron if no identity", async () => {
      setNoIdentity();

      const newNeuronId = await services.spawnNeuron({
        neuronId: controlledNeuron.neuronId,
        percentageToSpawn: 50,
      });

      expectToastError(en.error.missing_identity);
      expect(spySpawnNeuron).not.toBeCalled();
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
      expect(spySpawnNeuron).not.toBeCalled();
      expect(newNeuronId).toBeUndefined();
    });
  });

  describe("mergeNeurons", () => {
    it("should merge neurons", async () => {
      const sourceNeuronId = neurons[0].neuronId;
      const targetNeuronId = neurons[1].neuronId;
      neuronsStore.pushNeurons({ neurons, certified: true });
      expect(spyMergeNeurons).not.toBeCalled();
      await mergeNeurons({
        sourceNeuronId,
        targetNeuronId,
      });

      expect(spyMergeNeurons).toBeCalledWith({
        identity: mockIdentity,
        sourceNeuronId,
        targetNeuronId,
      });
      expect(spyMergeNeurons).toBeCalledTimes(1);
    });

    it("should not merge neurons if no identity", async () => {
      setNoIdentity();

      await mergeNeurons({
        sourceNeuronId: neurons[0].neuronId,
        targetNeuronId: neurons[1].neuronId,
      });

      expectToastError(en.error.missing_identity);
      expect(spyMergeNeurons).not.toBeCalled();
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
      expect(spyMergeNeurons).not.toBeCalled();
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
      icpAccountsStore.setForTesting({
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
      expect(spyMergeNeurons).not.toBeCalled();
    });
  });

  describe("simulateMergeNeurons", () => {
    it("should simulate merging neurons", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });

      expect(spySimulateMergeNeurons).not.toBeCalled();
      await simulateMergeNeurons({
        sourceNeuronId: neurons[0].neuronId,
        targetNeuronId: neurons[1].neuronId,
      });

      expect(spySimulateMergeNeurons).toBeCalledWith({
        identity: mockIdentity,
        sourceNeuronId: neurons[0].neuronId,
        targetNeuronId: neurons[1].neuronId,
      });
      expect(spySimulateMergeNeurons).toBeCalledTimes(1);
      expect(spyMergeNeurons).not.toBeCalled();
    });

    it("should not simulate merging neurons if no identity", async () => {
      setNoIdentity();

      await simulateMergeNeurons({
        sourceNeuronId: neurons[0].neuronId,
        targetNeuronId: neurons[1].neuronId,
      });

      expectToastError(en.error.missing_identity);
      expect(spySimulateMergeNeurons).not.toBeCalled();
      expect(spyMergeNeurons).not.toBeCalled();
    });

    it("should not simulate merging neurons if different controllers", async () => {
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

      await simulateMergeNeurons({
        sourceNeuronId: notControlledNeuron.neuronId,
        targetNeuronId: neuron.neuronId,
      });

      expectToastError(en.error.merge_neurons_not_same_controller);
      expect(spySimulateMergeNeurons).not.toBeCalled();
      expect(spyMergeNeurons).not.toBeCalled();
    });

    it("should simulate merging neurons if HW controlled", async () => {
      icpAccountsStore.setForTesting({
        main: mockMainAccount,
        hardwareWallets: [mockHardwareWalletAccount],
      });
      const hwPrincipal = mockHardwareWalletAccount.principal.toText();
      const neuron1 = {
        ...mockNeuron,
        neuronId: BigInt(5555),
        fullNeuron: {
          ...mockFullNeuron,
          controller: hwPrincipal,
        },
      };
      const neuron2 = {
        ...mockNeuron,
        neuronId: BigInt(5556),
        fullNeuron: {
          ...mockFullNeuron,
          controller: hwPrincipal,
        },
      };
      neuronsStore.pushNeurons({
        neurons: [neuron1, neuron2],
        certified: true,
      });

      await simulateMergeNeurons({
        sourceNeuronId: neuron1.neuronId,
        targetNeuronId: neuron2.neuronId,
      });

      expect(spySimulateMergeNeurons).toBeCalledTimes(1);
      expect(spyMergeNeurons).not.toBeCalled();
    });
  });

  describe("addHotkey", () => {
    it("should update neuron", async () => {
      const principal = Principal.fromText("aaaaa-aa");
      neuronsStore.pushNeurons({ neurons, certified: true });
      expect(spyAddHotkey).not.toBeCalled();
      await addHotkey({
        neuronId: controlledNeuron.neuronId,
        principal,
      });

      expect(spyAddHotkey).toBeCalledWith({
        identity: mockIdentity,
        neuronId: controlledNeuron.neuronId,
        principal,
      });
      expect(spyAddHotkey).toBeCalledTimes(1);
    });

    it("should not update neuron if no identity", async () => {
      setNoIdentity();

      await addHotkey({
        neuronId: controlledNeuron.neuronId,
        principal: Principal.fromText("aaaaa-aa"),
      });

      expectToastError(en.error.missing_identity);
      expect(spyAddHotkey).not.toBeCalled();
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
      expect(spyAddHotkey).not.toBeCalled();
    });
  });

  describe("addHotkeyForHardwareWalletNeuron", () => {
    it("should update neuron", async () => {
      expect(spyAddHotkey).not.toBeCalled();
      await addHotkeyForHardwareWalletNeuron({
        neuronId: controlledNeuron.neuronId,
        accountIdentifier: mockMainAccount.identifier,
      });

      expect(spyAddHotkey).toBeCalledWith({
        identity: mockIdentity,
        neuronId: controlledNeuron.neuronId,
        principal: mockIdentity.getPrincipal(),
      });
      expect(spyAddHotkey).toBeCalledTimes(1);
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

      expect(spyAddHotkey).not.toBeCalled();
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

      expect(spyRemoveHotkey).toBeCalled();
    });

    it("should not update neuron if invalid principal", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      await removeHotkey({
        neuronId: controlledNeuron.neuronId,
        principalString: "not-valid",
      });

      expect(spyRemoveHotkey).not.toBeCalled();
    });

    it("should update neuron and return success when user removes itself", async () => {
      spyGetNeuron.mockImplementation(
        jest.fn().mockRejectedValue(new NotAuthorizedNeuronError())
      );
      neuronsStore.pushNeurons({ neurons, certified: true });

      expect(spyRemoveHotkey).not.toBeCalled();
      const expectedId = await removeHotkey({
        neuronId: controlledNeuron.neuronId,
        principalString: mockIdentity.getPrincipal().toText() as string,
      });

      expect(spyRemoveHotkey).toBeCalledWith({
        identity: mockIdentity,
        neuronId: controlledNeuron.neuronId,
        principal: mockIdentity.getPrincipal(),
      });
      expect(spyRemoveHotkey).toBeCalledTimes(1);
      expect(expectedId).toBeDefined();
    });

    it("should not update neuron if no identity", async () => {
      setNoIdentity();

      await removeHotkey({
        neuronId: controlledNeuron.neuronId,
        principalString: "aaaaa-aa",
      });

      expectToastError(en.error.missing_identity);
      expect(spyRemoveHotkey).not.toBeCalled();
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
      expect(spyRemoveHotkey).not.toBeCalled();
    });
  });

  describe("startDissolving", () => {
    it("should update neuron", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      expect(spyStartDissolving).not.toBeCalled();
      await startDissolving(controlledNeuron.neuronId);

      expect(spyStartDissolving).toBeCalledWith({
        identity: mockIdentity,
        neuronId: controlledNeuron.neuronId,
      });
      expect(spyStartDissolving).toBeCalledTimes(1);
    });

    it("should not update neuron if no identity", async () => {
      setNoIdentity();

      await startDissolving(BigInt(10));

      expectToastError(en.error.missing_identity);
      expect(spyStartDissolving).not.toBeCalled();
    });

    it("should not update neuron if not controlled by user", async () => {
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron],
        certified: true,
      });

      await startDissolving(notControlledNeuron.neuronId);

      expectToastError(en.error.not_authorized_neuron_action);
      expect(spyStartDissolving).not.toBeCalled();
    });
  });

  describe("stopDissolving", () => {
    it("should update neuron", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      await stopDissolving(controlledNeuron.neuronId);

      expect(spyStopDissolving).toBeCalled();
    });

    it("should not update neuron if no identity", async () => {
      setNoIdentity();

      await stopDissolving(BigInt(10));

      expectToastError(en.error.missing_identity);
      expect(spyStopDissolving).not.toBeCalled();
    });

    it("should not update neuron if not controlled by user", async () => {
      neuronsStore.pushNeurons({
        neurons: [notControlledNeuron],
        certified: true,
      });

      await stopDissolving(notControlledNeuron.neuronId);

      expectToastError(en.error.not_authorized_neuron_action);
      expect(spyStopDissolving).not.toBeCalled();
    });
  });

  describe("splitNeuron", () => {
    it("should update neuron", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      expect(spySplitNeuron).not.toBeCalled();
      await services.splitNeuron({
        neuron: controlledNeuron,
        amount: 2.2,
      });

      expect(spySplitNeuron).toBeCalledWith({
        amount: numberToE8s(2.2) + BigInt(DEFAULT_TRANSACTION_FEE_E8S),
        identity: mockIdentity,
        neuronId: controlledNeuron.neuronId,
      });
      expect(spySplitNeuron).toBeCalledTimes(1);
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

      expect(spySplitNeuron).toBeCalledWith({
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
      expect(spySplitNeuron).not.toBeCalled();
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
      icpAccountsStore.setForTesting({
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
      expect(spySplitNeuron).not.toBeCalled();
    });
  });

  describe("add followee", () => {
    it("should add the followee to next call", async () => {
      const followee = BigInt(8);
      neuronsStore.setNeurons({ neurons, certified: true });
      const topic = Topic.ExchangeRate;

      expect(spySetFollowees).not.toBeCalled();
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
      expect(spySetFollowees).toBeCalledWith(expectedArgument);
      expect(spySetFollowees).toBeCalledTimes(1);
    });

    it("should call api if trying follow itself", async () => {
      neuronsStore.setNeurons({ neurons, certified: true });
      const topic = Topic.ExchangeRate;

      expect(spySetFollowees).not.toBeCalled();
      await addFollowee({
        neuronId: controlledNeuron.neuronId,
        topic,
        followee: controlledNeuron.neuronId,
      });

      expect(spySetFollowees).toBeCalledWith({
        neuronId: controlledNeuron.neuronId,
        topic,
        followees: [controlledNeuron.neuronId],
        identity: mockIdentity,
      });
      expect(spySetFollowees).toBeCalledTimes(1);
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
      expect(spySetFollowees).not.toBeCalled();
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
      expect(spySetFollowees).not.toBeCalled();
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
      expect(spySetFollowees).not.toBeCalled();
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

      expect(spySetFollowees).not.toBeCalled();
      await addFollowee({
        neuronId: hotkeyNeuron.neuronId,
        topic,
        followee,
      });

      expect(spySetFollowees).toBeCalledWith({
        followees: [followee],
        identity: mockIdentity,
        neuronId: hotkeyNeuron.neuronId,
        topic,
      });
      expect(spySetFollowees).toBeCalledTimes(1);
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

      expect(spySetFollowees).not.toBeCalled();
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

      expect(spySetFollowees).not.toBeCalled();
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
      expect(spySetFollowees).toBeCalledWith(expectedArgument);
      expect(spySetFollowees).toBeCalledTimes(1);
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
      expect(spySetFollowees).not.toBeCalled();
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
      expect(spySetFollowees).not.toBeCalled();
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

      expect(spySetFollowees).not.toBeCalled();
      await removeFollowee({
        neuronId: hotkeyNeuron.neuronId,
        topic,
        followee,
      });
      expect(spySetFollowees).toBeCalledWith({
        followees: [],
        identity: mockIdentity,
        neuronId: hotkeyNeuron.neuronId,
        topic,
      });
      expect(spySetFollowees).toBeCalledTimes(1);
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
      expect(spySetFollowees).not.toBeCalled();
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
      expect(spyGetNeuron).not.toBeCalled();
      await loadNeuron({
        neuronId: mockNeuron.neuronId,
        setNeuron: jest.fn(),
      });
      expect(spyGetNeuron).toBeCalledWith({
        certified: false,
        identity: mockIdentity,
        neuronId: mockNeuron.neuronId,
      });
      expect(spyGetNeuron).toBeCalledWith({
        certified: true,
        identity: mockIdentity,
        neuronId: mockNeuron.neuronId,
      });
      expect(spyGetNeuron).toBeCalledTimes(2);
    });

    it("should call setNeuron even if the neuron doesn't have fullNeuron", async () => {
      const neuronId = BigInt(333333);
      const publicInfoNeuron = {
        ...mockNeuron,
        neuronId,
        fullNeuron: undefined,
      };
      spyGetNeuron.mockResolvedValue(publicInfoNeuron);
      const setNeuronSpy = jest.fn();

      expect(spyGetNeuron).not.toBeCalled();
      expect(setNeuronSpy).not.toBeCalled();
      await loadNeuron({
        neuronId,
        setNeuron: setNeuronSpy,
      });

      expect(spyGetNeuron).toBeCalledWith({
        certified: false,
        identity: mockIdentity,
        neuronId,
      });
      expect(spyGetNeuron).toBeCalledWith({
        certified: true,
        identity: mockIdentity,
        neuronId,
      });
      expect(spyGetNeuron).toBeCalledTimes(2);

      expect(setNeuronSpy).toBeCalledWith({
        certified: false,
        neuron: publicInfoNeuron,
      });
      expect(setNeuronSpy).toBeCalledWith({
        certified: true,
        neuron: publicInfoNeuron,
      });
      expect(setNeuronSpy).toBeCalledTimes(2);
    });
  });

  describe("reloadNeuron", () => {
    it("should call the api", async () => {
      expect(spyGetNeuron).not.toBeCalled();
      await reloadNeuron(mockNeuron.neuronId);
      expect(spyGetNeuron).toBeCalledWith({
        certified: true,
        identity: mockIdentity,
        neuronId: mockNeuron.neuronId,
      });
      expect(spyGetNeuron).toBeCalledTimes(1);
    });

    it("should add neuron to the store", async () => {
      await reloadNeuron(mockNeuron.neuronId);
      const store = get(neuronsStore);
      expect(
        store.neurons?.find(({ neuronId }) => neuronId === mockNeuron.neuronId)
      ).toBeDefined();
    });

    it("should claim or refresh neuron", async () => {
      expect(spyClaimOrRefresh).not.toBeCalled();
      await reloadNeuron(mockNeuron.neuronId);
      expect(spyClaimOrRefresh).toBeCalledWith({
        identity: mockIdentity,
        neuronId: mockNeuron.neuronId,
      });
      expect(spyClaimOrRefresh).toBeCalledTimes(1);
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
      expect(getAccountIdentityByPrincipal).not.toBeCalled();
      const identity = await getIdentityOfControllerByNeuronId(
        controlledNeuron.neuronId
      );
      expect(identity).toBe(newIdentity);
      expect(getAccountIdentityByPrincipal).toBeCalledWith(controller);
      expect(getAccountIdentityByPrincipal).toBeCalledTimes(1);
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
      expect(transferICP).not.toBeCalled();
      expect(spyClaimOrRefresh).not.toBeCalled();
      expect(spyGetNeuron).not.toBeCalled();
      const { success } = await topUpNeuron({
        neuron: mockNeuron,
        amount: 2,
        sourceAccount: mockMainAccount,
      });

      expect(success).toBe(true);
      expect(transferICP).toBeCalledWith({
        amount: 2,
        destinationAddress: mockNeuron.fullNeuron?.accountIdentifier,
        sourceAccount: mockMainAccount,
      });
      expect(transferICP).toBeCalledTimes(1);
      expect(spyClaimOrRefresh).toBeCalledWith({
        identity: mockIdentity,
        neuronId: mockNeuron.neuronId,
      });
      expect(spyClaimOrRefresh).toBeCalledTimes(1);
      expect(spyGetNeuron).toBeCalledWith({
        certified: true,
        identity: mockIdentity,
        neuronId: mockNeuron.neuronId,
      });
      expect(spyGetNeuron).toBeCalledTimes(1);
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
