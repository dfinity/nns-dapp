<script lang="ts">
  import {
    DEFAULT_LIST_PAGINATION_LIMIT,
    MAX_ACTIONABLE_REQUEST_COUNT,
  } from "$lib/constants/constants";
  import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
</script>

{#if $actionableNnsProposalsStore.fetchLimitReached}
  <div class="fetchLimitWarning">
    Fetching of open proposals was limited to {MAX_ACTIONABLE_REQUEST_COUNT *
      DEFAULT_LIST_PAGINATION_LIMIT} for performance reasons. Therefore some of your
    actionable proposals (a subset of the open proposals) might not be shown here.
    Please use a direct link if looking for a specific one.
  </div>
{/if}

<style>
  .fetchLimitWarning {
    background-color: var(--orange-tint);
    margin-bottom: var(--padding-3x);
    border-radius: 12px;
    padding: 12px;
  }
</style>
