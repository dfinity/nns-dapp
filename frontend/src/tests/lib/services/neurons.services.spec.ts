import * as api from "$lib/api/governance.api";
import * as icpLedgerApi from "$lib/api/icp-ledger.api";
import { DEFAULT_TRANSACTION_FEE_E8S } from "$lib/constants/icp.constants";
import { MIN_NEURON_STAKE } from "$lib/constants/neurons.constants";
import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import { definedNeuronsStore } from "$lib/derived/neurons.derived";
import * as icpLedgerServicesProxy from "$lib/proxy/icp-ledger.services.proxy";
import * as authServices from "$lib/services/auth.services";
import * as icpAccountsServices from "$lib/services/icp-accounts.services";
import {
  getAccountIdentityByPrincipal,
  loadBalance,
  transferICP,
} from "$lib/services/icp-accounts.services";
import * as services from "$lib/services/neurons.services";
import { toggleAutoStakeMaturity } from "$lib/services/neurons.services";
import * as busyStore from "$lib/stores/busy.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { NotAuthorizedNeuronError } from "$lib/types/neurons.errors";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { numberToE8s } from "$lib/utils/token.utils";
import {
  mockGetIdentity,
  mockIdentity,
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { MockLedgerIdentity } from "$tests/mocks/ledger.identity.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { mockTransactionWithId } from "$tests/mocks/transaction.mock";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { Identity } from "@dfinity/agent";
import { AnonymousIdentity } from "@dfinity/agent";
import { toastsStore } from "@dfinity/gix-components";
import type { TransactionWithId } from "@dfinity/ledger-icp";
import { LedgerCanister } from "@dfinity/ledger-icp";
import { NeuronVisibility, Topic, type NeuronInfo } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { LedgerError, type ResponseVersion } from "@zondax/ledger-icp";
import { tick } from "svelte";
import { get } from "svelte/store";
import { mock } from "vitest-mock-extended";

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
  changeNeuronVisibility,
  refreshNeuronIfNeeded,
  claimNeuronsIfNeeded,
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

const mockLedgerIdentity = new MockLedgerIdentity();
const getMockLedgerIdentity = () => Promise.resolve(mockLedgerIdentity);
let getLedgerIdentityImplementation = getMockLedgerIdentity;
const setLedgerThrow = () =>
  (getLedgerIdentityImplementation = () => {
    throw new Error("Test");
  });
const resetLedger = () =>
  (getLedgerIdentityImplementation = getMockLedgerIdentity);

describe("neurons-services", () => {
  const notControlledNeuron = {
    ...mockNeuron,
    neuronId: 123n,
    fullNeuron: {
      ...mockFullNeuron,
      controller: "not-controller",
    },
  };
  const controlledNeuron = {
    ...mockNeuron,
    neuronId: 1_234n,
    fullNeuron: {
      ...mockFullNeuron,
      controller: mockIdentity.getPrincipal().toText(),
    },
  };
  const sameControlledNeuron = {
    ...mockNeuron,
    neuronId: 1_234_555n,
    fullNeuron: {
      ...mockFullNeuron,
      controller: mockIdentity.getPrincipal().toText(),
    },
  };
  const newSpawnedNeuronId = 1_234n;

  const neurons = [sameControlledNeuron, controlledNeuron];

  let spyStakeNeuron;
  let spyGetNeuron;
  let spyIncreaseDissolveDelay;
  let spyJoinCommunityFund;
  let spyAutoStakeMaturity;
  let spyLeaveCommunityFund;
  let spyDisburse;
  let spyRefreshVotingPower;
  let spyStakeMaturity;
  let spySpawnNeuron;
  let spyDisburseMaturity;
  let spyMergeNeurons;
  let spySimulateMergeNeurons;
  let spyAddHotkey;
  let spyRemoveHotkey;
  let spySplitNeuron;
  let spyStartDissolving;
  let spyStopDissolving;
  let spySetFollowees;
  let spyClaimOrRefresh;
  let spyClaimOrRefreshByMemo;
  let spyChangeNeuronVisibility;
  let spyQueryAccountBalance;
  let spyConsoleError;

  beforeEach(() => {
    spyConsoleError = vi.spyOn(console, "error");
    resetAccountIdentity();

    vi.spyOn(icpAccountsServices, "loadBalance").mockReturnValue(undefined);
    vi.spyOn(icpAccountsServices, "transferICP").mockResolvedValue({
      success: true,
    });
    vi.spyOn(
      icpAccountsServices,
      "getAccountIdentityByPrincipal"
    ).mockImplementation(async () => testIdentity);
    vi.spyOn(icpAccountsServices, "getAccountIdentity").mockImplementation(
      async () => testIdentity
    );

    vi.spyOn(
      icpLedgerServicesProxy,
      "getLedgerIdentityProxy"
    ).mockImplementation(() => getLedgerIdentityImplementation());

    spyStakeNeuron = vi
      .spyOn(api, "stakeNeuron")
      .mockImplementation(() => Promise.resolve(mockNeuron.neuronId));
    spyGetNeuron = vi.spyOn(api, "queryNeuron").mockResolvedValue(mockNeuron);
    spyIncreaseDissolveDelay = vi
      .spyOn(api, "increaseDissolveDelay")
      .mockResolvedValue();
    spyJoinCommunityFund = vi
      .spyOn(api, "joinCommunityFund")
      .mockResolvedValue();
    spyAutoStakeMaturity = vi
      .spyOn(api, "autoStakeMaturity")
      .mockResolvedValue();
    spyLeaveCommunityFund = vi
      .spyOn(api, "leaveCommunityFund")
      .mockResolvedValue();
    spyDisburse = vi.spyOn(api, "disburse").mockResolvedValue();
    spyRefreshVotingPower = vi
      .spyOn(api, "refreshVotingPower")
      .mockResolvedValue();
    spyStakeMaturity = vi.spyOn(api, "stakeMaturity").mockResolvedValue();
    spySpawnNeuron = vi
      .spyOn(api, "spawnNeuron")
      .mockImplementation(() => Promise.resolve(newSpawnedNeuronId));
    spyDisburseMaturity = vi.spyOn(api, "disburseMaturity").mockResolvedValue();
    spyMergeNeurons = vi.spyOn(api, "mergeNeurons").mockResolvedValue();
    spySimulateMergeNeurons = vi
      .spyOn(api, "simulateMergeNeurons")
      .mockImplementation(() => Promise.resolve(mockNeuron));
    spyAddHotkey = vi.spyOn(api, "addHotkey").mockResolvedValue();
    spyRemoveHotkey = vi.spyOn(api, "removeHotkey").mockResolvedValue();
    spySplitNeuron = vi.spyOn(api, "splitNeuron").mockResolvedValue(11n);
    spyStartDissolving = vi.spyOn(api, "startDissolving").mockResolvedValue();
    spyStopDissolving = vi.spyOn(api, "stopDissolving").mockResolvedValue();
    spySetFollowees = vi.spyOn(api, "setFollowees").mockResolvedValue();
    spyClaimOrRefresh = vi
      .spyOn(api, "claimOrRefreshNeuron")
      .mockResolvedValue(undefined);
    spyClaimOrRefreshByMemo = vi
      .spyOn(api, "claimOrRefreshNeuronByMemo")
      .mockResolvedValue(undefined);
    spyChangeNeuronVisibility = vi
      .spyOn(api, "changeNeuronVisibility")
      .mockResolvedValue(undefined);
    spyQueryAccountBalance = vi.spyOn(icpLedgerApi, "queryAccountBalance");

    resetIdentity();
    vi.spyOn(authServices, "getAuthenticatedIdentity").mockImplementation(
      mockGetIdentity
    );
    vi.spyOn(api, "queryNeurons").mockResolvedValue([]);
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
        stake: 1_000_000_000n,
        fee: NNS_TOKEN_DATA.fee,
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
        stake: 1_000_000_000n,
        fee: NNS_TOKEN_DATA.fee,
      });
      expect(spyStakeNeuron).toBeCalledTimes(1);
      expect(newNeuronId).toEqual(mockNeuron.neuronId);
    });

    it("should stake neuron from Ledger device", async () => {
      const mockHardkwareWalletIdentity = {
        getPrincipal: () => mockHardwareWalletAccount.principal,
      } as unknown as Identity;
      setAccountIdentity(mockHardkwareWalletIdentity);

      expect(spyStakeNeuron).not.toBeCalled();

      const newNeuronId = await stakeNeuron({
        amount: 10,
        account: mockHardwareWalletAccount,
      });

      expect(spyStakeNeuron).toBeCalledWith({
        controller: mockHardwareWalletAccount.principal,
        identity: new AnonymousIdentity(),
        fromSubAccount: undefined,
        ledgerCanisterIdentity: mockHardkwareWalletIdentity,
        stake: 1_000_000_000n,
        fee: NNS_TOKEN_DATA.fee,
      });
      expect(spyStakeNeuron).toBeCalledTimes(1);
      expect(newNeuronId).toEqual(mockNeuron.neuronId);
    });

    it("stakeNeuron return undefined if amount less than 1 ICP", async () => {
      vi.spyOn(LedgerCanister, "create").mockImplementation(() =>
        mock<LedgerCanister>()
      );

      const response = await stakeNeuron({
        amount: 0.1,
        account: mockMainAccount,
      });

      expect(response).toBeUndefined();
      expectToastError(en.error.amount_not_enough_stake_neuron);
      expect(spyStakeNeuron).not.toBeCalled();
    });

    it("stake neuron should return undefined if amount not valid", async () => {
      vi.spyOn(LedgerCanister, "create").mockImplementation(() =>
        mock<LedgerCanister>()
      );

      const response = await stakeNeuron({
        amount: NaN,
        account: mockMainAccount,
      });

      expect(response).toBeUndefined();
      expectToastError("Invalid number NaN");
      expect(spyStakeNeuron).not.toBeCalled();
    });

    it("stake neuron should return undefined if not enough funds in account", async () => {
      vi.spyOn(LedgerCanister, "create").mockImplementation(() =>
        mock<LedgerCanister>()
      );

      // 10 ICPs
      const amount = 10;
      const response = await stakeNeuron({
        amount,
        account: {
          ...mockMainAccount,
          balanceUlps: BigInt(amount - 1),
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

    it("should create a public neuron when asPublicNeuron is true", async () => {
      const newNeuronId = 12345n;
      spyStakeNeuron.mockResolvedValue(newNeuronId);

      expect(spyStakeNeuron).not.toBeCalled();
      expect(spyChangeNeuronVisibility).not.toBeCalled();

      const result = await stakeNeuron({
        amount: 10,
        account: mockMainAccount,
        asPublicNeuron: true,
      });

      expect(spyStakeNeuron).toBeCalledWith({
        controller: mockIdentity.getPrincipal(),
        fromSubAccount: undefined,
        identity: mockIdentity,
        ledgerCanisterIdentity: mockIdentity,
        stake: 1_000_000_000n,
        fee: NNS_TOKEN_DATA.fee,
      });
      expect(spyStakeNeuron).toBeCalledTimes(1);

      expect(spyChangeNeuronVisibility).toBeCalledWith({
        neuronIds: [newNeuronId],
        visibility: NeuronVisibility.Public,
        identity: mockIdentity,
      });
      expect(spyChangeNeuronVisibility).toBeCalledTimes(1);

      expect(result).toEqual(newNeuronId);
    });

    it("should not create a public neuron when asPublicNeuron is false", async () => {
      const newNeuronId = 12345n;
      spyStakeNeuron.mockResolvedValue(newNeuronId);

      expect(spyStakeNeuron).not.toBeCalled();
      expect(spyChangeNeuronVisibility).not.toBeCalled();

      const result = await stakeNeuron({
        amount: 10,
        account: mockMainAccount,
        asPublicNeuron: false,
      });

      expect(spyStakeNeuron).toBeCalledWith({
        controller: mockIdentity.getPrincipal(),
        fromSubAccount: undefined,
        identity: mockIdentity,
        ledgerCanisterIdentity: mockIdentity,
        stake: 1_000_000_000n,
        fee: NNS_TOKEN_DATA.fee,
      });
      expect(spyStakeNeuron).toBeCalledTimes(1);

      expect(spyChangeNeuronVisibility).not.toBeCalled();

      expect(result).toEqual(newNeuronId);
    });

    it("should show error toast if changing neuron visibility fails", async () => {
      const newNeuronId = 12345n;
      spyStakeNeuron.mockResolvedValue(newNeuronId);
      spyChangeNeuronVisibility.mockRejectedValue(
        new Error("Visibility change failed")
      );

      const result = await stakeNeuron({
        amount: 10,
        account: mockMainAccount,
        asPublicNeuron: true,
      });

      expect(spyStakeNeuron).toBeCalledTimes(1);
      expect(spyChangeNeuronVisibility).toBeCalledTimes(1);

      expect(result).toEqual(newNeuronId);

      expectToastError(
        'Making your neuron public has failed, so it was created as a private neuron. You can change neuron visibility at any time under "Advanced Details & Settings"'
      );
    });
  });

  describe("list neurons", () => {
    let spyQueryNeurons;

    beforeEach(() => {
      spyQueryNeurons = vi
        .spyOn(api, "queryNeurons")
        .mockResolvedValue(neurons);
    });

    it("should list neurons", async () => {
      const oldNeuronsList = get(definedNeuronsStore);
      expect(oldNeuronsList).toEqual([]);

      expect(spyQueryNeurons).not.toBeCalled();
      await listNeurons();

      expect(spyQueryNeurons).toBeCalledWith({
        certified: false,
        identity: mockIdentity,
        includeEmptyNeurons: false,
      });
      expect(spyQueryNeurons).toBeCalledWith({
        certified: true,
        identity: mockIdentity,
        includeEmptyNeurons: false,
      });
      expect(spyQueryNeurons).toBeCalledTimes(2);

      const newNeuronsList = get(definedNeuronsStore);
      expect(newNeuronsList).toEqual(neurons);
    });

    it("should reset store and show toast on error", async () => {
      spyConsoleError.mockReturnValue();
      const errorMessage = "Test error";
      spyQueryNeurons.mockRejectedValue(new Error(errorMessage));

      neuronsStore.pushNeurons({ neurons, certified: true });

      expect(get(definedNeuronsStore)).not.toEqual([]);
      expect(get(toastsStore)).toEqual([]);

      await listNeurons();

      expect(get(definedNeuronsStore)).toEqual([]);
      expectToastError(
        `There was an unexpected issue while searching for the neurons. ${errorMessage}`
      );
    });

    it("should not reset store or show toast on uncertified error", async () => {
      const errorMessage = "Test error";
      spyQueryNeurons.mockImplementation(async ({ certified }) => {
        if (!certified) {
          throw new Error(errorMessage);
        }
        return neurons;
      });

      neuronsStore.pushNeurons({ neurons, certified: true });

      expect(get(definedNeuronsStore)).not.toEqual([]);
      expect(get(toastsStore)).toEqual([]);

      await listNeurons();

      expect(get(definedNeuronsStore)).not.toEqual([]);
      expect(get(toastsStore)).toEqual([]);
    });

    it("should not call api when called twice and cache is not reset", async () => {
      expect(spyQueryNeurons).not.toBeCalled();
      await listNeurons();

      expect(spyQueryNeurons).toBeCalledWith({
        identity: mockIdentity,
        certified: true,
        includeEmptyNeurons: false,
      });

      expect(spyQueryNeurons).toBeCalledWith({
        identity: mockIdentity,
        certified: false,
        includeEmptyNeurons: false,
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
        neuronId: 10n,
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

    it("should call joinCommunity if user is a hotkey", async () => {
      const neuron: NeuronInfo = {
        ...mockNeuron,
        joinedCommunityFundTimestampSeconds: undefined,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          controller: "not-user",
          hotKeys: [mockIdentity.getPrincipal().toText()],
        },
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
        joinedCommunityFundTimestampSeconds: 2_000n,
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

  describe("refreshVotingPowerForNeurons", () => {
    const neuron1 = {
      neuronId: 1n,
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        controller: testIdentity.getPrincipal().toText(),
      },
    };
    const neuron2 = {
      neuronId: 22n,
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        controller: testIdentity.getPrincipal().toText(),
      },
    };
    const hotkeyPrincipal = principal(1357).toText();
    const hotkeyNeuronNoFollowees = {
      ...mockNeuron,
      neuronId: 5_555n,
      fullNeuron: {
        ...mockFullNeuron,
        controller: hotkeyPrincipal,
        followees: [],
        hotKeys: [mockIdentity.getPrincipal().toText()],
      },
    };
    const testFollowee = [1_234n, 5_678n];
    const hotkeyNeuronWithFollowees = {
      ...mockNeuron,
      neuronId: 100_000n,
      fullNeuron: {
        ...mockFullNeuron,
        controller: hotkeyPrincipal,
        followees: [
          { topic: Topic.Governance, followees: testFollowee },
          { topic: Topic.NeuronManagement, followees: [1n, 2n, 3n] },
        ],
        hotKeys: [mockIdentity.getPrincipal().toText()],
      },
    };
    const hwPrincipal = mockHardwareWalletAccount.principal.toText();
    const ledgerNeuronNoFollowees = {
      ...mockNeuron,
      neuronId: 9_876n,
      fullNeuron: {
        ...mockFullNeuron,
        controller: hwPrincipal,
        followees: [],
      },
    };
    const ledgerNeuronWithFollowees = {
      ...mockNeuron,
      neuronId: 7_531n,
      fullNeuron: {
        ...mockFullNeuron,
        controller: hwPrincipal,
        followees: [
          { topic: Topic.Governance, followees: testFollowee },
          { topic: Topic.NeuronManagement, followees: [1n, 2n, 3n] },
        ],
      },
    };

    it("should refresh voting state of the neuron", async () => {
      const neurons = [neuron1, neuron2];
      neuronsStore.pushNeurons({ neurons, certified: true });

      expect(spyRefreshVotingPower).toBeCalledTimes(0);
      const { successCount } = await services.refreshVotingPowerForNeurons({
        neuronIds: [neuron1.neuronId, neuron2.neuronId],
      });

      expect(spyRefreshVotingPower).toBeCalledTimes(2);
      expect(spyRefreshVotingPower).toHaveBeenCalledWith({
        identity: mockIdentity,
        neuronId: neuron1.neuronId,
      });
      expect(spyRefreshVotingPower).toHaveBeenCalledWith({
        identity: mockIdentity,
        neuronId: neuron2.neuronId,
      });
      expect(successCount).toBe(neurons.length);
    });

    it("should use setFollowees to refresh voting state of the hotkey and HW neuron", async () => {
      const spySetFollowees = vi
        .spyOn(api, "setFollowees")
        .mockResolvedValue(undefined);
      setAccountsForTesting({
        main: mockMainAccount,
        hardwareWallets: [mockHardwareWalletAccount],
      });
      const neurons = [
        neuron1,
        hotkeyNeuronNoFollowees,
        hotkeyNeuronWithFollowees,
        ledgerNeuronNoFollowees,
        ledgerNeuronWithFollowees,
      ];
      neuronsStore.pushNeurons({
        neurons,
        certified: true,
      });

      expect(spyRefreshVotingPower).toBeCalledTimes(0);
      expect(spySetFollowees).toBeCalledTimes(0);

      const { successCount } = await services.refreshVotingPowerForNeurons({
        neuronIds: [
          hotkeyNeuronNoFollowees.neuronId,
          neuron2.neuronId,
          hotkeyNeuronWithFollowees.neuronId,
          ledgerNeuronNoFollowees.neuronId,
          ledgerNeuronWithFollowees.neuronId,
        ],
      });

      expect(successCount).toBe(neurons.length);
      // own neuron
      expect(spyRefreshVotingPower).toBeCalledTimes(1);
      expect(spyRefreshVotingPower).toHaveBeenCalledWith({
        identity: mockIdentity,
        neuronId: neuron1.neuronId,
      });
      // hotkey/HW neurons
      expect(spySetFollowees).toBeCalledTimes(4);
      expect(spySetFollowees).toHaveBeenCalledWith({
        identity: mockIdentity,
        neuronId: hotkeyNeuronNoFollowees.neuronId,
        followees: [],
        topic: Topic.Governance,
      });
      expect(spySetFollowees).toHaveBeenCalledWith({
        identity: mockIdentity,
        neuronId: hotkeyNeuronWithFollowees.neuronId,
        followees: testFollowee,
        topic: Topic.Governance,
      });
      expect(spySetFollowees).toHaveBeenCalledWith({
        identity: mockIdentity,
        neuronId: ledgerNeuronNoFollowees.neuronId,
        followees: [],
        topic: Topic.Governance,
      });
      expect(spySetFollowees).toHaveBeenCalledWith({
        identity: mockIdentity,
        neuronId: ledgerNeuronWithFollowees.neuronId,
        followees: testFollowee,
        topic: Topic.Governance,
      });
    });

    it("should reload the neurons", async () => {
      const neurons = [neuron1];
      neuronsStore.pushNeurons({ neurons, certified: true });

      let resolveRefreshVotingPower;
      const spyRefreshVotingPower = vi
        .spyOn(api, "refreshVotingPower")
        .mockImplementation(
          () => new Promise((resolve) => (resolveRefreshVotingPower = resolve))
        );
      const spyQueryNeurons = vi
        .spyOn(api, "queryNeurons")
        .mockResolvedValue(neurons);

      services.refreshVotingPowerForNeurons({
        neuronIds: [neuron1.neuronId],
      });
      await runResolvedPromises();

      expect(spyRefreshVotingPower).toBeCalledTimes(1);
      expect(spyQueryNeurons).toBeCalledTimes(0);

      resolveRefreshVotingPower();
      await runResolvedPromises();

      expect(spyQueryNeurons).toBeCalledTimes(2);
    });

    it("should skip reloading the neurons when all of them fail.", async () => {
      const neurons = [neuron1, neuron2];
      neuronsStore.pushNeurons({ neurons, certified: true });

      // All neurons fail
      const spyRefreshVotingPower = vi
        .spyOn(api, "refreshVotingPower")
        .mockRejectedValue(undefined);
      // ignore console errors
      vi.spyOn(console, "error").mockReturnValue();
      const spyQueryNeurons = vi
        .spyOn(api, "queryNeurons")
        .mockResolvedValue(neurons);

      await services.refreshVotingPowerForNeurons({
        neuronIds: [neuron1.neuronId, neuron2.neuronId],
      });

      expect(spyRefreshVotingPower).toBeCalledTimes(2);
      expect(spyQueryNeurons).toBeCalledTimes(0);
    });

    it("should handle errors", async () => {
      const testError = new Error("Test error");
      const neurons = [neuron1, neuron2];
      neuronsStore.pushNeurons({ neurons, certified: true });

      const spyConsoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const spyRefreshVotingPower = vi
        .spyOn(api, "refreshVotingPower")
        // First neuron fails, second succeeds
        .mockRejectedValueOnce(testError)
        .mockResolvedValueOnce();

      const { successCount } = await services.refreshVotingPowerForNeurons({
        neuronIds: [neuron1.neuronId, neuron2.neuronId],
      });

      expect(spyRefreshVotingPower).toBeCalledTimes(2);
      expect(successCount).toBe(1);
      expect(spyConsoleError).toBeCalledTimes(1);
      expect(spyConsoleError).toBeCalledWith(
        "Failed to refresh neuronId 1",
        testError
      );
      expectToastError("An error occurred while confirming following.");
    });

    it("should handle errors from controlled and hotkey neurons", async () => {
      const testError = new Error("Test error");
      const spyConsoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const spySetFollowees = vi
        .spyOn(api, "setFollowees")
        .mockRejectedValue(testError);
      const spyRefreshVotingPower = vi
        .spyOn(api, "refreshVotingPower")
        .mockRejectedValue(testError);

      setAccountsForTesting({
        main: mockMainAccount,
        hardwareWallets: [mockHardwareWalletAccount],
      });
      const neurons = [
        hotkeyNeuronNoFollowees,
        neuron1,
        ledgerNeuronNoFollowees,
      ];
      neuronsStore.pushNeurons({
        neurons,
        certified: true,
      });

      expect(spySetFollowees).toBeCalledTimes(0);
      expect(spyRefreshVotingPower).toBeCalledTimes(0);

      const { successCount } = await services.refreshVotingPowerForNeurons({
        neuronIds: [
          hotkeyNeuronNoFollowees.neuronId,
          neuron1.neuronId,
          ledgerNeuronNoFollowees.neuronId,
        ],
      });

      expect(successCount).toBe(0);
      expect(spyRefreshVotingPower).toBeCalledTimes(1);
      expect(spySetFollowees).toBeCalledTimes(2);
      expect(spyConsoleError).toBeCalledTimes(3);
      expect(spyConsoleError).toBeCalledWith(
        "Failed to refresh neuronId 1",
        testError
      );
      expect(spyConsoleError).toBeCalledWith(
        "Failed to refresh neuronId 5555",
        testError
      );
      expect(spyConsoleError).toBeCalledWith(
        "Failed to refresh neuronId 9876",
        testError
      );
      expectToastError("An error occurred while confirming following.");
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

  describe("disburseMaturity", () => {
    it("should call disburse maturity api", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      expect(spyDisburseMaturity).toBeCalledTimes(0);
      const { success } = await services.disburseMaturity({
        neuronId: controlledNeuron.neuronId,
        percentageToDisburse: 50,
      });

      expect(spyDisburseMaturity).toBeCalledTimes(1);
      expect(spyDisburseMaturity).toBeCalledWith({
        identity: mockIdentity,
        neuronId: controlledNeuron.neuronId,
        percentageToDisburse: 50,
      });
      expect(success).toBe(true);
    });

    it("should provide account identifier", async () => {
      neuronsStore.pushNeurons({ neurons, certified: true });
      expect(spyDisburseMaturity).toBeCalledTimes(0);
      const { success } = await services.disburseMaturity({
        neuronId: controlledNeuron.neuronId,
        percentageToDisburse: 50,
        toAccountIdentifier: mockMainAccount.identifier,
      });

      expect(spyDisburseMaturity).toBeCalledTimes(1);
      expect(spyDisburseMaturity).toBeCalledWith({
        identity: mockIdentity,
        neuronId: controlledNeuron.neuronId,
        percentageToDisburse: 50,
        toAccountIdentifier: mockMainAccount.identifier,
      });
      expect(success).toBe(true);
    });

    it("should not call disburse maturity if no identity provided", async () => {
      setNoIdentity();

      const { success } = await services.disburseMaturity({
        neuronId: controlledNeuron.neuronId,
        percentageToDisburse: 50,
      });

      expectToastError(en.error.missing_identity);
      expect(spyDisburseMaturity).toBeCalledTimes(0);
      expect(success).toBe(false);
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
        neuronId: 5_555n,
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
      setAccountsForTesting({
        main: mockMainAccount,
        hardwareWallets: [hwAccount],
      });
      const neuron1 = {
        ...mockNeuron,
        neuronId: 5_555n,
        fullNeuron: {
          ...mockFullNeuron,
          controller: smallerVersionIdentity.getPrincipal().toText(),
        },
      };
      const neuron2 = {
        ...mockNeuron,
        neuronId: 5_556n,
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
        neuronId: 5_555n,
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
      setAccountsForTesting({
        main: mockMainAccount,
        hardwareWallets: [mockHardwareWalletAccount],
      });
      const hwPrincipal = mockHardwareWalletAccount.principal.toText();
      const neuron1 = {
        ...mockNeuron,
        neuronId: 5_555n,
        fullNeuron: {
          ...mockFullNeuron,
          controller: hwPrincipal,
        },
      };
      const neuron2 = {
        ...mockNeuron,
        neuronId: 5_556n,
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
        identity: mockLedgerIdentity,
        neuronId: controlledNeuron.neuronId,
        principal: mockIdentity.getPrincipal(),
      });
      expect(spyAddHotkey).toBeCalledTimes(1);
    });

    it("should display appropriate busy screen", async () => {
      const spyBusyStart = vi.spyOn(busyStore, "startBusy");
      const spyBusyStop = vi.spyOn(busyStore, "stopBusy");

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
        vi.fn().mockRejectedValue(new NotAuthorizedNeuronError())
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

      await startDissolving(10n);

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

      await stopDissolving(10n);

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
      const amountE8s = 220_000_000n;
      const transactionFee = DEFAULT_TRANSACTION_FEE_E8S;
      await services.splitNeuron({
        neuron: controlledNeuron,
        amount,
      });

      expect(spySplitNeuron).toBeCalledWith({
        identity: mockIdentity,
        neuronId: controlledNeuron.neuronId,
        amount: amountE8s + BigInt(transactionFee),
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
      setAccountsForTesting({
        main: mockMainAccount,
        hardwareWallets: [hwAccount],
      });
      const neuron = {
        ...mockNeuron,
        neuronId: 5_555n,
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
      const followee = 8n;
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
      const followee = 10n;
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
      const followee = 8n;
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
      const followee = 8n;
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
      const followee = 8n;
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
      const followee = 8n;
      const topic = Topic.NeuronManagement;
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
    const followee = 8n;
    const topic = Topic.ExchangeRate;
    const neuronFollowing = {
      ...controlledNeuron,
      fullNeuron: {
        ...controlledNeuron.fullNeuron,
        followees: [{ topic, followees: [followee] }],
      },
    };
    it("should remove the followee to next call", async () => {
      const followee = 8n;
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
      const followee = 8n;
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
      const followee = 8n;
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
      const followee = 8n;
      const topic = Topic.NeuronManagement;
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
      expect(spyGetNeuron).not.toBeCalled();
      await loadNeuron({
        neuronId: mockNeuron.neuronId,
        setNeuron: vi.fn(),
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

    it("should show a toast on error", async () => {
      spyConsoleError.mockReturnValue();
      const errorMessage = "error message";
      spyGetNeuron.mockRejectedValue(new Error(errorMessage));

      expect(get(toastsStore)).toEqual([]);

      await loadNeuron({
        neuronId: mockNeuron.neuronId,
        setNeuron: vi.fn(),
      });

      expectToastError(
        `An error occurred while loading the neuron. ${errorMessage}`
      );
    });

    it("should not show a toast on uncertified error", async () => {
      spyConsoleError.mockReturnValue();
      const errorMessage = "error message";
      spyGetNeuron.mockImplementation(async ({ certified }) => {
        if (!certified) {
          throw new Error(errorMessage);
        }
        return mockNeuron;
      });

      expect(get(toastsStore)).toEqual([]);

      await loadNeuron({
        neuronId: mockNeuron.neuronId,
        setNeuron: vi.fn(),
      });

      expect(get(toastsStore)).toEqual([]);
    });

    it("should call setNeuron even if the neuron doesn't have fullNeuron", async () => {
      const neuronId = 333_333n;
      const publicInfoNeuron = {
        ...mockNeuron,
        neuronId,
        fullNeuron: undefined,
      };
      spyGetNeuron.mockResolvedValue(publicInfoNeuron);
      const setNeuronSpy = vi.fn();

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

    it("should raise NotAuthorizedNeuronError if fullNeuron is not defined", async () => {
      const neuron = {
        ...mockNeuron,
        fullNeuron: undefined,
      };
      neuronsStore.setNeurons({ neurons: [neuron], certified: true });
      const call = () => getIdentityOfControllerByNeuronId(neuron.neuronId);
      await expect(call).rejects.toThrow(NotAuthorizedNeuronError);
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
      await expect(call).rejects.toThrow(NotAuthorizedNeuronError);
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
      expectToastError(en.error.neuron_account_not_found);
    });

    it("should fail if amount and neuron stake are not enough", async () => {
      const { success } = await topUpNeuron({
        neuron: {
          ...mockNeuron,
          fullNeuron: {
            ...mockFullNeuron,
            cachedNeuronStake: MIN_NEURON_STAKE / 2n - 10n,
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

  describe("refreshNeuronIfNeeded", () => {
    it("should refresh the neuron if its account balance doesn't match", async () => {
      const oldStake = 1_000_000_000n;
      const newStake = 2_000_000_000n;
      const neuronId = 31n;
      const neuronAccountIdentifier = "23847628347623847623847269";

      const neuron = {
        ...mockNeuron,
        neuronId,
        stake: oldStake,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          cachedNeuronStake: oldStake,
          accountIdentifier: neuronAccountIdentifier,
        },
      };

      spyQueryAccountBalance.mockResolvedValue(newStake);

      expect(spyQueryAccountBalance).toBeCalledTimes(0);
      expect(spyClaimOrRefresh).toBeCalledTimes(0);

      expect(get(toastsStore)).toEqual([]);

      await refreshNeuronIfNeeded(neuron);

      expect(spyQueryAccountBalance).toBeCalledTimes(1);
      expect(spyQueryAccountBalance).toBeCalledWith({
        icpAccountIdentifier: neuronAccountIdentifier,
        certified: false,
        identity: new AnonymousIdentity(),
      });
      expect(spyClaimOrRefresh).toBeCalledTimes(1);
      expect(spyClaimOrRefresh).toBeCalledWith({
        identity: mockIdentity,
        neuronId: neuronId,
      });

      expect(get(toastsStore)).toMatchObject([
        {
          level: "success",
          text: "Your neuron's stake was refreshed successfully.",
        },
      ]);
    });

    it("should not refresh the neuron if its account balance does match", async () => {
      const stake = 1_000_000_000n;
      const neuronId = 31n;
      const neuronAccountIdentifier = "23847628347623847623847269";

      const neuron = {
        ...mockNeuron,
        neuronId,
        stake,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          cachedNeuronStake: stake,
          accountIdentifier: neuronAccountIdentifier,
        },
      };

      spyQueryAccountBalance.mockResolvedValue(stake);

      expect(spyQueryAccountBalance).toBeCalledTimes(0);
      expect(spyClaimOrRefresh).toBeCalledTimes(0);

      await refreshNeuronIfNeeded(neuron);

      expect(spyQueryAccountBalance).toBeCalledTimes(1);
      expect(spyQueryAccountBalance).toBeCalledWith({
        icpAccountIdentifier: neuronAccountIdentifier,
        certified: false,
        identity: new AnonymousIdentity(),
      });
      expect(spyClaimOrRefresh).toBeCalledTimes(0);
    });

    it("should query neuron's balance only once per session", async () => {
      const stake = 1_000_000_000n;
      const neuronId = 31n;
      const neuronAccountIdentifier = "23847628347623847623847269";

      const neuron = {
        ...mockNeuron,
        neuronId,
        stake,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          cachedNeuronStake: stake,
          accountIdentifier: neuronAccountIdentifier,
        },
      };

      spyQueryAccountBalance.mockResolvedValue(stake);

      expect(spyQueryAccountBalance).toBeCalledTimes(0);
      expect(spyClaimOrRefresh).toBeCalledTimes(0);

      await refreshNeuronIfNeeded(neuron);

      expect(spyQueryAccountBalance).toBeCalledTimes(1);
      expect(spyQueryAccountBalance).toBeCalledWith({
        icpAccountIdentifier: neuronAccountIdentifier,
        certified: false,
        identity: new AnonymousIdentity(),
      });
      expect(spyClaimOrRefresh).toBeCalledTimes(0);

      await refreshNeuronIfNeeded(neuron);
      expect(spyQueryAccountBalance).toBeCalledTimes(1);
      expect(spyClaimOrRefresh).toBeCalledTimes(0);
    });
  });

  describe("claimNeuronsIfNeeded", () => {
    const neuronController = Principal.fromText("oa3zv-mbqe4-3ekjz-w");
    const memo = 54321n;
    // Neuron account identifier calculated with
    // $ GOVERNANCE_CANISTER_ID=rrkah-fqaaa-aaaaa-aaaaq-cai
    // $ CONTROLLER=oa3zv-mbqe4-3ekjz-w
    // $ MEMO=54321
    // $ SUBACCOUNT="$(scripts/convert-id --input text --output hex --as_neuron_subaccount $CONTROLLER $MEMO)"
    // $ ACCOUNT_IDENTIFIER=$(scripts/convert-id --input text --output account_identifier --subaccount_format hex $GOVERNANCE_CANISTER_ID $SUBACCOUNT)"
    const neuronAccountIdentifier =
      "4fd80d693ceec3278efd81e570e86647de9f3279e7d145fc47d1b5c43c26f104";
    const stakingTransaction: TransactionWithId = {
      ...mockTransactionWithId,
      id: 1n,
      transaction: {
        ...mockTransactionWithId.transaction,
        memo,
        operation: {
          ...mockTransactionWithId.transaction.operation,
          Transfer: {
            ...mockTransactionWithId.transaction.operation["Transfer"],
            to: neuronAccountIdentifier,
          },
        },
      },
    };
    const claimedNeuronId = 761243637n;
    const claimedNeuron = {
      neuronId: claimedNeuronId,
      ...mockNeuron,
    };

    beforeEach(() => {
      spyClaimOrRefreshByMemo.mockResolvedValue(claimedNeuronId);
      spyGetNeuron.mockResolvedValue(claimedNeuron);
    });

    it("should claim a neuron from a staking transaction", async () => {
      expect(get(neuronsStore)).toEqual({
        neurons: undefined,
        certified: undefined,
      });

      expect(spyClaimOrRefreshByMemo).toBeCalledTimes(0);
      expect(spyGetNeuron).toBeCalledTimes(0);

      await claimNeuronsIfNeeded({
        controller: neuronController,
        transactions: [stakingTransaction],
        neuronAccounts: new Set(),
      });

      expect(spyClaimOrRefreshByMemo).toBeCalledTimes(1);
      expect(spyClaimOrRefreshByMemo).toBeCalledWith({
        controller: neuronController,
        memo,
        identity: new AnonymousIdentity(),
      });
      expect(spyGetNeuron).toBeCalledTimes(1);
      expect(spyGetNeuron).toBeCalledWith({
        certified: true,
        identity: mockIdentity,
        neuronId: claimedNeuronId,
      });

      expect(get(neuronsStore)).toEqual({
        neurons: [claimedNeuron],
        certified: true,
      });
      expect(get(toastsStore)).toEqual([]);
    });

    it("should not claim a neuron that's already known", async () => {
      expect(get(neuronsStore)).toEqual({
        neurons: undefined,
        certified: undefined,
      });

      expect(spyClaimOrRefreshByMemo).toBeCalledTimes(0);
      expect(spyGetNeuron).toBeCalledTimes(0);

      await claimNeuronsIfNeeded({
        controller: neuronController,
        transactions: [stakingTransaction],
        neuronAccounts: new Set([neuronAccountIdentifier]),
      });

      expect(spyClaimOrRefreshByMemo).toBeCalledTimes(0);
      expect(spyGetNeuron).toBeCalledTimes(0);

      expect(get(neuronsStore)).toEqual({
        neurons: undefined,
        certified: undefined,
      });
      expect(get(toastsStore)).toEqual([]);
    });

    it("should not claim a neuron from a transaction with memo that does not match the account identifier", async () => {
      expect(get(neuronsStore)).toEqual({
        neurons: undefined,
        certified: undefined,
      });

      expect(spyClaimOrRefreshByMemo).toBeCalledTimes(0);
      expect(spyGetNeuron).toBeCalledTimes(0);

      await claimNeuronsIfNeeded({
        controller: neuronController,
        transactions: [
          {
            ...stakingTransaction,
            transaction: {
              ...stakingTransaction.transaction,
              memo: memo + 1n,
            },
          },
        ],
        neuronAccounts: new Set(),
      });

      expect(spyClaimOrRefreshByMemo).toBeCalledTimes(0);
      expect(spyGetNeuron).toBeCalledTimes(0);

      expect(get(neuronsStore)).toEqual({
        neurons: undefined,
        certified: undefined,
      });
      expect(get(toastsStore)).toEqual([]);
    });

    it("should not claim a neuron from a transaction without memo", async () => {
      expect(get(neuronsStore)).toEqual({
        neurons: undefined,
        certified: undefined,
      });

      expect(spyClaimOrRefreshByMemo).toBeCalledTimes(0);
      expect(spyGetNeuron).toBeCalledTimes(0);

      await claimNeuronsIfNeeded({
        controller: neuronController,
        transactions: [
          {
            ...stakingTransaction,
            transaction: {
              ...stakingTransaction.transaction,
              memo: 0n,
            },
          },
        ],
        neuronAccounts: new Set(),
      });

      expect(spyClaimOrRefreshByMemo).toBeCalledTimes(0);
      expect(spyGetNeuron).toBeCalledTimes(0);

      expect(get(neuronsStore)).toEqual({
        neurons: undefined,
        certified: undefined,
      });
      expect(get(toastsStore)).toEqual([]);
    });

    it("should ignore errors from claiming", async () => {
      spyClaimOrRefreshByMemo.mockRejectedValue(new Error("Test error"));

      expect(get(neuronsStore)).toEqual({
        neurons: undefined,
        certified: undefined,
      });

      expect(spyClaimOrRefreshByMemo).toBeCalledTimes(0);
      expect(spyGetNeuron).toBeCalledTimes(0);

      await claimNeuronsIfNeeded({
        controller: neuronController,
        transactions: [stakingTransaction],
        neuronAccounts: new Set(),
      });

      expect(spyClaimOrRefreshByMemo).toBeCalledTimes(1);
      expect(spyClaimOrRefreshByMemo).toBeCalledWith({
        controller: neuronController,
        memo,
        identity: new AnonymousIdentity(),
      });
      expect(spyGetNeuron).toBeCalledTimes(0);

      expect(get(neuronsStore)).toEqual({
        neurons: undefined,
        certified: undefined,
      });

      expect(get(toastsStore)).toEqual([]);
    });

    it("should not try to claim a neuron more than once per session", async () => {
      spyClaimOrRefreshByMemo.mockRejectedValue(new Error("Test error"));

      expect(spyClaimOrRefreshByMemo).toBeCalledTimes(0);
      expect(spyGetNeuron).toBeCalledTimes(0);

      await claimNeuronsIfNeeded({
        controller: neuronController,
        transactions: [stakingTransaction],
        neuronAccounts: new Set(),
      });

      expect(spyClaimOrRefreshByMemo).toBeCalledTimes(1);
      expect(spyGetNeuron).toBeCalledTimes(0);

      await claimNeuronsIfNeeded({
        controller: neuronController,
        transactions: [stakingTransaction],
        neuronAccounts: new Set(),
      });

      expect(spyClaimOrRefreshByMemo).toBeCalledTimes(1);
      expect(spyGetNeuron).toBeCalledTimes(0);

      expect(get(toastsStore)).toEqual([]);
    });
  });

  describe("changeNeuronVisibility", () => {
    it("should call changeNeuronVisibility and getNeuron", async () => {
      expect(spyChangeNeuronVisibility).not.toHaveBeenCalled();
      expect(spyGetNeuron).not.toHaveBeenCalled();

      neuronsStore.setNeurons({ neurons: [controlledNeuron], certified: true });

      const { success } = await changeNeuronVisibility({
        neurons: [controlledNeuron],
        makePublic: true,
      });

      expect(success).toBe(true);
      expect(spyChangeNeuronVisibility).toBeCalledWith({
        neuronIds: [controlledNeuron.neuronId],
        identity: mockIdentity,
        visibility: NeuronVisibility.Public,
      });
      expect(spyChangeNeuronVisibility).toBeCalledTimes(1);
      expect(spyGetNeuron).toBeCalled();
    });

    it("should change visibility to private for all neurons", async () => {
      expect(spyChangeNeuronVisibility).not.toHaveBeenCalled();
      expect(spyGetNeuron).not.toHaveBeenCalled();
      neuronsStore.setNeurons({ neurons: [controlledNeuron], certified: true });

      const { success } = await changeNeuronVisibility({
        neurons: [controlledNeuron],
        makePublic: false,
      });

      expect(success).toBe(true);
      expect(spyChangeNeuronVisibility).toBeCalledWith({
        neuronIds: [controlledNeuron.neuronId],
        identity: mockIdentity,
        visibility: NeuronVisibility.Private,
      });
      expect(spyChangeNeuronVisibility).toBeCalledTimes(1);
      expect(spyGetNeuron).toBeCalled();
    });

    it("should handle partial failure", async () => {
      spyConsoleError.mockReturnValue();
      expect(spyChangeNeuronVisibility).not.toHaveBeenCalled();
      expect(spyGetNeuron).not.toHaveBeenCalled();
      const neuron1 = { ...controlledNeuron, neuronId: 1n };
      const neuron2 = { ...controlledNeuron, neuronId: 2n };
      neuronsStore.setNeurons({ neurons: [neuron1, neuron2], certified: true });

      spyChangeNeuronVisibility.mockResolvedValueOnce(undefined);
      spyChangeNeuronVisibility.mockRejectedValueOnce(new Error("Test error"));

      const { success } = await changeNeuronVisibility({
        neurons: [neuron1, neuron2],
        makePublic: true,
      });

      expect(success).toBe(false);
      expect(spyChangeNeuronVisibility).toBeCalledTimes(2);
      expect(spyGetNeuron).toBeCalledTimes(1);
      expectToastError(
        '1 out of 2 neurons have failed to update their visibility, please try again later. You can change neuron visibility at any time under "Advanced Details & Settings".'
      );
    });

    it("should handle complete failure", async () => {
      spyConsoleError.mockReturnValue();
      expect(spyChangeNeuronVisibility).not.toHaveBeenCalled();
      expect(spyGetNeuron).not.toHaveBeenCalled();
      neuronsStore.setNeurons({ neurons: [controlledNeuron], certified: true });
      spyChangeNeuronVisibility.mockRejectedValue(new Error("Test error"));

      const { success } = await changeNeuronVisibility({
        neurons: [controlledNeuron],
        makePublic: true,
      });

      expect(success).toBe(false);
      expect(spyChangeNeuronVisibility).toBeCalledTimes(1);
      expect(spyGetNeuron).not.toBeCalled();
      expectToastError(
        'Your neurons have failed to update their visibility, please try again later. You can change neuron visibility at any time under "Advanced Details & Settings".'
      );
    });

    it("should handle multiple neurons", async () => {
      expect(spyChangeNeuronVisibility).not.toHaveBeenCalled();
      expect(spyGetNeuron).not.toHaveBeenCalled();
      const neuron1 = { ...controlledNeuron, neuronId: 1n };
      const neuron2 = { ...controlledNeuron, neuronId: 2n };
      neuronsStore.setNeurons({ neurons: [neuron1, neuron2], certified: true });

      const { success } = await changeNeuronVisibility({
        neurons: [neuron1, neuron2],
        makePublic: true,
      });

      expect(success).toBe(true);
      expect(spyChangeNeuronVisibility).toBeCalledTimes(2);
      expect(spyGetNeuron).toBeCalledTimes(2);
    });
  });
});
