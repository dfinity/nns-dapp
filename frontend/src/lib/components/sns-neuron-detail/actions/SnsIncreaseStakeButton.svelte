<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";

  export let variant: "primary" | "secondary" = "primary";
</script>

<button
  class={variant}
  data-tid="sns-increase-stake"
  on:click={() => openSnsNeuronModal({ type: "increase-stake" })}
  >{$i18n.neuron_detail.increase_stake}</button
>
