<script lang="ts">
  import { onMount } from "svelte";
  import { ENABLE_SNS } from "../constants/environment.constants";
  import { AppPath } from "../constants/routes.constants";
  import { routeStore } from "../stores/route.store";

  // TODO: Clean after enabling sns https://dfinity.atlassian.net/browse/GIX-1013
  onMount(() => {
    if (!ENABLE_SNS) {
      routeStore.update({ path: AppPath.LegacyAccounts });
    }
  });
</script>

<!-- TODO: GIX-995 Implement SNS Wallet details -->
<div data-tid="sns-wallet">TO BE IMPLEMENTED</div>
