<script lang="ts">
  import { nonNullish } from "@dfinity/utils";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { SkeletonText } from "@dfinity/gix-components";
  import { type Token, TokenAmount } from "@dfinity/nns";
  import { universesAccountsBalance } from "$lib/derived/universes-accounts-balance.derived";
  import type { Universe } from "$lib/types/universe";
  import { tokensStore } from "$lib/stores/tokens.store";

  export let universe: Universe;

  // TODO: conversion from E8S to use new tokensStore until account.ts.balance is converted to E8S
  let balanceE8s: bigint | undefined;
  $: balanceE8s = $universesAccountsBalance[universe.canisterId]?.balanceE8s;

  let token: Token | undefined;
  $: token = $tokensStore[universe.canisterId]?.token;

  let balance: TokenAmount | undefined;
  $: balance =
    nonNullish(balanceE8s) && nonNullish(token)
      ? TokenAmount.fromE8s({ amount: balanceE8s, token })
      : undefined;
</script>

<div class="amount">
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
