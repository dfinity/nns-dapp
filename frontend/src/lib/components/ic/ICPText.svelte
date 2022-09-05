<script lang="ts">
  import type { ICP, TokenAmount } from "@dfinity/nns";
  import AmountTokens from "./AmountTokens.svelte";

  export let amount: ICP | TokenAmount;
</script>

<span><slot /> <AmountTokens singleLine {amount} /></span>
