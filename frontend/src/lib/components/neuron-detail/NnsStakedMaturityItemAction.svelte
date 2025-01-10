<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { formattedStakedMaturity } from "$lib/utils/neuron.utils";
  import CommonItemAction from "$lib/components/ui/CommonItemAction.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { IconStakedMaturity } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";

  export let neuron: NeuronInfo;
</script>

<CommonItemAction testId="nns-staked-maturity-item-action-component">
  <IconStakedMaturity slot="icon" />
  <span slot="title" data-tid="staked-maturity"
    >{formattedStakedMaturity(neuron)}</span
  >
  <svelte:fragment slot="subtitle"
    >{$i18n.neuron_detail.staked_description}
    <TooltipIcon
      text={$i18n.neuron_detail.nns_staked_maturity_tooltip}
      tooltipId="staked-maturity-tooltip"
    /></svelte:fragment
  >
</CommonItemAction>
