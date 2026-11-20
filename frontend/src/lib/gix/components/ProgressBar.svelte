<script lang="ts">
  import type { ProgressBarSegment } from "$lib/gix/types/progress-bar";

  // Html default is 1 anyway
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress?retiredLocale=ca#attr-max
  export let max = 1;
  export let value = 0;
  export let testId: string | undefined = undefined;
  export let color: "warning" | "primary" = "primary";
  // If `segments` is set, it will override the `value` and `color` props.
  export let segments: ProgressBarSegment[] = [];

  let totalValue: number;
  $: totalValue =
    segments.length > 0
      ? segments.reduce((acc, curr) => acc + curr.value, 0)
      : value;

  // Creates the list of items of the `linear-gradient` css property.
  // Ex: `red 0% 50%, blue 50% 100%`
  const createGradients = (items: ProgressBarSegment[]): string => {
    const total = items.reduce((acc, curr) => acc + curr.value, 0);
    let currentPercentage = 0;
    const gradients: string[] = [];
    for (const item of items) {
      const percentage = (item.value / total) * 100;
      gradients.push(
        `${item.color} ${currentPercentage}% ${currentPercentage + percentage}%`
      );
      currentPercentage += percentage;
    }
    return gradients.join(", ");
  };

  let inlineStyle: string;
  $: inlineStyle =
    segments.length > 0
      ? `--progress-bar-background: linear-gradient(to right, ${createGradients(
          segments
        )});`
      : color === "warning"
        ? `--progress-bar-background: var(--warning-emphasis);`
        : `--progress-bar-background: var(--primary-gradient);`;
</script>

<div class="wrapper" data-tid={testId}>
  <slot name="top" />
  <progress
    style={inlineStyle}
    class={color}
    aria-valuemax={max}
    aria-valuenow={totalValue}
    {max}
    value={totalValue}
  ></progress>
  <slot name="bottom" />
</div>

<style lang="scss">
  div {
    --current-height: var(--padding);
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
  }

  // Target only FF
  @supports (-moz-appearance: none) {
    progress {
      height: var(--current-height);
      border-radius: var(--current-height);
      box-shadow: var(--input-box-shadow);
      border: 0;

      &::-moz-progress-bar {
        background-color: #fff;
        box-shadow: var(--input-box-shadow);
      }

      &.warning {
        &::-moz-progress-bar {
          background: var(--progress-bar-background);
        }
      }

      &.primary {
        &::-moz-progress-bar {
          background: var(--progress-bar-background);
        }
      }
    }
  }

  progress {
    width: 100%;

    appearance: none;

    height: var(--current-height);
    overflow: hidden;

    // Keep here to have a better UI with low values
    // Referenece: https://stackoverflow.com/questions/76606203/html-progress-bar-with-custom-background-color-has-design-problem-if-it-has-low
    border-radius: var(--current-height);
    box-shadow: var(--input-box-shadow);

    // Progress bar styles
    &::-webkit-progress-bar {
      background-color: #fff;
      box-shadow: var(--input-box-shadow);
    }

    &::-webkit-progress-value {
      box-shadow: var(--input-box-shadow);
    }

    &.warning {
      &::-webkit-progress-value {
        background: var(--progress-bar-background);
      }
    }

    &.primary {
      &::-webkit-progress-value {
        background: var(--progress-bar-background);
      }
    }
  }
</style>
