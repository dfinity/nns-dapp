<script lang="ts">
  import CommonItemAction from "$lib/components/ui/CommonItemAction.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { formattedStakedMaturity } from "$lib/utils/sns-neuron.utils";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { IconStakedMaturity } from "@dfinity/gix-components";
  import type { SnsNeuron } from "@dfinity/sns";

  export let neuron: SnsNeuron;
</script>

<CommonItemAction testId="sns-staked-maturity-item-action-component">
  <IconStakedMaturity slot="icon" />
  <span slot="title" data-tid="staked-maturity"
    >{formattedStakedMaturity(neuron)}</span
  >
  <svelte:fragment slot="subtitle"
    >{$i18n.neuron_detail.staked_description}
    <TooltipIcon
      text={$i18n.neuron_detail.sns_staked_maturity_tooltip}
      tooltipId="sns-staked-maturity-tooltip"
    /></svelte:fragment
  >
</CommonItemAction>
