<script lang="ts">
  import { ENABLE_MY_TOKENS } from "$lib/stores/feature-flags.store";
  import TokensRoute from "../(nns)/tokens/+page.svelte";
  import AccountsRoute from "../(u)/(list)/accounts/+page.svelte";
</script>

{#if $ENABLE_MY_TOKENS}
  <TokensRoute />
{:else}
  <AccountsRoute />
{/if}
