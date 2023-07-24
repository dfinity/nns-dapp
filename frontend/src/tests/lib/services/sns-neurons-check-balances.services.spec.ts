import * as governanceApi from "$lib/api/sns-governance.api";
import {
  checkSnsNeuronBalances,
  neuronNeedsRefresh,
} from "$lib/services/sns-neurons-check-balances.services";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { mockIdentity, mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { neuronSubaccount, type SnsNeuronId } from "@dfinity/sns";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("sns-neurons-check-balances-services", () => {
  describe("checkSnsNeuronBalances", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      snsNeuronsStore.reset();
      vi.spyOn(console, "error").mockReturnValue();
    });

    it("should check balance and not refresh when balance matches stake", async () => {
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
        .spyOn(governanceApi, "getSnsNeuron")
        .mockImplementation(() => Promise.resolve(neuron));
      const spyNeuronBalance = vi
        .spyOn(governanceApi, "getNeuronBalance")
        .mockImplementationOnce(() =>
          Promise.resolve(mockSnsNeuron.cached_neuron_stake_e8s)
        )
        .mockImplementation(() => Promise.resolve(BigInt(0)));
      await checkSnsNeuronBalances({
        rootCanisterId: mockPrincipal,
        neurons: [neuron],
        neuronMinimumStake: 100000000n,
      });

      await waitFor(() => expect(spyNeuronBalance).toBeCalled());
      expect(spyQuery).not.toBeCalled();
    });

    it("should check balance and refresh when balance does not match stake and load the updated neuron in the store", async () => {
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
      const spyNeuronQuery = vi
        .spyOn(governanceApi, "getSnsNeuron")
        .mockImplementation(() => Promise.resolve(updatedNeuron));
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
      await checkSnsNeuronBalances({
        rootCanisterId: mockPrincipal,
        neurons: [neuron],
        neuronMinimumStake: 100000000n,
      });

      await waitFor(() => expect(spyRefreshNeuron).toBeCalled());
      expect(spyNeuronQuery).toBeCalled();
      expect(spyNeuronBalance).toBeCalled();

      const store = get(snsNeuronsStore);
      expect(store[mockPrincipal.toText()].neurons).toEqual([updatedNeuron]);
    });

    it("should check balance and refresh when balance is 0 and does not match stake and load the updated neuron in the store", async () => {
      const subaccount: Uint8Array = neuronSubaccount({
        controller: mockIdentity.getPrincipal(),
        index: 0,
      });
      const neuronId: SnsNeuronId = { id: subaccount };
      const neuron = {
        ...mockSnsNeuron,
        id: [neuronId] as [SnsNeuronId],
      };
      const updatedNeuron = {
        ...neuron,
        cached_neuron_stake_e8s: BigInt(0),
      };
      const spyNeuronQuery = vi
        .spyOn(governanceApi, "getSnsNeuron")
        .mockImplementation(() => Promise.resolve(updatedNeuron));
      const spyNeuronBalance = vi
        .spyOn(governanceApi, "getNeuronBalance")
        .mockImplementation(() => Promise.resolve(BigInt(0)));
      const spyRefreshNeuron = vi
        .spyOn(governanceApi, "refreshNeuron")
        .mockImplementation(() => Promise.resolve(undefined));
      await checkSnsNeuronBalances({
        rootCanisterId: mockPrincipal,
        neurons: [neuron],
        neuronMinimumStake: 100000000n,
      });

      await waitFor(() => expect(spyRefreshNeuron).toBeCalled());
      expect(spyNeuronQuery).toBeCalled();
      expect(spyNeuronBalance).toBeCalled();

      const store = get(snsNeuronsStore);
      expect(store[mockPrincipal.toText()].neurons).toEqual([updatedNeuron]);
    });
  });

  describe("neuronNeedsRefresh", () => {
    it("should query the balance and return true when balance does not match stake", async () => {
      const spyNeuronBalance = vi
        .spyOn(governanceApi, "getNeuronBalance")
        .mockImplementation(() =>
          Promise.resolve(
            mockSnsNeuron.cached_neuron_stake_e8s + BigInt(10_000)
          )
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
});
