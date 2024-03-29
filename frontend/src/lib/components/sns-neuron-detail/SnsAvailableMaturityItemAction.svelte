<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { IconExpandCircleDown } from "@dfinity/gix-components";
  import CommonItemAction from "$lib/components/ui/CommonItemAction.svelte";
  import TooltipIcon from "../ui/TooltipIcon.svelte";
  import type { SnsNeuron } from "@dfinity/sns";
  import {
    formattedMaturity,
    hasPermissionToDisburseMaturity,
    hasPermissionToStakeMaturity,
  } from "$lib/utils/sns-neuron.utils";
  import SnsStakeMaturityButton from "./actions/SnsStakeMaturityButton.svelte";
  import SnsDisburseMaturityButton from "./actions/SnsDisburseMaturityButton.svelte";
  import { authStore } from "$lib/stores/auth.store";
  import type { TokenAmountV2, Token } from "@dfinity/utils";

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
      tooltipId="sns-staked-maturity-tooltip"
    /></svelte:fragment
  >
  {#if allowedToStakeMaturity}
    <SnsStakeMaturityButton {neuron} />
  {/if}

  {#if allowedToDisburseMaturity}
    <SnsDisburseMaturityButton {neuron} {fee} />
  {/if}
</CommonItemAction>
