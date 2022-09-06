<script lang="ts">
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import type { ICP, TokenAmount } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";

  export let balance: TokenAmount | ICP;
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
