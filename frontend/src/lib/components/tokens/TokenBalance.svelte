<script lang="ts">
  import type { UserTokenData } from "$lib/types/tokens-page";
  import { UnavailableTokenAmount } from "$lib/utils/token.utils";
  import AmountDisplay from "../ic/AmountDisplay.svelte";

  export let userTokenData: UserTokenData;
</script>

{#if userTokenData.balance instanceof UnavailableTokenAmount}
  <span data-tid="token-value-label"
    >{`-/- ${userTokenData.balance.token.symbol}`}</span
  >
{:else}
  <AmountDisplay singleLine amount={userTokenData.balance} />
{/if}
