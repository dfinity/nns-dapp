<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import AmountDisplay from "./AmountDisplay.svelte";

  export let amount: TokenAmount;
</script>

<span><slot /> <AmountDisplay singleLine {amount} /></span>
