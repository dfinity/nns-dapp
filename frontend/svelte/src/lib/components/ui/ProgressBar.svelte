<script lang="ts">
  // Html default is 1 anyway
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress?retiredLocale=ca#attr-max
  export let max: number = 1;
  export let value: number;
  export let color: "yellow" | "blue" = "yellow";
</script>

<div class="wrapper">
  <slot name="top" />
  <progress
    {max}
    {value}
    class={color}
    aria-valuemax={max}
    aria-valuenow={value}
  />
  <slot name="bottom" />
</div>

<style lang="scss">
  div {
    --current-height: var(--padding);
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  // Target only FF
  @supports (-moz-appearance: none) {
    progress {
      background-color: var(--background);

      height: var(--current-height);
      border-radius: var(--current-height);
      box-shadow: var(--current-box-inset-shadow);
      border: 0;

      &::-moz-progress-bar {
        border-radius: var(--current-height);
        box-shadow: var(--current-box-inset-shadow);
      }

      &.yellow {
        &::-moz-progress-bar {
          background: var(--warning-emphasis);
        }
      }

      &.blue {
        &::-moz-progress-bar {
          background: var(--primary-gradient-fallback);
          background: var(--primary-gradient);
        }
      }
    }
  }
  progress {
    width: 100%;

    // Styles are custom for FF and Webkit
    -webkit-appearance: none;
    -moz-appearance: none;

    height: var(--current-height);

    // Progress bar styles
    &::-webkit-progress-bar {
      background-color: #fff;

      height: var(--current-height);
      border-radius: var(--current-height);
      box-shadow: var(--current-box-inset-shadow);
    }

    &::-webkit-progress-value {
      border-radius: var(--current-height);
      box-shadow: var(--current-box-inset-shadow);
    }

    &.yellow {
      &::-webkit-progress-value {
        background: var(--warning-emphasis);
      }
    }

    &.blue {
      &::-webkit-progress-value {
        background: var(--primary-gradient-fallback);
        background: var(--primary-gradient);
      }
    }
  }
</style>
