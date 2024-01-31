<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import type { TokenAmountV2 } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";

  export let balance: TokenAmountV2;
</script>

<div>
  <p>{$i18n.accounts.current_balance}:</p>
  <AmountDisplay inline={true} amount={balance} />
</div>

<style lang="scss">
  div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
