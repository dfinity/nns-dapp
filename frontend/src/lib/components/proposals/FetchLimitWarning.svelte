<script lang="ts">
  import {
    DEFAULT_LIST_PAGINATION_LIMIT,
    MAX_ACTIONABLE_REQUEST_COUNT,
  } from "$lib/constants/constants";
  import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
</script>

{#if $actionableNnsProposalsStore.fetchLimitReached}
  <div class="fetchLimitWarning">
    {replacePlaceholders($i18n.warning.proposal_fetch_limit, {
      $maxLimit: String(
        MAX_ACTIONABLE_REQUEST_COUNT * DEFAULT_LIST_PAGINATION_LIMIT
      ),
    })}
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
