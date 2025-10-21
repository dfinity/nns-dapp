<script lang="ts">
  import RadioGroup from "$lib/components/reporting/RadioGroup.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { ReportingTransactionsSource } from "$lib/types/reporting";

  type Props = {
    source: ReportingTransactionsSource;
  };

  let { source = $bindable() }: Props = $props();

  const options: Array<{
    value: ReportingTransactionsSource;
    label: string;
  }> = [
    { value: "nns", label: $i18n.reporting.transactions_source_nns },
    { value: "ck", label: $i18n.reporting.transactions_source_ck },
  ];
</script>

<fieldset data-tid="transactions-source-selector">
  <div class="wrapper">
    <legend>{$i18n.accounts.source}</legend>
    <RadioGroup
      {options}
      bind:value={source}
      name="transactionsSource"
      ariaLabel={$i18n.accounts.source}
    />
  </div>
</fieldset>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  fieldset {
    all: unset;

    .wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--padding-2x);
      border: none;
      padding: 0;
      margin: 0;

      legend {
        @include fonts.h5;
      }
    }
  }
</style>
