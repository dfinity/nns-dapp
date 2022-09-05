<script lang="ts">
  import AmountTokens from "../ic/AmountTokens.svelte";
  import type { TokenAmount } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";

  export let balance: TokenAmount;
</script>

<div>
  <p>{$i18n.accounts.current_balance}:</p>
  <AmountTokens inline={true} amount={balance} />
</div>

<style lang="scss">
  div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
