<script lang="ts">
  import { ENABLE_PORTFOLIO_PAGE } from "$lib/stores/feature-flags.store";
  import TokensRoute from "../(nns)/tokens/+page.svelte";
  import PortfolioRoute from "../(nns)/portfolio/+page.svelte";
</script>

{#if $ENABLE_PORTFOLIO_PAGE}
  <PortfolioRoute />
{:else}
  <TokensRoute />
{/if}
