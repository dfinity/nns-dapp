<script lang="ts">
  import ActionableProposalCountBadge from "$lib/components/proposals/ActionableProposalCountBadge.svelte";
  import { actionableProposalTotalCountStore } from "$lib/derived/actionable-proposals.derived";
  import { nonNullish } from "@dfinity/utils";

  let count = 0;
  $: count = $actionableProposalTotalCountStore;
</script>

{#if nonNullish(count) && count > 0}
  <ActionableProposalCountBadge {count} universe="all" />
{/if}
