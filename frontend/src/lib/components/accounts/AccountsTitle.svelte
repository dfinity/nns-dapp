<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import Summary from "$lib/components/summary/Summary.svelte";
  import AccountsBalance from "$lib/components/accounts/AccountsBalance.svelte";

  export let balance: TokenAmount | undefined;
</script>

<div class="summary">
  <Summary projects="display">
    <div class="details" slot="details">
      <AccountsBalance {balance} />
    </div>
  </Summary>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/fonts";
  @use "@dfinity/gix-components/styles/mixins/media";

  .summary {
    display: none;

    @include media.min-width(large) {
      display: block;
    }
  }

  .details {
    height: var(--padding-4x);
    color: var(--description-color);
    @include fonts.small;
  }
</style>
