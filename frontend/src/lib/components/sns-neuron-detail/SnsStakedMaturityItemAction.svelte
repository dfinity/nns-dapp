<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconStakedMaturity } from "@dfinity/gix-components";
  import CommonItemAction from "$lib/components/ui/CommonItemAction.svelte";
  import type { SnsNeuron } from "@dfinity/sns";
  import { formattedStakedMaturity } from "$lib/utils/sns-neuron.utils";

  export let neuron: SnsNeuron;
</script>

<CommonItemAction testId="sns-staked-maturity-item-action-component">
  <IconStakedMaturity slot="icon" />
  <span slot="title" data-tid="staked-maturity"
    >{formattedStakedMaturity(neuron)}</span
  >
  <svelte:fragment slot="subtitle"
    >{$i18n.neuron_detail.staked_description}</svelte:fragment
  >
</CommonItemAction>
