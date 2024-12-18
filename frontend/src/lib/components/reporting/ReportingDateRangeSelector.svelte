<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { ReportingPeriod } from "$lib/types/reporting";

  let period: ReportingPeriod = "all";

  const options: Array<{
    value: ReportingPeriod;
    label: string;
  }> = [
    { value: "all", label: $i18n.reporting.range_filter_all },
    { value: "last-year", label: $i18n.reporting.range_last_year },
    { value: "year-to-date", label: $i18n.reporting.range_year_to_date },
  ];

  function handleChange(value: ReportingPeriod) {
    period = value;
  }
</script>

<fieldset data-tid="reporting-data-range-selector-component">
  <div class="wrapper">
    <legend>{$i18n.reporting.range_filter_title}</legend>
    <div role="radiogroup">
      {#each options as option}
        <label class="radio-option">
          <input
            type="radio"
            name="dateRange"
            value={option.value}
            checked={period === option.value}
            aria-checked={period === option.value}
            on:change={() => handleChange(option.value)}
          />
          <span class="label">{option.label}</span>
        </label>
      {/each}
    </div></div
  >
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

      div {
        display: flex;
        gap: var(--padding-3x);

        .radio-option {
          display: flex;
          align-items: center;
          gap: var(--padding);
          cursor: pointer;

          .label {
            color: var(--text-description);
            font-size: var(--font-size-body);
          }

          input[type="radio"] {
            appearance: none;
            width: 18px;
            height: 18px;
            border: 2px solid var(--primary);
            border-radius: 50%;
            margin: 0;
            cursor: pointer;
            position: relative;
            background: transparent;

            &:checked {
              border: 5px solid var(--primary, #666);
            }
          }
        }
      }
    }
  }
</style>
