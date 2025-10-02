<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { ReportingPeriod } from "$lib/types/reporting";
  import { formatDateCompact } from "$lib/utils/date.utils";

  type Props = {
    period: ReportingPeriod;
    customFrom?: string;
    customTo?: string;
  };
  let {
    period = $bindable(),
    customFrom = $bindable(),
    customTo = $bindable(),
  }: Props = $props();

  const options: Array<{
    value: ReportingPeriod;
    label: string;
  }> = [
    { value: "all", label: $i18n.reporting.range_filter_all },
    { value: "year-to-date", label: $i18n.reporting.range_year_to_date },
    { value: "last-year", label: $i18n.reporting.range_last_year },
    { value: "custom", label: $i18n.reporting.range_custom },
  ];

  function handleChange(value: ReportingPeriod) {
    period = value;
  }

  const today = formatDateCompact(new Date(), "-");

  const isCustom = () => period === "custom";

  const addYears = (dateString: string, years: number): string => {
    const date = new Date(dateString);
    date.setFullYear(date.getFullYear() + years);
    return formatDateCompact(date, "-");
  };

  const isRangeWithinOneYear = (fromDate: string, toDate: string): boolean => {
    const oneYearFromStart = addYears(fromDate, 1);
    return new Date(toDate) <= new Date(oneYearFromStart);
  };

  const handleFromDateChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target?.value) return;

    const newFromDate = target.value;
    customFrom = newFromDate;

    // If there's no 'to' date yet, set a default value
    if (!customTo) {
      const maxAllowedToDate = addYears(newFromDate, 1);
      customTo = maxAllowedToDate > today ? today : maxAllowedToDate;
    } else {
      // If there's already a 'to' date, apply the existing validation logic
      if (customTo < newFromDate) {
        // If 'to' is before 'from', set 'to' to 'from'
        customTo = newFromDate;
      } else if (!isRangeWithinOneYear(newFromDate, customTo)) {
        const maxAllowedToDate = addYears(newFromDate, 1);
        customTo = maxAllowedToDate > today ? today : maxAllowedToDate;
      }
    }
  };

  const handleToDateChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target?.value) return;

    const newToDate = target.value;
    customTo = newToDate;

    // If there's a 'from' date, check if range exceeds 1 year
    if (customFrom) {
      if (newToDate < customFrom) {
        // If 'to' is before 'from', set 'from' to 'to'
        customFrom = newToDate;
      } else if (!isRangeWithinOneYear(customFrom, newToDate)) {
        // If range exceeds 1 year, set 'from' to 'to' - 1 year
        customFrom = addYears(newToDate, -1);
      }
    }
  };
</script>

<fieldset data-tid="reporting-data-range-selector-component">
  <div class="wrapper">
    <legend>{$i18n.reporting.range_filter_title}</legend>
    <div role="radiogroup" class="options">
      {#each options as option}
        <label class="radio-option">
          <input
            type="radio"
            name="dateRange"
            value={option.value}
            checked={period === option.value}
            aria-checked={period === option.value}
            onchange={() => handleChange(option.value)}
          />
          <span class="label">{option.label}</span>
        </label>
      {/each}
    </div>

    {#if isCustom()}
      <div class="range" data-tid="range-selection">
        <label class="date-input">
          <span>{$i18n.reporting.custom_start_date}</span>
          <input
            type="date"
            name="from"
            data-tid="from-date"
            value={customFrom}
            max={today}
            onchange={handleFromDateChange}
          />
        </label>
        <label class="date-input">
          <span>{$i18n.reporting.custom_end_date}</span>
          <input
            type="date"
            name="to"
            data-tid="to-date"
            value={customTo}
            min={customFrom || ""}
            max={today}
            onchange={handleToDateChange}
          />
        </label>
        <p class="hint">{$i18n.reporting.range_max_one_year}</p>
      </div>
    {/if}
  </div>
</fieldset>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";
  @use "@dfinity/gix-components/dist/styles/mixins/media";

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

      .options {
        display: flex;
        flex-direction: column;
        gap: var(--padding-3x);
        @include media.min-width(medium) {
          flex-direction: row;
        }

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

    .range {
      display: flex;
      flex-wrap: wrap;
      gap: var(--padding-2x);

      .date-input {
        display: flex;
        flex-direction: column;
        gap: var(--padding);
        color: var(--text-description);

        input[type="date"] {
          padding: var(--padding-0_5x);
          border: 1px solid var(--primary);
          color: var(--text-primary);
          background: var(--background-secondary);
        }
      }

      .hint {
        width: 100%;
        font-size: var(--font-size-small);
        color: var(--text-description);
        margin: 0;
        font-style: italic;
      }
    }
  }
</style>
