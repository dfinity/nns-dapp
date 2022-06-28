<script lang="ts">
  // Html default is 1 anyway
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress?retiredLocale=ca#attr-max
  export let max: number = 1;
  export let value: number;
  export let color: "yellow" | "blue" = "yellow";
</script>

<div class="wrapper">
  <slot name="top" />
  <progress {max} {value} class={color} />
  <slot name="bottom" />
</div>

<style lang="scss">
  div {
    --current-box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4) inset;
    --current-height: 10px;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  // Target only FF
  @supports (-moz-appearance: none) {
    progress {
      background-color: #fff;

      height: var(--current-height);
      border-radius: var(--current-height);
      box-shadow: var(--current-box-shadow);
      border: 0;

      &::-moz-progress-bar {
        border-radius: var(--current-height);
        box-shadow: var(--current-box-shadow);
      }

      &.yellow {
        &::-moz-progress-bar {
          background: var(--yellow-400);
        }
      }

      &.blue {
        &::-moz-progress-bar {
          background: var(--header-background);
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
      box-shadow: var(--current-box-shadow);
    }

    &::-webkit-progress-value {
      border-radius: var(--current-height);
      box-shadow: var(--current-box-shadow);
    }

    &.yellow {
      &::-webkit-progress-value {
        background: var(--yellow-400);
      }
    }

    &.blue {
      &::-webkit-progress-value {
        background: var(--header-background);
      }
    }
  }
</style>
