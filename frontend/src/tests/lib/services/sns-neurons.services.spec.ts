import * as governanceApi from "$lib/api/sns-governance.api";
import * as api from "$lib/api/sns.api";
import { HOTKEY_PERMISSIONS } from "$lib/constants/sns-neurons.constants";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import { loadSnsAccounts } from "$lib/services/sns-accounts.services";
import * as services from "$lib/services/sns-neurons.services";
import {
  disburse,
  disburseMaturity,
  increaseStakeNeuron,
  stakeMaturity,
  startDissolving,
  stopDissolving,
  toggleAutoStakeMaturity,
  updateDelay,
} from "$lib/services/sns-neurons.services";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { toastsError } from "$lib/stores/toasts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { enumValues } from "$lib/utils/enum.utils";
import {
  getSnsNeuronIdAsHexString,
  subaccountToHexString,
} from "$lib/utils/sns-neuron.utils";
import { numberToE8s, numberToUlps } from "$lib/utils/token.utils";
import { bytesToHexString } from "$lib/utils/utils";
import {
  mockIdentity,
  mockPrincipal,
  resetIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import {
  buildMockSnsNeuronsStoreSubscribe,
  createMockSnsNeuron,
  mockSnsNeuron,
} from "$tests/mocks/sns-neurons.mock";
import { mockSnsToken, mockTokenStore } from "$tests/mocks/sns-projects.mock";
import { resetMockedConstants } from "$tests/utils/mockable-constants.test-utils";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { decodeIcrcAccount } from "@dfinity/ledger-icrc";
import { NeuronState } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import {
  SnsNeuronPermissionType,
  neuronSubaccount,
  type SnsNeuron,
  type SnsNeuronId,
} from "@dfinity/sns";
import {
  arrayOfNumberToUint8Array,
  fromDefinedNullable,
  fromNullable,
} from "@dfinity/utils";
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
  loadSnsNeurons,
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
  const allPermissions = Int32Array.from(enumValues(SnsNeuronPermissionType));
  const subaccount = neuronSubaccount({
    controller: mockIdentity.getPrincipal(),
    index: 0,
  });
  const neuronId: SnsNeuronId = { id: subaccount };
  const neuron: SnsNeuron = {
    ...mockSnsNeuron,
    id: [neuronId] as [SnsNeuronId],
    permissions: [
      {
        principal: [mockIdentity.getPrincipal()],
        permission_type: allPermissions,
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    resetIdentity();
    resetMockedConstants();
    resetSnsProjects();
  });

  describe("syncSnsNeurons", () => {
    beforeEach(() => {
      snsNeuronsStore.reset();

      setSnsProjects([
        {
          rootCanisterId: mockPrincipal,
        },
      ]);
    });

    it("should call api.querySnsNeurons and load neurons in store", async () => {
      const spyQuery = vi
        .spyOn(governanceApi, "querySnsNeurons")
        .mockImplementation(() => Promise.resolve([neuron]));

      await syncSnsNeurons(mockPrincipal);

      await tick();
      const store = get(snsNeuronsStore);
      expect(store[mockPrincipal.toText()]?.neurons).toHaveLength(1);
      expect(spyQuery).toBeCalled();
    });

    it("should empty store if update call fails", async () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);

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

    it("should not empty store if query call fails but update call succeeds", async () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);

      snsNeuronsStore.setNeurons({
        rootCanisterId: mockPrincipal,
        neurons: [mockSnsNeuron],
        certified: true,
      });
      const spyQuery = vi
        .spyOn(governanceApi, "querySnsNeurons")
        .mockImplementation(async ({ certified }) => {
          if (!certified) {
            throw new Error();
          }
          return [neuron];
        });

      await syncSnsNeurons(mockPrincipal);

      await tick();
      const store = get(snsNeuronsStore);
      expect(store[mockPrincipal.toText()]).not.toBeUndefined();
      expect(spyQuery).toBeCalled();
    });
  });

  describe("loadSnsNeurons", () => {
    beforeEach(() => {
      snsNeuronsStore.reset();
      vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("should call api.querySnsNeurons and load neurons in store", async () => {
      const spyQuery = vi
        .spyOn(governanceApi, "querySnsNeurons")
        .mockImplementation(() => Promise.resolve([neuron]));
      await loadSnsNeurons({ rootCanisterId: mockPrincipal, certified: true });

      await tick();
      const store = get(snsNeuronsStore);
      expect(store[mockPrincipal.toText()]?.neurons).toHaveLength(1);
      expect(spyQuery).toBeCalled();
    });
  });

  describe("getSnsNeuron", () => {
    beforeEach(() => {
      snsNeuronsStore.reset();
      vi.spyOn(console, "error").mockImplementation(() => undefined);
    });
    it("should call api.querySnsNeuron and call load neuron when neuron not in store", () =>
      new Promise<void>((done) => {
        const subaccount = neuronSubaccount({
          controller: mockIdentity.getPrincipal(),
          index: 0,
        });
        const neuronId: SnsNeuronId = { id: subaccount };
        const neuron = {
          ...mockSnsNeuron,
          id: [neuronId] as [SnsNeuronId],
        };
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
    let spyOnIncreaseDissolveDelay;
    const nowInSeconds = 10;
    const now = nowInSeconds * 1000;
    beforeEach(() => {
      spyOnIncreaseDissolveDelay = vi
        .spyOn(governanceApi, "increaseDissolveDelay")
        .mockImplementation(() => Promise.resolve());
      vi.useFakeTimers().setSystemTime(now);
      spyOnIncreaseDissolveDelay.mockClear();
    });

    it("should call sns api setDissolveDelay with additional dissolve delay in seconds", async () => {
      const mockNeuronWithWhenDissolvedTS = createMockSnsNeuron({
        state: NeuronState.Dissolving,
        whenDissolvedTimestampSeconds: BigInt(100),
      });

      const neuronId = fromDefinedNullable(mockNeuronWithWhenDissolvedTS.id);
      const identity = mockIdentity;
      const rootCanisterId = mockPrincipal;
      const delayInSeconds = 150;
      const { success } = await updateDelay({
        rootCanisterId,
        dissolveDelaySeconds: delayInSeconds,
        neuron: mockNeuronWithWhenDissolvedTS,
      });

      expect(success).toBeTruthy();

      expect(spyOnIncreaseDissolveDelay).toBeCalledWith({
        neuronId,
        identity,
        rootCanisterId,
        additionalDissolveDelaySeconds: 60,
      });
    });
  });

  describe("stakeNeuron", () => {
    beforeEach(() => {
      tokensStore.reset();
    });

    it("should call sns api stakeNeuron, query neurons again and load sns accounts", async () => {
      setSnsProjects([
        {
          rootCanisterId: mockPrincipal,
          tokenMetadata: { ...mockSnsToken, fee: 100n },
          neuronMinimumStakeE8s: 100_000_000n,
        },
      ]);
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
      tokensStore.reset();
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

    it("should call sns api stakeNeuron if fee is 0", async () => {
      setSnsProjects([
        {
          rootCanisterId: mockPrincipal,
          tokenMetadata: { ...mockSnsToken, fee: 0n },
          neuronMinimumStakeE8s: 100_000_000n,
        },
      ]);
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

    it("should fail if staked amount is too low", async () => {
      setSnsProjects([
        {
          rootCanisterId: mockPrincipal,
          tokenMetadata: { ...mockSnsToken, fee: 100n },
          neuronMinimumStakeE8s: 200_000_001n,
        },
      ]);
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

      expect(success).toBe(false);
      expect(spyStake).not.toBeCalled();
      expect(spyQuery).not.toBeCalled();
      expect(loadSnsAccounts).not.toBeCalled();

      expect(toastsError).toBeCalledWith({
        err: new Error(
          "The caller should make sure the amount is at least the minimum stake"
        ),
        labelKey: "error__sns.sns_stake",
        renderAsHtml: false,
      });
      expect(toastsError).toBeCalledTimes(1);
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

  describe("disburseMaturity", () => {
    const rootCanisterId = mockPrincipal;
    const neuronId = mockSnsNeuron.id[0] as SnsNeuronId;
    const identity = mockIdentity;
    const percentageToDisburse = 75;
    const ownerText =
      "k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae";
    const owner = Principal.fromText(ownerText);
    const subaccount = new Uint8Array(32).fill(0);
    subaccount[31] = 1;
    let spyOnDisburseMaturity: SpyInstance;

    beforeEach(() => {
      spyOnDisburseMaturity = vi
        .spyOn(governanceApi, "disburseMaturity")
        .mockImplementation(() => Promise.resolve());
    });

    it("should call api.disburseMaturity with account destinatoin", async () => {
      expect(spyOnDisburseMaturity).not.toBeCalled();
      const { success } = await disburseMaturity({
        neuronId,
        rootCanisterId,
        percentageToDisburse,
      });

      expect(success).toBeTruthy();

      expect(spyOnDisburseMaturity).toBeCalledWith({
        neuronId,
        rootCanisterId,
        percentageToDisburse,
        identity,
      });
    });

    it("should decode the destination address to an ICRC account", async () => {
      const checksum = "6cc627i";
      const destinationAddress = `${ownerText}-${checksum}.1`;
      expect(spyOnDisburseMaturity).not.toBeCalled();
      await disburseMaturity({
        rootCanisterId,
        neuronId: mockSnsNeuron.id[0],
        percentageToDisburse: 33,
        toAccountAddress: destinationAddress,
      });

      expect(spyOnDisburseMaturity).toBeCalledTimes(1);
      expect(spyOnDisburseMaturity).toBeCalledWith({
        identity,
        rootCanisterId,
        neuronId: mockSnsNeuron.id[0],
        percentageToDisburse: 33,
        toAccount: {
          owner,
          subaccount,
        },
      });
    });

    it("should not call api and show toast error if address can't be decoded", async () => {
      const wrongChecksum = "wrong";
      const destinationAddress = `${ownerText}-${wrongChecksum}.1`;
      expect(spyOnDisburseMaturity).not.toBeCalled();
      await disburseMaturity({
        rootCanisterId,
        neuronId: mockSnsNeuron.id[0],
        percentageToDisburse: 33,
        toAccountAddress: destinationAddress,
      });

      expect(spyOnDisburseMaturity).not.toBeCalled();
      expect(toastsError).toBeCalledWith({
        err: new Error("Invalid account. Invalid checksum."),
        labelKey: "error__sns.sns_disburse_maturity",
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
    const functionId = 3n;

    beforeEach(() => {
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
        followees: [[4n, { followees: [followee1] }]],
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
    const functionId = 3n;

    beforeEach(() => {
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
    let spyOnStakeMaturity;

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

    beforeEach(() => {
      spyOnStakeMaturity = vi
        .spyOn(governanceApi, "autoStakeMaturity")
        .mockImplementation(() => Promise.resolve());
    });

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

      tokensStore.reset();
      setSnsProjects([
        {
          rootCanisterId: mockPrincipal,
          tokenMetadata: { ...mockSnsToken, fee: transactionFee },
        },
      ]);
    });

    afterEach(() => {
      snsNeuronsStoreSpy.mockClear();
      snsTokenSymbolSelectedStoreSpy.mockClear();
    });

    it("should call api.addNeuronPermissions", async () => {
      const spySplitNeuron = vi
        .spyOn(governanceApi, "splitNeuron")
        .mockImplementation(() => Promise.resolve());
      const spyQuery = vi
        .spyOn(governanceApi, "querySnsNeurons")
        .mockImplementation(() => Promise.resolve([mockSnsNeuron]));

      const amount = 10;

      const neuronMinimumStake = 1_000n;
      const { success } = await splitNeuron({
        neuronId: mockSnsNeuron.id[0] as SnsNeuronId,
        rootCanisterId: mockPrincipal,
        amount,
        neuronMinimumStake,
      });
      expect(success).toBeTruthy();
      expect(spyQuery).toBeCalled();
      expect(spySplitNeuron).toBeCalledWith({
        neuronId: mockSnsNeuron.id[0] as SnsNeuronId,
        identity: mockIdentity,
        rootCanisterId: mockPrincipal,
        amount: numberToUlps({ amount, token: mockSnsToken }) + transactionFee,
        memo: 0n,
      });
    });

    it("should display error if not enough amount", async () => {
      const spySplitNeuron = vi
        .spyOn(governanceApi, "splitNeuron")
        .mockImplementation(() => Promise.resolve())
        .mockReset();
      const amount = 0.00001;
      const neuronMinimumStake = 2_000n;
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
