<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { createEventDispatcher } from 'svelte';

  export let variant: "primary" | "secondary" = "primary";

  const dispatch = createEventDispatcher();
</script>

<button
  class={variant}
  data-tid="increase-stake-button-component"
  on:click={() => dispatch("increaseStake")}
  >{$i18n.neuron_detail.increase_stake}</button
>
