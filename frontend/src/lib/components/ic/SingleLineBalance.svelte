<script lang="ts">
  import { formatToken } from "$lib/utils/token.utils";
  import type { TokenAmount } from "@dfinity/utils";

  export let testId: string | undefined = undefined;
  export let amount: TokenAmount;
</script>

<div data-tid={testId}>
  <span>{`${formatToken({ value: amount.toE8s(), detailed: false })}`}</span>
  <span class="amount-label">{amount.token.symbol}</span>
</div>

<style lang="scss">
  .amount-label {
    color: var(--text-description);
  }
</style>
