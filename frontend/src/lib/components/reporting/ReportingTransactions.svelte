<script lang="ts">
  import ReportingDateRangeSelector from "$lib/components/reporting/ReportingDateRangeSelector.svelte";
  import ReportingTransactionsButton from "$lib/components/reporting/ReportingTransactionsButton.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { ReportingPeriod } from "$lib/types/reporting";

  let period: ReportingPeriod = $state("year-to-date");
  let customFrom: string = $state("");
  let customTo: string = $state("");
</script>

<div class="wrapper" data-tid="reporting-transactions-component">
  <div>
    <h3>{$i18n.reporting.transactions_title}</h3>
    <p class="description">{$i18n.reporting.transactions_description}</p>
  </div>

  <ReportingDateRangeSelector bind:period bind:customFrom bind:customTo />
  <ReportingTransactionsButton {period} {customFrom} {customTo} />
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--padding-3x);
  }
</style>
