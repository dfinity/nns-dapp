<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Tooltip } from "@dfinity/gix-components";
  import { isNullish } from "@dfinity/utils";

  type Props = {
    disabledText?: string | undefined;
    onclick?: (event: MouseEvent) => void;
  };

  const { disabledText = undefined, onclick }: Props = $props();
</script>

{#if isNullish(disabledText)}
  <button class="secondary" {onclick} data-tid="stake-maturity-button"
    >{$i18n.neuron_detail.stake_maturity}</button
  >
{:else}
  <Tooltip id="stake-maturity-tooltip" text={disabledText}>
    <button disabled class="secondary" data-tid="stake-maturity-button"
      >{$i18n.neuron_detail.stake_maturity}</button
    >
  </Tooltip>
{/if}
