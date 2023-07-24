import * as governanceApi from "$lib/api/sns-governance.api";
import * as api from "$lib/api/sns.api";
import { E8S_PER_ICP } from "$lib/constants/icp.constants";
import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import { loadSnsAccounts } from "$lib/services/sns-accounts.services";
import * as services from "$lib/services/sns-neurons.services";
import {
  disburse,
  increaseStakeNeuron,
  stakeMaturity,
  startDissolving,
  stopDissolving,
  toggleAutoStakeMaturity,
  updateDelay,
} from "$lib/services/sns-neurons.services";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import { toastsError } from "$lib/stores/toasts.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import {
  getSnsNeuronIdAsHexString,
  subaccountToHexString,
} from "$lib/utils/sns-neuron.utils";
import { numberToE8s } from "$lib/utils/token.utils";
import { bytesToHexString } from "$lib/utils/utils";
import { mockIdentity, mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import {
  buildMockSnsNeuronsStoreSubscribe,
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { mockTokenStore } from "$tests/mocks/sns-projects.mock";
import { decodeIcrcAccount } from "@dfinity/ledger";
import { Principal } from "@dfinity/principal";
import {
  neuronSubaccount,
  type SnsNeuron,
  type SnsNeuronId,
} from "@dfinity/sns";
import {
  arrayOfNumberToUint8Array,
  fromDefinedNullable,
  fromNullable,
} from "@dfinity/utils";
import { waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import { get } from "svelte/store";
import type { SpyInstance } from "vitest";

const {
  syncSnsNeurons,
  getSnsNeuron,
  addHotkey,
  removeHotkey,
  splitNeuron,
  stakeNeuron,
  loadNeurons,
  addFollowee,
} = services;

vi.mock("$lib/stores/toasts.store", () => {
  return {
    toastsError: vi.fn(),
  };
});

vi.mock("$lib/services/sns-accounts.services", () => {
  return {
    loadSnsAccounts: vi.fn(),
  };
});

describe("sns-neurons-services", () => {
  const subaccount: Uint8Array = neuronSubaccount({
    controller: mockIdentity.getPrincipal(),
    index: 0,
  });
  const neuronId: SnsNeuronId = { id: subaccount };
  const mockNeuron = {
    ...mockSnsNeuron,
    id: [neuronId] as [SnsNeuronId],
  };

  describe("syncSnsNeurons", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      snsNeuronsStore.reset();

      snsParametersStore.reset();
      snsParametersStore.setParameters({
        rootCanisterId: mockPrincipal,
        certified: true,
        parameters: snsNervousSystemParametersMock,
      });
    });

    describe("when sns parameteres are not loaded", () => {
      beforeEach(() => {
        snsParametersStore.reset();
      });

      it("should call api.querySnsNeurons and load neurons in store", async () => {
        const spyQuery = vi
          .spyOn(governanceApi, "querySnsNeurons")
          .mockImplementation(() => Promise.resolve([mockNeuron]));
        const spyNeuronBalance = vi
          .spyOn(governanceApi, "getNeuronBalance")
          .mockImplementationOnce(() =>
            Promise.resolve(mockSnsNeuron.cached_neuron_stake_e8s)
          )
          .mockImplementation(() => Promise.resolve(BigInt(0)));
        const spyOnNervousSystemParameters = vi
          .spyOn(governanceApi, "nervousSystemParameters")
          .mockResolvedValue(snsNervousSystemParametersMock);

        expect(spyOnNervousSystemParameters).not.toBeCalled();
        // expect parameters not to be in store
        expect(get(snsParametersStore)[mockPrincipal.toText()]).toBeUndefined();

        await syncSnsNeurons(mockPrincipal);

        await tick();

        const store = get(snsNeuronsStore);
        expect(store[mockPrincipal.toText()]?.neurons).toHaveLength(1);
        expect(spyOnNervousSystemParameters).toBeCalled();
        expect(spyQuery).toBeCalled();
        expect(spyNeuronBalance).toBeCalled();
      });
    });

    describe("when sns parameters are loaded", () => {
      const spyOnNervousSystemParameters = vi
        .spyOn(governanceApi, "nervousSystemParameters")
        .mockRejectedValue("should not be called");

      beforeEach(() => {
        spyOnNervousSystemParameters.mockClear();
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
        const spyQuery = vi
          .spyOn(governanceApi, "querySnsNeurons")
          .mockImplementation(() => Promise.resolve([neuron]));
        const spyNeuronBalance = vi
          .spyOn(governanceApi, "getNeuronBalance")
          .mockImplementationOnce(() =>
            Promise.resolve(mockSnsNeuron.cached_neuron_stake_e8s)
          )
          .mockImplementation(() => Promise.resolve(BigInt(0)));

        // expect parameters to be in store
        expect(
          get(snsParametersStore)[mockPrincipal.toText()]
        ).not.toBeUndefined();

        await syncSnsNeurons(mockPrincipal);

        await tick();
        const store = get(snsNeuronsStore);
        expect(store[mockPrincipal.toText()]?.neurons).toHaveLength(1);
        expect(spyQuery).toBeCalled();
        expect(spyOnNervousSystemParameters).not.toBeCalled();
        expect(spyNeuronBalance).toBeCalled();
      });
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
      const spyQuery = vi
        .spyOn(governanceApi, "querySnsNeurons")
        .mockImplementation(() => Promise.resolve([neuron]));
      const spyNeuronQuery = vi
        .spyOn(governanceApi, "getSnsNeuron")
        .mockImplementation(() => Promise.resolve(neuron));
      const spyNeuronBalance = vi
        .spyOn(governanceApi, "getNeuronBalance")
        .mockImplementationOnce(() =>
          Promise.resolve(
            mockSnsNeuron.cached_neuron_stake_e8s + BigInt(10_000)
          )
        )
        .mockImplementation(() => Promise.resolve(BigInt(0)));
      const spyRefreshNeuron = vi
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
      const spyQuery = vi
        .spyOn(governanceApi, "querySnsNeurons")
        .mockImplementation(() => Promise.resolve([neuron]));
      const spyNeuronQuery = vi
        .spyOn(governanceApi, "getSnsNeuron")
        .mockImplementation(() => Promise.resolve(neuron));
      const spyNeuronBalance = vi
        .spyOn(governanceApi, "getNeuronBalance")
        .mockImplementationOnce(() =>
          Promise.resolve(mockSnsNeuron.cached_neuron_stake_e8s)
        )
        .mockImplementationOnce(() => Promise.resolve(BigInt(200_000_000)))
        .mockImplementation(() => Promise.resolve(BigInt(0)));
      const spyClaimNeuron = vi
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
      vi.spyOn(console, "error").mockReturnValue();

      snsNeuronsStore.setNeurons({
        rootCanisterId: mockPrincipal,
        neurons: [mockSnsNeuron],
        certified: true,
      });
      const spyQuery = vi
        .spyOn(governanceApi, "querySnsNeurons")
        .mockImplementation(() => Promise.reject(undefined));

      await syncSnsNeurons(mockPrincipal);

      await tick();
      const store = get(snsNeuronsStore);
      expect(store[mockPrincipal.toText()]).toBeUndefined();
      expect(spyQuery).toBeCalled();
    });
  });

  describe("loadNeurons", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      snsNeuronsStore.reset();
      vi.spyOn(console, "error").mockReturnValue();
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
      const spyQuery = vi
        .spyOn(governanceApi, "querySnsNeurons")
        .mockImplementation(() => Promise.resolve([neuron]));
      await loadNeurons({ rootCanisterId: mockPrincipal, certified: true });

      await tick();
      const store = get(snsNeuronsStore);
      expect(store[mockPrincipal.toText()]?.neurons).toHaveLength(1);
      expect(spyQuery).toBeCalled();
    });
  });

  describe("getSnsNeuron", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      snsNeuronsStore.reset();
      vi.spyOn(console, "error").mockReturnValue();
    });
    it("should call api.querySnsNeuron and call load neuron when neuron not in store", () =>
      new Promise<void>((done) => {
        const subaccount: Uint8Array = neuronSubaccount({
          controller: mockIdentity.getPrincipal(),
          index: 0,
        });
        const neuronId: SnsNeuronId = { id: subaccount };
        const neuron = {
          ...mockSnsNeuron,
          id: [neuronId] as [SnsNeuronId],
        };
        const spyNeuronBalance = vi
          .spyOn(governanceApi, "getNeuronBalance")
          .mockImplementationOnce(() =>
            Promise.resolve(mockSnsNeuron.cached_neuron_stake_e8s)
          )
          .mockImplementation(() => Promise.resolve(BigInt(0)));
        const spyQuery = vi
          .spyOn(governanceApi, "getSnsNeuron")
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
      }));

    it("should refresh neuron if balance does not match and load again", () =>
      new Promise<void>((done) => {
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
        const spyNeuronBalance = vi
          .spyOn(governanceApi, "getNeuronBalance")
          .mockImplementationOnce(() => Promise.resolve(stake))
          .mockImplementation(() => Promise.resolve(BigInt(0)));
        const spyQuery = vi
          .spyOn(governanceApi, "getSnsNeuron")
          // First is the query call and returns old neuron
          .mockImplementationOnce(() => Promise.resolve(neuron))
          // Second is the update call and returns old neuron. It will be checked.
          .mockImplementationOnce(() => Promise.resolve(neuron))
          // After refreshing we get the updated neuron.
          .mockImplementation(() => Promise.resolve(updatedNeuron));
        const spyRefreshNeuron = vi
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
      }));

    it("should return neuron if it's in the store", () =>
      new Promise<void>((done) => {
        const spyQuery = vi
          .spyOn(governanceApi, "getSnsNeuron")
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
      }));

    it("should call api even if it's in the store when forceFetch", () =>
      new Promise<void>((done) => {
        const spyQuery = vi
          .spyOn(governanceApi, "getSnsNeuron")
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
      }));

    it("should call onError callback when call failes", () =>
      new Promise<void>((done) => {
        const spyQuery = vi
          .spyOn(governanceApi, "getSnsNeuron")
          .mockImplementation(() => Promise.reject());
        const onLoad = vi.fn();
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
      }));
  });

  describe("addHotkey", () => {
    it("should call api.addNeuronPermissions", async () => {
      const spyAdd = vi
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
      const spyAdd = vi
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

      const spyOnDisburse = vi
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

      const spyOnStartDissolving = vi
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

      const spyOnStopDissolving = vi
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
    const spyOnSetDissolveDelay = vi
      .spyOn(governanceApi, "setDissolveDelay")
      .mockImplementation(() => Promise.resolve());
    const nowInSeconds = 1689063315;
    const now = nowInSeconds * 1000;

    beforeEach(() => {
      vi.clearAllTimers();
      vi.useFakeTimers().setSystemTime(now);
      spyOnSetDissolveDelay.mockClear();
    });

    it("should call sns api setDissolveDelay with dissolve timestamp", async () => {
      const neuronId = fromDefinedNullable(mockSnsNeuron.id);
      const identity = mockIdentity;
      const rootCanisterId = mockPrincipal;
      const dissolveDelaySeconds = 123;
      const { success } = await updateDelay({
        rootCanisterId,
        dissolveDelaySeconds,
        neuron: mockSnsNeuron,
      });

      expect(success).toBeTruthy();

      expect(spyOnSetDissolveDelay).toBeCalledWith({
        neuronId,
        identity,
        rootCanisterId,
        dissolveTimestampSeconds: nowInSeconds + dissolveDelaySeconds,
      });
    });
  });

  describe("stakeNeuron", () => {
    afterEach(() => {
      transactionsFeesStore.reset();
      vi.clearAllMocks();
    });

    it("should call sns api stakeNeuron, query neurons again and load sns accounts", async () => {
      transactionsFeesStore.setFee({
        rootCanisterId: mockPrincipal,
        fee: BigInt(100),
        certified: true,
      });
      const spyStake = vi
        .spyOn(api, "stakeNeuron")
        .mockImplementation(() => Promise.resolve(mockSnsNeuron.id[0]));
      const spyQuery = vi
        .spyOn(governanceApi, "querySnsNeurons")
        .mockImplementation(() => Promise.resolve([mockSnsNeuron]));

      const { success } = await stakeNeuron({
        rootCanisterId: mockPrincipal,
        amount: 2,
        account: mockSnsMainAccount,
      });

      expect(success).toBeTruthy();
      expect(spyStake).toBeCalled();
      expect(spyQuery).toBeCalled();
      expect(loadSnsAccounts).toBeCalled();
    });

    it("should not call sns api stakeNeuron if fee is not present", async () => {
      transactionsFeesStore.reset();
      const spyStake = vi
        .spyOn(api, "stakeNeuron")
        .mockImplementation(() => Promise.resolve(mockSnsNeuron.id[0]));

      const { success } = await stakeNeuron({
        rootCanisterId: mockPrincipal,
        amount: 2,
        account: mockSnsMainAccount,
      });

      expect(success).toBe(false);
      expect(spyStake).not.toBeCalled();
    });
  });

  describe("increaseStakeNeuron", () => {
    it("should call api.increaseStakeNeuron and load sns accounts", async () => {
      const spyOnIncreaseStakeNeuron = vi
        .spyOn(api, "increaseStakeNeuron")
        .mockImplementation(() => Promise.resolve());

      const rootCanisterId = mockPrincipal;
      const amount = 2;
      const identity = mockIdentity;
      const neuronId = mockSnsNeuron.id[0] as SnsNeuronId;
      const account = mockSnsMainAccount;
      const identifier = decodeIcrcAccount(account.identifier);

      const { success } = await increaseStakeNeuron({
        rootCanisterId,
        amount,
        account,
        neuronId,
      });

      expect(success).toBeTruthy();

      expect(spyOnIncreaseStakeNeuron).toBeCalledWith({
        neuronId,
        rootCanisterId,
        stakeE8s: numberToE8s(amount),
        identity,
        source: identifier,
      });
      expect(loadSnsAccounts).toBeCalled();
    });
  });

  describe("stakeMaturity", () => {
    it("should call api.stakeMaturity", async () => {
      const neuronId = mockSnsNeuron.id[0] as SnsNeuronId;
      const identity = mockIdentity;
      const rootCanisterId = mockPrincipal;
      const percentageToStake = 60;

      const spyOnStakeMaturity = vi
        .spyOn(governanceApi, "stakeMaturity")
        .mockImplementation(() => Promise.resolve());

      const { success } = await stakeMaturity({
        neuronId,
        rootCanisterId,
        percentageToStake,
      });

      expect(success).toBeTruthy();

      expect(spyOnStakeMaturity).toBeCalledWith({
        neuronId,
        rootCanisterId,
        percentageToStake,
        identity,
      });
    });
  });

  describe("addFollowee ", () => {
    let setFolloweesSpy;

    const followee1: SnsNeuronId = {
      id: arrayOfNumberToUint8Array([1, 2, 3]),
    };
    const followee2: SnsNeuronId = {
      id: arrayOfNumberToUint8Array([1, 2, 4]),
    };
    const followeeHex2 = subaccountToHexString(followee2.id);
    const rootCanisterId = mockPrincipal;
    const functionId = BigInt(3);

    beforeEach(() => {
      vi.clearAllMocks();

      setFolloweesSpy = vi
        .spyOn(governanceApi, "setFollowees")
        .mockImplementation(() => Promise.resolve());
    });

    it("should call sns api setFollowees with new followee when topic already has followees", async () => {
      const queryNeuronSpy = vi
        .spyOn(governanceApi, "querySnsNeuron")
        .mockResolvedValue(mockSnsNeuron);
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        followees: [[functionId, { followees: [followee1] }]],
      };
      await addFollowee({
        rootCanisterId,
        neuron,
        functionId,
        followeeHex: followeeHex2,
      });

      expect(setFolloweesSpy).toBeCalledWith({
        neuronId: fromNullable(neuron.id),
        identity: mockIdentity,
        rootCanisterId,
        followees: [followee1, followee2],
        functionId,
      });
      expect(queryNeuronSpy).toBeCalled();
    });

    it("should call sns api setFollowees with new followee when topic has no followees", async () => {
      vi.spyOn(governanceApi, "querySnsNeuron").mockResolvedValue(
        mockSnsNeuron
      );
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        followees: [[BigInt(4), { followees: [followee1] }]],
      };
      await addFollowee({
        rootCanisterId,
        neuron,
        functionId,
        followeeHex: followeeHex2,
      });

      expect(setFolloweesSpy).toBeCalledWith({
        neuronId: fromNullable(neuron.id),
        identity: mockIdentity,
        rootCanisterId,
        followees: [followee2],
        functionId,
      });
    });

    it("should not call sns api setFollowees when new followee is in the list", async () => {
      vi.spyOn(governanceApi, "querySnsNeuron").mockResolvedValue(
        mockSnsNeuron
      );
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        followees: [[functionId, { followees: [followee2] }]],
      };
      await addFollowee({
        rootCanisterId,
        neuron,
        functionId,
        followeeHex: followeeHex2,
      });

      expect(setFolloweesSpy).not.toBeCalled();
      expect(toastsError).toBeCalled();
    });

    it("should call sns api setFollowees when new followee is the same neuron", async () => {
      vi.spyOn(governanceApi, "querySnsNeuron").mockResolvedValue(
        mockSnsNeuron
      );
      const neuronIdHext = getSnsNeuronIdAsHexString(mockSnsNeuron);
      await addFollowee({
        rootCanisterId,
        neuron: mockSnsNeuron,
        functionId,
        followeeHex: neuronIdHext,
      });

      expect(setFolloweesSpy).toBeCalledWith({
        neuronId: fromNullable(mockSnsNeuron.id),
        identity: mockIdentity,
        rootCanisterId,
        followees: [mockSnsNeuron.id[0] as SnsNeuronId],
        functionId,
      });
      expect(setFolloweesSpy).toBeCalledTimes(1);
    });

    it("should not call sns api setFollowees when new followee does not exist", async () => {
      vi.spyOn(governanceApi, "querySnsNeuron").mockResolvedValue(undefined);
      const neuronIdHext = getSnsNeuronIdAsHexString(mockSnsNeuron);
      await addFollowee({
        rootCanisterId,
        neuron: mockSnsNeuron,
        functionId,
        followeeHex: neuronIdHext,
      });

      expect(setFolloweesSpy).not.toBeCalled();
      expect(toastsError).toBeCalled();
    });
  });

  describe("removeFollowee ", () => {
    let setFolloweesSpy;

    const followee1: SnsNeuronId = {
      id: arrayOfNumberToUint8Array([1, 2, 3]),
    };
    const followee2: SnsNeuronId = {
      id: arrayOfNumberToUint8Array([1, 2, 4]),
    };
    const rootCanisterId = mockPrincipal;
    const functionId = BigInt(3);

    beforeEach(() => {
      vi.clearAllMocks();

      setFolloweesSpy = vi
        .spyOn(governanceApi, "setFollowees")
        .mockImplementation(() => Promise.resolve());
    });

    it("should call sns api setFollowees with followee removed from list", async () => {
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        followees: [[functionId, { followees: [followee1, followee2] }]],
      };
      await services.removeFollowee({
        rootCanisterId,
        neuron,
        functionId,
        followee: followee1,
      });

      expect(setFolloweesSpy).toBeCalledWith({
        neuronId: fromNullable(neuron.id),
        identity: mockIdentity,
        rootCanisterId,
        followees: [followee2],
        functionId,
      });
    });

    it("should call sns api setFollowees with empty list if followee is the last followee", async () => {
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        followees: [[functionId, { followees: [followee1] }]],
      };
      await services.removeFollowee({
        rootCanisterId,
        neuron,
        functionId,
        followee: followee1,
      });

      expect(setFolloweesSpy).toBeCalledWith({
        neuronId: fromNullable(neuron.id),
        identity: mockIdentity,
        rootCanisterId,
        followees: [],
        functionId,
      });
    });

    it("should not call sns api setFollowees when followee is not in the list", async () => {
      vi.spyOn(governanceApi, "querySnsNeuron").mockResolvedValue(
        mockSnsNeuron
      );
      const neuron: SnsNeuron = {
        ...mockSnsNeuron,
        followees: [[functionId, { followees: [followee2] }]],
      };
      await services.removeFollowee({
        rootCanisterId,
        neuron,
        functionId,
        followee: followee1,
      });

      expect(setFolloweesSpy).not.toBeCalled();
      expect(toastsError).toBeCalled();
    });
  });

  describe("stakeMaturity", () => {
    it("should call api.stakeMaturity", async () => {
      const neuronId = mockSnsNeuron.id[0] as SnsNeuronId;
      const identity = mockIdentity;
      const rootCanisterId = mockPrincipal;
      const percentageToStake = 60;

      const spyOnStakeMaturity = vi
        .spyOn(governanceApi, "stakeMaturity")
        .mockImplementation(() => Promise.resolve());

      const { success } = await stakeMaturity({
        neuronId,
        rootCanisterId,
        percentageToStake,
      });

      expect(success).toBeTruthy();

      expect(spyOnStakeMaturity).toBeCalledWith({
        neuronId,
        rootCanisterId,
        percentageToStake,
        identity,
      });
    });
  });

  describe("toggleAutoStakeMaturity", () => {
    const spyOnStakeMaturity = vi
      .spyOn(governanceApi, "autoStakeMaturity")
      .mockImplementation(() => Promise.resolve());

    const testToggle = async ({
      neuron,
      neuronId,
      rootCanisterId,
      identity,
      autoStake,
    }) => {
      const { success } = await toggleAutoStakeMaturity({
        neuron,
        neuronId,
        rootCanisterId,
      });

      expect(success).toBeTruthy();

      expect(spyOnStakeMaturity).toBeCalledWith({
        neuronId,
        rootCanisterId,
        identity,
        autoStake,
      });
    };

    const neuronId = mockSnsNeuron.id[0] as SnsNeuronId;
    const identity = mockIdentity;
    const rootCanisterId = mockPrincipal;

    it("should call api.autoStakeMaturity with true for the first toggle", async () => {
      const neuron = {
        ...mockSnsNeuron,
        auto_stake_maturity: [] as [] | [boolean],
      };

      await testToggle({
        neuronId,
        neuron,
        identity,
        rootCanisterId,
        autoStake: true,
      });
    });

    it("should call api.autoStakeMaturity with false", async () => {
      const neuron = {
        ...mockSnsNeuron,
        auto_stake_maturity: [true] as [] | [boolean],
      };

      await testToggle({
        neuronId,
        neuron,
        identity,
        rootCanisterId,
        autoStake: false,
      });
    });

    it("should call api.autoStakeMaturity with true", async () => {
      const neuron = {
        ...mockSnsNeuron,
        auto_stake_maturity: [false] as [] | [boolean],
      };

      await testToggle({
        neuronId,
        neuron,
        identity,
        rootCanisterId,
        autoStake: true,
      });
    });
  });

  describe("splitNeuron", () => {
    const transactionFee = 100n;
    let snsNeuronsStoreSpy: SpyInstance;
    let snsTokenSymbolSelectedStoreSpy: SpyInstance;

    beforeEach(() => {
      snsNeuronsStoreSpy = vi
        .spyOn(snsNeuronsStore, "subscribe")
        .mockImplementation(
          buildMockSnsNeuronsStoreSubscribe({
            rootCanisterId: mockPrincipal,
            neurons: [mockSnsNeuron],
          })
        );
      snsTokenSymbolSelectedStoreSpy = vi
        .spyOn(snsTokenSymbolSelectedStore, "subscribe")
        .mockImplementation(mockTokenStore);

      transactionsFeesStore.setFee({
        rootCanisterId: mockPrincipal,
        fee: BigInt(transactionFee),
        certified: true,
      });
    });

    afterEach(() => {
      snsNeuronsStoreSpy.mockClear();
      snsTokenSymbolSelectedStoreSpy.mockClear();
      transactionsFeesStore.reset();
    });

    it("should call api.addNeuronPermissions", async () => {
      const spySplitNeuron = vi
        .spyOn(governanceApi, "splitNeuron")
        .mockImplementation(() => Promise.resolve());
      const spyLoadNeurons = vi
        .spyOn(governanceApi, "querySnsNeurons")
        .mockImplementation(() => Promise.resolve([mockNeuron]));
      const amount = 10;

      const neuronMinimumStake = 1000n;
      const { success } = await splitNeuron({
        neuronId: mockSnsNeuron.id[0] as SnsNeuronId,
        rootCanisterId: mockPrincipal,
        amount,
        neuronMinimumStake,
      });
      expect(success).toBeTruthy();
      expect(spyLoadNeurons).toBeCalled();
      expect(spySplitNeuron).toBeCalledWith({
        neuronId: mockSnsNeuron.id[0] as SnsNeuronId,
        identity: mockIdentity,
        rootCanisterId: mockPrincipal,
        amount: BigInt(amount * E8S_PER_ICP) + transactionFee,
        memo: 0n,
      });
    });

    it("should display error if not enough amount", async () => {
      const spySplitNeuron = vi
        .spyOn(governanceApi, "splitNeuron")
        .mockImplementation(() => Promise.resolve())
        .mockReset();
      const amount = 0.00001;
      const neuronMinimumStake = 2000n;
      const { success } = await splitNeuron({
        neuronId: mockSnsNeuron.id[0] as SnsNeuronId,
        rootCanisterId: mockPrincipal,
        amount,
        neuronMinimumStake,
      });

      expect(toastsError).toBeCalled();
      expect(success).toBe(false);
      expect(spySplitNeuron).not.toBeCalled();
    });
  });
});
