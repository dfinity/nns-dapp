<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { ReportingPeriod } from "$lib/types/reporting";

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

  const isCustom = () => period === "custom";

  const formatLocalDateYmd = (date: Date): string => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const d = date.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${d}`;
  };
  const today = formatLocalDateYmd(new Date());

  function handleStartDateChange(value: string) {
    customFrom = value;
    if (!value) return;
    const [y, m, d] = value.split("-").map((v) => Number(v));
    if (!y || m === undefined || !d) return;
    // Add one year using local time to match input semantics
    const tentative = new Date(y + 1, m - 1, d);
    const now = new Date();
    const capped = tentative > now ? now : tentative;
    customTo = formatLocalDateYmd(capped);
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
            onchange={() => handleChange(option.value)}
          />
          <span class="label">{option.label}</span>
        </label>
      {/each}
    </div>

    {#if isCustom()}
      <div class="custom-range">
        <label>
          <span>{$i18n.reporting.custom_start_date}</span>
          <input
            type="date"
            value={customFrom}
            max={customTo || today}
            onchange={(e) =>
              handleStartDateChange((e.target as HTMLInputElement).value)}
          />
        </label>
        <label>
          <span>{$i18n.reporting.custom_end_date}</span>
          <input
            type="date"
            value={customTo}
            min={customFrom || ""}
            max={today}
            onchange={(e) => (customTo = (e.target as HTMLInputElement).value)}
          />
        </label>
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

      div {
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
  }

  .custom-range {
    display: flex;
    gap: var(--padding-2x);
    flex-wrap: wrap;
  }
</style>
