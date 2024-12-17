<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { ReportingPeriod } from "$lib/types/reporting";
  import ReportingTransactionsButton from "./ReportingTransactionsButton.svelte";

  // TODO: This will be hooked up in a follow up
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let selectedRange: ReportingPeriod = "all";
</script>

<div class="wrapper">
  <div>
    <h3>{$i18n.reporting.transactions_title}</h3>
    <p class="description">{$i18n.reporting.transactions_description}</p>
  </div>
  <ReportingTransactionsButton />
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--padding-3x);
  }
</style>
