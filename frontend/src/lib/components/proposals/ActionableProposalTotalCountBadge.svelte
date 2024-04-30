<script lang="ts">
  import ActionableProposalCountBadge from "$lib/components/proposals/ActionableProposalCountBadge.svelte";
  import { actionableProposalTotalCountStore } from "$lib/derived/actionable-proposals.derived";
  import { nonNullish } from "@dfinity/utils";
  import { cubicOut } from "svelte/easing";
  import { scale } from "svelte/transition";

  let count = 0;
  $: count = $actionableProposalTotalCountStore;
</script>

{#if nonNullish(count) && count > 0}
  <div
    transition:scale={{
      duration: 250,
      easing: cubicOut,
    }}
  >
    <ActionableProposalCountBadge {count} universe="all" noAnimation />
  </div>
{/if}
