<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";

  export let amount: TokenAmount;
  export let testId: string | undefined = undefined;
</script>

<div data-tid={testId}>
  <p class="label">
    <slot name="label">
      {$i18n.accounts.received_amount}
    </slot>
  </p>

  <p class="no-margin">
    <AmountDisplay inline detailed {amount} />
  </p>
</div>

<style lang="scss">
  p {
    margin: 0 0 var(--padding-0_5x);
  }
</style>
