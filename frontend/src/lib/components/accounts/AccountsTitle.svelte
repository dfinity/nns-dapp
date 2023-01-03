<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import Summary from "$lib/components/summary/Summary.svelte";
  import AccountsBalance from "$lib/components/accounts/AccountsBalance.svelte";

  export let balance: TokenAmount | undefined;

  let innerWidth = 0;
  let summary = true;

  // TODO: workaround to display the summary with title or balance only. It should be removed once we integrate the balance within the universe selector cards.
  $: summary = innerWidth > 1024;
</script>

<svelte:window bind:innerWidth />

{#if summary}
  <Summary projects="display">
    <div class="details" slot="details">
      <AccountsBalance {balance} />
    </div>
  </Summary>
{:else}
  <div class="amount">
    <AccountsBalance {balance} />
  </div>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/fonts";

  .details {
    height: var(--padding-4x);
    color: var(--description-color);
    @include fonts.small;
  }

  .amount {
    padding: 0 0 var(--padding-2x);
  }
</style>
