<script lang="ts">
  import RadioGroup from "$lib/components/reporting/RadioGroup.svelte";
  import ReportingNeuronsButton from "$lib/components/reporting/ReportingNeuronsButton.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { ReportingNeuronsSource } from "$lib/types/reporting";

  let source: ReportingNeuronsSource = $state("nns");

  const options: Array<{
    value: ReportingNeuronsSource;
    label: string;
  }> = [
    { value: "nns", label: $i18n.reporting.neurons_source_nns },
    { value: "sns", label: $i18n.reporting.neurons_source_sns },
  ];
</script>

<div class="wrapper">
  <div>
    <h3>{$i18n.reporting.neurons_title}</h3>
    <p class="description">{$i18n.reporting.neurons_description}</p>
  </div>
  <fieldset data-tid="neurons-source-selector">
    <div class="selector-wrapper">
      <legend>{$i18n.reporting.neurons_source}</legend>
      <RadioGroup
        {options}
        bind:value={source}
        name="neuronsSource"
        ariaLabel={$i18n.reporting.neurons_source}
      />
    </div>
  </fieldset>

  <ReportingNeuronsButton {source} />
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--padding-3x);
  }

  fieldset {
    all: unset;

    .selector-wrapper {
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
