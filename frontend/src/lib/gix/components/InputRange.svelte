<script lang="ts">
  interface Props {
    max: number;
    min: number;
    value: number;
    ariaLabel: string;
    handleInput?: (() => void) | undefined;
  }

  let {
    max,
    min,
    value = $bindable<number>(),
    ariaLabel,
    handleInput = undefined,
  }: Props = $props();

  let progression = $derived(Math.round(((value - min) / (max - min)) * 100));
</script>

<!-- Order of on:input and bind:value matters: https://svelte.dev/docs#template-syntax-element-directives-bind-property -->
<input
  style={`--range-progression: ${progression}%; --range-end: ${
    1 - progression
  }%;`}
  aria-label={ariaLabel}
  data-tid="input-range"
  {max}
  {min}
  oninput={handleInput}
  type="range"
  bind:value
/>

<style lang="scss">
  @use "../styles/mixins/interaction";

  input {
    appearance: none;
    border-radius: var(--padding-0_5x);
    height: var(--padding);
    width: 100%;

    /** Declaring this value as a CSS variable in dark.scss and light.scss was not interpreted correctly, therefore we implement these here */
    background: linear-gradient(
      99.27deg,
      var(--cp-light-500) var(--range-progression),
      var(--input-background) var(--range-end)
    );

    box-shadow: var(--input-box-shadow);
  }

  input:focus {
    outline: none;
  }

  input::-moz-focus-outer {
    border: 0;
  }

  input::-webkit-slider-thumb {
    height: var(--icon-width);
    width: var(--icon-width);
    border-radius: 50%;
    background: var(--primary);
    border: 2px solid var(--card-background);
    box-shadow: var(--interaction-box-shadow);
    @include interaction.tappable;
    appearance: none;
  }

  input::-moz-range-thumb {
    height: var(--icon-width);
    width: var(--icon-width);
    border-radius: 50%;
    background: var(--primary);
    border: 2px solid var(--card-background);
    box-shadow: var(--interaction-box-shadow);
    @include interaction.tappable;
  }

  input::-ms-thumb {
    height: var(--icon-width);
    width: var(--icon-width);
    border-radius: 50%;
    background: var(--primary);
    border: 2px solid var(--card-background);
    box-shadow: var(--interaction-box-shadow);
    @include interaction.tappable;
  }

  input::-webkit-slider-runnable-track {
    cursor: pointer;
  }
</style>
