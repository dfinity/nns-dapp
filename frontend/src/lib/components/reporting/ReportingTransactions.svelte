<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { ReportingPeriod } from "$lib/types/reporting";
  import ReportingDateRangeSelector from "$lib/components/reporting/ReportingDateRangeSelector.svelte";
  import ReportingTransactionsButton from "$lib/components/reporting/ReportingTransactionsButton.svelte";

  let period: ReportingPeriod = "all";
</script>

<div class="wrapper" data-tid="reporting-transactions-component">
  <div>
    <h3>{$i18n.reporting.transactions_title}</h3>
    <p class="description">{$i18n.reporting.transactions_description}</p>
  </div>

  <ReportingDateRangeSelector bind:period />
  <ReportingTransactionsButton {period} />
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--padding-3x);
  }
</style>
