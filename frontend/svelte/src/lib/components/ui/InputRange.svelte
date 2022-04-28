<script lang="ts">
  export let max: number;
  export let min: number;
  export let value: number;
  export let ariaLabel: string;
  export let handleInput: (() => void) | undefined = undefined;

  let backgroundStyle: string;
  $: {
    const firstHalf: number = Math.round(((value - min) / (max - min)) * 100);
    backgroundStyle = `linear-gradient(90deg, var(--background-contrast) ${firstHalf}%, var(--gray-200) ${
      1 - firstHalf
    }%)`;
  }
</script>

<!-- Order of on:input and bind:value matters: https://svelte.dev/docs#template-syntax-element-directives-bind-property -->
<input
  {min}
  {max}
  aria-label={ariaLabel}
  type="range"
  bind:value
  on:input={handleInput}
  style={`background-image: ${backgroundStyle};`}
/>

<style lang="scss">
  @use "../../themes/mixins/interaction";

  input[type="range"] {
    appearance: none;
    border-radius: 5px;
    height: 5px;
    width: 100%;
  }

  input[type="range"]:focus {
    outline: none;
  }

  input[type="range"]::-moz-focus-outer {
    border: 0;
  }

  input[type="range"]::-webkit-slider-thumb {
    height: var(--icon-width);
    width: var(--icon-width);
    border-radius: 50%;
    background: var(--background-contrast);
    @include interaction.tappable;
    appearance: none;
  }

  input[type="range"]::-moz-range-thumb {
    height: var(--icon-width);
    width: var(--icon-width);
    border-radius: 50%;
    background: var(--background-contrast);
    @include interaction.tappable;
  }

  input[type="range"]::-ms-thumb {
    height: var(--icon-width);
    width: var(--icon-width);
    border-radius: 50%;
    background: var(--background-contrast);
    @include interaction.tappable;
  }

  input[type="range"]::-webkit-slider-runnable-track {
    cursor: pointer;
  }
</style>
