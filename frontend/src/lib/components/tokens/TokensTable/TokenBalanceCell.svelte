<script lang="ts">
  import type { UserTokenData, UserTokenLoading } from "$lib/types/tokens-page";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { Spinner } from "@dfinity/gix-components";
  import { UnavailableTokenAmount } from "$lib/utils/token.utils";

  export let userTokenData: UserTokenData | UserTokenLoading;
</script>

{#if userTokenData.balance instanceof UnavailableTokenAmount}
  <span data-tid="token-value-label"
    >{`-/- ${userTokenData.balance.token.symbol}`}</span
  >
{:else if userTokenData.balance === "loading"}
  <span data-tid="token-value-label" class="balance-spinner"
    ><Spinner inline size="tiny" /></span
  >
{:else}
  <AmountDisplay singleLine amount={userTokenData.balance} />
{/if}

<style lang="scss">
  .balance-spinner {
    display: flex;
    align-items: center;
  }
</style>
