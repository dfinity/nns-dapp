<script lang="ts">
  import type { ICP, TokenAmount } from "@dfinity/nns";
  import AmountDisplay from "./AmountDisplay.svelte";

  export let amount: ICP | TokenAmount;
</script>

<span><slot /> <AmountDisplay singleLine {amount} /></span>
