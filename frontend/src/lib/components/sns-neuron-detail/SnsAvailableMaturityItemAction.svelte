<script lang="ts">
  import SnsDisburseMaturityButton from "$lib/components/sns-neuron-detail/actions/SnsDisburseMaturityButton.svelte";
  import SnsStakeMaturityButton from "$lib/components/sns-neuron-detail/actions/SnsStakeMaturityButton.svelte";
  import CommonItemAction from "$lib/components/ui/CommonItemAction.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    formattedMaturity,
    hasPermissionToDisburseMaturity,
    hasPermissionToStakeMaturity,
  } from "$lib/utils/sns-neuron.utils";
  import { IconExpandCircleDown } from "@dfinity/gix-components";
  import type { SnsNeuron } from "@dfinity/sns";
  import type { Token, TokenAmountV2 } from "@dfinity/utils";

  export let neuron: SnsNeuron;
  export let fee: TokenAmountV2;
  export let token: Token;

  let allowedToStakeMaturity: boolean;
  $: allowedToStakeMaturity = hasPermissionToStakeMaturity({
    neuron,
    identity: $authStore.identity,
  });
  let allowedToDisburseMaturity: boolean;
  $: allowedToDisburseMaturity = hasPermissionToDisburseMaturity({
    neuron,
    identity: $authStore.identity,
  });
</script>

<CommonItemAction testId="sns-available-maturity-item-action-component">
  <IconExpandCircleDown slot="icon" />
  <span slot="title" data-tid="available-maturity"
    >{formattedMaturity(neuron)}</span
  >
  <svelte:fragment slot="subtitle"
    >{$i18n.neuron_detail.available_description}
    <TooltipIcon
      text={replacePlaceholders(
        $i18n.neuron_detail.sns_available_maturity_tooltip,
        {
          $token: token.symbol,
        }
      )}
      tooltipId="sns-available-maturity-tooltip"
    /></svelte:fragment
  >
  {#if allowedToStakeMaturity}
    <SnsStakeMaturityButton {neuron} />
  {/if}

  {#if allowedToDisburseMaturity}
    <SnsDisburseMaturityButton {neuron} {fee} />
  {/if}
</CommonItemAction>
