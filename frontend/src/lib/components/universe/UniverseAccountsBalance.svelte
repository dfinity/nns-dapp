<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { tokensByUniverseIdStore } from "$lib/derived/tokens.derived";
  import { universesAccountsBalance } from "$lib/derived/universes-accounts-balance.derived";
  import type { Universe } from "$lib/types/universe";
  import { SkeletonText } from "@dfinity/gix-components";
  import { nonNullish, TokenAmountV2, type Token } from "@dfinity/utils";

  export let universe: Universe;

  let balanceUlps: bigint | undefined;
  $: balanceUlps = $universesAccountsBalance[universe.canisterId];

  let token: Token | undefined;
  $: token = $tokensByUniverseIdStore[universe.canisterId];

  let balance: TokenAmountV2 | undefined;
  $: balance =
    nonNullish(balanceUlps) && nonNullish(token)
      ? TokenAmountV2.fromUlps({ amount: balanceUlps, token })
      : undefined;
</script>

<div class="amount" data-tid="universe-accounts-balance-component">
  {#if nonNullish(balance)}
    <AmountDisplay text amount={balance} />
  {:else}
    <div class="skeleton">
      <SkeletonText />
    </div>
  {/if}
</div>

<style lang="scss">
  .amount {
    min-height: var(--padding-3x);
  }

  .skeleton {
    display: flex;
    flex-direction: column;
    height: var(--padding-3x);
    box-sizing: border-box;
    padding: 0 0 var(--padding-0_5x);
    max-width: 240px;
  }
</style>
