<script lang="ts">
  import SnsNeuronModals from "$lib/modals/sns/neurons/SnsNeuronModals.svelte";
  import type {
    SelectedSnsNeuronContext,
    SelectedSnsNeuronStore,
  } from "$lib/types/sns-neuron-detail.context";
  import { SELECTED_SNS_NEURON_CONTEXT_KEY } from "$lib/types/sns-neuron-detail.context";
  import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNeuron } from "@dfinity/sns";
  import { type Component, setContext } from "svelte";
  import { writable } from "svelte/store";

  export let neuron: SnsNeuron | undefined;
  export let rootCanisterId: Principal | null;
  export let testComponent: Component;
  export let passPropNeuron = false;

  export const neuronStore = writable<SelectedSnsNeuronStore>({
    selected: {
      neuronIdHex: getSnsNeuronIdAsHexString(neuron),
      rootCanisterId,
    },
    modal: undefined,
    neuron,
  });

  setContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY, {
    store: neuronStore,
    reload: async () => {
      // Do nothing
    },
  });
</script>

<!-- We do this to avoid getting an "unknown prop passed" warning -->
{#if passPropNeuron}
  <svelte:component this={testComponent} {neuron} />
{:else}
  <svelte:component this={testComponent} />
{/if}

<SnsNeuronModals />
