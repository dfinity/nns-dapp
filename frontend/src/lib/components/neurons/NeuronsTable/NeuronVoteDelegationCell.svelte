<script lang="ts">
  import type { TableNeuron } from "$lib/types/neurons-table";
  import {
    IconCheckCircle,
    IconCheckCircleFill,
    Tooltip,
  } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { nonNullish } from "@dfinity/utils";

  type Props = {
    rowData: TableNeuron;
  };

  const { rowData }: Props = $props();
  const voteDelegationState = $derived(rowData.voteDelegationState);
  const isVisible = $derived(nonNullish(voteDelegationState));
  const tooltipText = $derived(
    voteDelegationState === "all"
      ? $i18n.neuron_detail.vote_delegation_tooltip_all
      : voteDelegationState === "some"
        ? $i18n.neuron_detail.vote_delegation_tooltip_some
        : $i18n.neuron_detail.vote_delegation_tooltip_none
  );
</script>

<div data-tid="neuron-vote-delegation-cell-component">
  {#if isVisible}
    <Tooltip text={tooltipText}>
      {#if voteDelegationState === "all"}
        <div data-tid="icon-all" role="status" aria-label={tooltipText}>
          <IconCheckCircleFill size={21} />
        </div>
      {:else if voteDelegationState === "some"}
        <div data-tid="icon-some" role="status" aria-label={tooltipText}>
          <IconCheckCircle size="18px" />
        </div>
      {:else}
        <div
          data-tid="icon-none"
          role="status"
          aria-label={tooltipText}
          class="none"
        >
          -
        </div>
      {/if}
    </Tooltip>
  {/if}
</div>

<style lang="scss">
  div {
    display: flex;
    justify-content: center;
    color: var(--elements-icons);
  }

  .none {
    // To be aligned with other icons.
    padding-left: var(--padding-0_5x);
  }
</style>
