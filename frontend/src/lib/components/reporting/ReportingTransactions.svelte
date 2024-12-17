<script lang="ts">
  import type { ReportingDateRange } from "$lib/types/reporting";
  import ReportingTransactionsButton from "./ReportingTransactionsButton.svelte";

  // TODO: This will be hooked up in a follow up
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let selectedRange: ReportingDateRange = "all";
</script>

<div class="wrapper">
  <ReportingTransactionsButton />
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding-3x);
  }
</style>
