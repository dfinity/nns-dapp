<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { getContext } from "svelte";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";

  export let variant: "primary" | "secondary" = "primary";

  const { store }: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );
</script>

<button
  class={variant}
  data-tid="nns-increase-stake-button-component"
  on:click={() =>
    openNnsNeuronModal({
      type: "increase-stake",
      data: { neuron: $store.neuron },
    })}>{$i18n.neuron_detail.increase_stake}</button
>
