<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { getContext } from "svelte";

  const context: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );
  const { store }: NnsNeuronContext = context;
</script>

<button
  class="primary"
  on:click={() =>
    store.update((data) => ({ ...data, modal: "increase-dissolve-delay" }))}
  >{$i18n.neuron_detail.increase_dissolve_delay}</button
>
