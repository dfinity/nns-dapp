<script lang="ts">
  import {
    DEFAULT_LIST_PAGINATION_LIMIT,
    MAX_ACTIONABLE_REQUEST_COUNT,
  } from "$lib/constants/constants";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
</script>

<p role="status">
  {replacePlaceholders($i18n.warning.proposal_fetch_limit, {
    $maxLimit: String(
      MAX_ACTIONABLE_REQUEST_COUNT * DEFAULT_LIST_PAGINATION_LIMIT
    ),
  })}
</p>

<style>
  p {
    background-color: var(--orange-tint);
    margin: var(--padding-3x) 0;
    text-align: justify;
    border-radius: 12px;
    padding: 12px;
  }
</style>
