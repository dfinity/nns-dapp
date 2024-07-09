import * as governanceApi from "$lib/api/sns-governance.api";
import {
  checkSnsNeuronBalances,
  neuronNeedsRefresh,
  refreshNeuronIfNeeded,
} from "$lib/services/sns-neurons-check-balances.services";
import { checkedNeuronSubaccountsStore } from "$lib/stores/checked-neurons.store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { enumValues } from "$lib/utils/enum.utils";
import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
import {
  mockIdentity,
  mockPrincipal,
  resetIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import {
  SnsNeuronPermissionType,
  neuronSubaccount,
  type SnsNeuron,
  type SnsNeuronId,
} from "@dfinity/sns";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("sns-neurons-check-balances-services", () => {
  const allPermissions = Int32Array.from(enumValues(SnsNeuronPermissionType));
  const subaccount = neuronSubaccount({
    controller: mockIdentity.getPrincipal(),
    index: 0,
  });
  const neuronId: SnsNeuronId = { id: subaccount };
  const userNeuron: SnsNeuron = {
    ...mockSnsNeuron,
    permissions: [
      {
        principal: [mockIdentity.getPrincipal()],
        permission_type: allPermissions,
      },
    ],
    id: [neuronId] as [SnsNeuronId],
  };
  const subaccountTransferredNeuron = neuronSubaccount({
    controller: mockIdentity.getPrincipal(),
    index: 1,
  });
  const transferredNeuronId: SnsNeuronId = {
    id: subaccountTransferredNeuron,
  };
  const transferredNeuron: SnsNeuron = {
    ...mockSnsNeuron,
    permissions: [
      {
        principal: [principal(0)],
        permission_type: allPermissions,
      },
    ],
    id: [transferredNeuronId] as [SnsNeuronId],
  };

  beforeEach(() => {
    resetIdentity();
    checkedNeuronSubaccountsStore.reset();
  });

  describe("checkSnsNeuronBalances", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      snsNeuronsStore.reset();
      vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("should check balance and not refresh when balance matches stake", async () => {
      const spyQuery = vi
        .spyOn(governanceApi, "getSnsNeuron")
        .mockResolvedValue(userNeuron);
      const spyNeuronBalance = vi
        .spyOn(governanceApi, "getNeuronBalance")
        .mockImplementationOnce(() =>
          Promise.resolve(userNeuron.cached_neuron_stake_e8s)
        )
        .mockImplementation(() => Promise.resolve(0n));
      await checkSnsNeuronBalances({
        rootCanisterId: mockPrincipal,
        neurons: [userNeuron],
        neuronMinimumStake: 100_000_000n,
      });

      await waitFor(() => expect(spyNeuronBalance).toBeCalled());
      expect(spyQuery).not.toBeCalled();
    });

    it("should check balance and refresh when balance does not match stake and load the updated neuron in the store", async () => {
      const stake = userNeuron.cached_neuron_stake_e8s + 10_000n;
      const updatedNeuron = {
        ...userNeuron,
        cached_neuron_stake_e8s: stake,
      };
      const spyNeuronQuery = vi
        .spyOn(governanceApi, "getSnsNeuron")
        .mockResolvedValue(updatedNeuron);
      const spyNeuronBalance = vi
        .spyOn(governanceApi, "getNeuronBalance")
        .mockResolvedValueOnce(stake)
        .mockResolvedValue(0n);
      const spyRefreshNeuron = vi
        .spyOn(governanceApi, "refreshNeuron")
        .mockResolvedValue(undefined);

      expect(spyRefreshNeuron).not.toBeCalled();
      expect(spyNeuronQuery).not.toBeCalled();
      expect(spyNeuronBalance).not.toBeCalled();

      await checkSnsNeuronBalances({
        rootCanisterId: mockPrincipal,
        neurons: [userNeuron],
        neuronMinimumStake: 100_000_000n,
      });

      await waitFor(() => expect(spyRefreshNeuron).toBeCalled());
      expect(spyNeuronQuery).toBeCalled();
      expect(spyNeuronBalance).toBeCalled();

      const store = get(snsNeuronsStore);
      expect(store[mockPrincipal.toText()].neurons).toEqual([updatedNeuron]);
    });

    it("should check balance and refresh when balance is 0 and does not match stake and load the updated neuron in the store", async () => {
      const updatedNeuron = {
        ...userNeuron,
        cached_neuron_stake_e8s: 0n,
      };
      const spyNeuronQuery = vi
        .spyOn(governanceApi, "getSnsNeuron")
        .mockResolvedValue(updatedNeuron);
      const spyNeuronBalance = vi
        .spyOn(governanceApi, "getNeuronBalance")
        .mockResolvedValue(0n);
      const spyRefreshNeuron = vi
        .spyOn(governanceApi, "refreshNeuron")
        .mockResolvedValue(undefined);

      expect(spyRefreshNeuron).not.toBeCalled();
      expect(spyNeuronQuery).not.toBeCalled();
      expect(spyNeuronBalance).not.toBeCalled();

      await checkSnsNeuronBalances({
        rootCanisterId: mockPrincipal,
        neurons: [userNeuron],
        neuronMinimumStake: 100_000_000n,
      });

      await waitFor(() => expect(spyRefreshNeuron).toBeCalled());
      expect(spyNeuronQuery).toBeCalled();
      expect(spyNeuronBalance).toBeCalled();

      const store = get(snsNeuronsStore);
      expect(store[mockPrincipal.toText()].neurons).toEqual([updatedNeuron]);
    });

    it("should not refresh nor load neurons where the user is not the controller anymore", async () => {
      const cachedStakeMapper = {
        [subaccountToHexString(subaccountTransferredNeuron)]:
          transferredNeuron.cached_neuron_stake_e8s,
        [subaccountToHexString(subaccount)]: userNeuron.cached_neuron_stake_e8s,
      };
      // Only the transferred neuron will be fetched because the other is passed as a parameter.
      const spyNeuronQuery = vi
        .spyOn(governanceApi, "querySnsNeuron")
        .mockResolvedValue(transferredNeuron);
      const spyNeuronBalance = vi
        .spyOn(governanceApi, "getNeuronBalance")
        .mockImplementation(async ({ neuronId }) => {
          return cachedStakeMapper[subaccountToHexString(neuronId.id)] ?? 0n;
        });
      const spyRefreshNeuron = vi
        .spyOn(governanceApi, "refreshNeuron")
        .mockResolvedValue(undefined);

      expect(spyRefreshNeuron).not.toBeCalled();
      expect(spyNeuronQuery).not.toBeCalled();
      expect(spyNeuronBalance).not.toBeCalled();

      await checkSnsNeuronBalances({
        rootCanisterId: mockPrincipal,
        neurons: [userNeuron],
        neuronMinimumStake: 100_000_000n,
      });

      expect(spyRefreshNeuron).not.toBeCalled();
      // One for the subaccount with balance found.
      expect(spyNeuronQuery).toBeCalledTimes(1);
      // Three times: one for each subaccount with balance and one more to check that there are no more neurons with balance.
      expect(spyNeuronBalance).toBeCalledTimes(3);
      // No new neurons will be loaded because the user is not the controller anymore.
      expect(get(snsNeuronsStore)[mockPrincipal.toText()]).toBeUndefined();
    });

    it("should claim a neuron where the user is the controller after finding a neuron that is not the controller of", async () => {
      const unclaimedNeuronBalance = 500_000_000n;
      const subaccountUnclaimedNeuron = neuronSubaccount({
        controller: mockIdentity.getPrincipal(),
        index: 2,
      });
      const unclaimedNeuronId: SnsNeuronId = {
        id: subaccountUnclaimedNeuron,
      };
      const unclaimedNeuron: SnsNeuron = {
        ...userNeuron,
        id: [unclaimedNeuronId] as [SnsNeuronId],
        cached_neuron_stake_e8s: unclaimedNeuronBalance,
      };
      const cachedStakeMapper = {
        [subaccountToHexString(subaccountTransferredNeuron)]:
          transferredNeuron.cached_neuron_stake_e8s,
        [subaccountToHexString(subaccount)]: userNeuron.cached_neuron_stake_e8s,
        [subaccountToHexString(subaccountUnclaimedNeuron)]:
          unclaimedNeuron.cached_neuron_stake_e8s,
      };
      const queryNeuronMapper = {
        [subaccountToHexString(subaccountTransferredNeuron)]: transferredNeuron,
      };
      // Only the transferred neuron will be fetched because the other is passed as a parameter.
      const spyNeuronQuery = vi
        .spyOn(governanceApi, "querySnsNeuron")
        .mockImplementation(
          async ({ neuronId }) =>
            queryNeuronMapper[subaccountToHexString(neuronId.id)] ?? undefined
        );
      const spyNeuronGetter = vi
        .spyOn(governanceApi, "getSnsNeuron")
        .mockResolvedValue(unclaimedNeuron);
      const spyNeuronBalance = vi
        .spyOn(governanceApi, "getNeuronBalance")
        .mockImplementation(async ({ neuronId }) => {
          return cachedStakeMapper[subaccountToHexString(neuronId.id)] ?? 0n;
        });
      const spyClaimNeuron = vi
        .spyOn(governanceApi, "claimNeuron")
        .mockResolvedValue(unclaimedNeuronId);

      expect(spyClaimNeuron).not.toBeCalled();
      expect(spyNeuronGetter).not.toBeCalled();
      expect(spyNeuronQuery).not.toBeCalled();
      expect(spyNeuronBalance).not.toBeCalled();
      await checkSnsNeuronBalances({
        rootCanisterId: mockPrincipal,
        neurons: [userNeuron],
        neuronMinimumStake: 100_000_000n,
      });

      expect(spyClaimNeuron).toBeCalledTimes(1);
      // One for each subaccount with balance found and the neuron was not present in the parameters.
      expect(spyNeuronQuery).toBeCalledTimes(2);
      expect(spyNeuronGetter).toBeCalledTimes(1);
      // Four times: one for each subaccount with balance and one more to check that there are no more neurons with balance.
      expect(spyNeuronBalance).toBeCalledTimes(4);
      // The unclaimed neurons will be loaded.
      expect(get(snsNeuronsStore)[mockPrincipal.toText()]?.neurons).toEqual([
        unclaimedNeuron,
      ]);
    });

    it("should refresh neurons not created in NNS Dapp and load them in store", async () => {
      const nonNnsDappSubaccount = neuronSubaccount({
        controller: principal(0),
        index: 0,
      });
      const neuronId: SnsNeuronId = { id: nonNnsDappSubaccount };
      const nonNnsDappNeuron: SnsNeuron = {
        ...userNeuron,
        id: [neuronId] as [SnsNeuronId],
      };
      const stake = nonNnsDappNeuron.cached_neuron_stake_e8s + 200_000_000n;
      const updatedNeuron = {
        ...nonNnsDappNeuron,
        cached_neuron_stake_e8s: stake,
      };
      const cachedStakeMapper = {
        [subaccountToHexString(nonNnsDappSubaccount)]: stake,
        [subaccountToHexString(subaccount)]: userNeuron.cached_neuron_stake_e8s,
      };
      const spyNeuronQuery = vi
        .spyOn(governanceApi, "getSnsNeuron")
        .mockResolvedValue(updatedNeuron);
      const spyNeuronBalance = vi
        .spyOn(governanceApi, "getNeuronBalance")
        .mockImplementation(
          async ({ neuronId }) =>
            cachedStakeMapper[subaccountToHexString(neuronId.id)] ?? 0n
        );
      const spyRefreshNeuron = vi
        .spyOn(governanceApi, "refreshNeuron")
        .mockResolvedValue(undefined);

      expect(spyRefreshNeuron).not.toBeCalled();
      expect(spyNeuronQuery).not.toBeCalled();
      expect(spyNeuronBalance).not.toBeCalled();
      await checkSnsNeuronBalances({
        rootCanisterId: mockPrincipal,
        neurons: [userNeuron, nonNnsDappNeuron],
        neuronMinimumStake: 100_000_000n,
      });

      expect(spyRefreshNeuron).toBeCalledTimes(1);
      expect(spyNeuronQuery).toBeCalledTimes(1);
      expect(spyNeuronBalance).toBeCalledTimes(3);

      const store = get(snsNeuronsStore);
      expect(store[mockPrincipal.toText()].neurons).toEqual([updatedNeuron]);
    });
  });

  describe("neuronNeedsRefresh", () => {
    it("should query the balance and return true when balance does not match stake", async () => {
      const spyNeuronBalance = vi
        .spyOn(governanceApi, "getNeuronBalance")
        .mockImplementation(() =>
          Promise.resolve(mockSnsNeuron.cached_neuron_stake_e8s + 10_000n)
        );
      const res = await neuronNeedsRefresh({
        rootCanisterId: mockPrincipal,
        neuron: mockSnsNeuron,
        identity: mockIdentity,
      });
      await waitFor(() => expect(spyNeuronBalance).toBeCalled());
      expect(res).toBe(true);
    });

    it("should query the balance and return false when balance matches stake", async () => {
      const spyNeuronBalance = vi
        .spyOn(governanceApi, "getNeuronBalance")
        .mockImplementation(() =>
          Promise.resolve(mockSnsNeuron.cached_neuron_stake_e8s)
        );
      const res = await neuronNeedsRefresh({
        rootCanisterId: mockPrincipal,
        neuron: mockSnsNeuron,
        identity: mockIdentity,
      });
      await waitFor(() => expect(spyNeuronBalance).toBeCalled());
      expect(res).toBe(false);
    });
  });

  describe("refreshNeuronIfNeeded", () => {
    let spyNeuronBalance;
    let spyRefreshNeuron;

    beforeEach(() => {
      spyRefreshNeuron = vi
        .spyOn(governanceApi, "refreshNeuron")
        .mockResolvedValue(undefined);
    });

    it("should not refresh neuron when balance matches stake", async () => {
      spyNeuronBalance = vi
        .spyOn(governanceApi, "getNeuronBalance")
        .mockImplementation(() =>
          Promise.resolve(userNeuron.cached_neuron_stake_e8s)
        );
      expect(
        await refreshNeuronIfNeeded({
          rootCanisterId: mockPrincipal,
          neuron: userNeuron,
        })
      ).toBe(false);

      expect(spyNeuronBalance).toBeCalledTimes(1);
      expect(spyNeuronBalance).toBeCalledWith({
        rootCanisterId: mockPrincipal,
        neuronId: neuronId,
        certified: false,
        identity: mockIdentity,
      });
      expect(spyRefreshNeuron).not.toBeCalled();
    });

    it("should refresh neuron when balance does not match stake", async () => {
      const rootCanisterId = mockPrincipal;
      spyNeuronBalance = vi
        .spyOn(governanceApi, "getNeuronBalance")
        .mockImplementation(() =>
          Promise.resolve(userNeuron.cached_neuron_stake_e8s + 100_000_000n)
        );
      expect(
        await refreshNeuronIfNeeded({
          rootCanisterId,
          neuron: userNeuron,
        })
      ).toBe(true);

      expect(spyNeuronBalance).toBeCalledTimes(1);
      expect(spyNeuronBalance).toBeCalledWith({
        rootCanisterId,
        neuronId: neuronId,
        certified: false,
        identity: mockIdentity,
      });
      expect(spyRefreshNeuron).toBeCalledTimes(1);
      expect(spyRefreshNeuron).toBeCalledWith({
        rootCanisterId,
        neuronId,
        identity: mockIdentity,
      });
    });

    it("should check neuron only once", async () => {
      spyNeuronBalance = vi
        .spyOn(governanceApi, "getNeuronBalance")
        .mockImplementation(() =>
          Promise.resolve(userNeuron.cached_neuron_stake_e8s)
        );
      expect(
        await refreshNeuronIfNeeded({
          rootCanisterId: mockPrincipal,
          neuron: userNeuron,
        })
      ).toBe(false);
      expect(
        await refreshNeuronIfNeeded({
          rootCanisterId: mockPrincipal,
          neuron: userNeuron,
        })
      ).toBe(false);
      expect(
        await refreshNeuronIfNeeded({
          rootCanisterId: mockPrincipal,
          neuron: userNeuron,
        })
      ).toBe(false);

      expect(spyNeuronBalance).toBeCalledTimes(1);
      expect(spyRefreshNeuron).not.toBeCalled();
    });
  });
});
