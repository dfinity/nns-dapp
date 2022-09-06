<script lang="ts">
  import type { ICP, TokenAmount } from "@dfinity/nns";
  import AmountDisplay from "./AmountDisplay.svelte";

  // TODO: Remove ICP reference
  export let amount: ICP | TokenAmount;
</script>

<span><slot /> <AmountDisplay singleLine {amount} /></span>
