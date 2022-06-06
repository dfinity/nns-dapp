<script lang="ts">
  export let max: number;
  export let min: number;
  export let value: number;
  export let ariaLabel: string;
  export let handleInput: (() => void) | undefined = undefined;

  let backgroundStyle: string;
  $: {
    const firstHalf: number = Math.round(((value - min) / (max - min)) * 100);
    backgroundStyle = `linear-gradient(90deg, var(--background-contrast) ${firstHalf}%, var(--gray-50) ${
      1 - firstHalf
    }%)`;
  }
</script>

<!-- Order of on:input and bind:value matters: https://svelte.dev/docs#template-syntax-element-directives-bind-property -->
<input
  data-tid="input-range"
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

  input {
    appearance: none;
    border-radius: 5px;
    height: 5px;
    width: 100%;
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
    background: var(--background-contrast);
    @include interaction.tappable;
    appearance: none;
  }

  input::-moz-range-thumb {
    height: var(--icon-width);
    width: var(--icon-width);
    border-radius: 50%;
    background: var(--background-contrast);
    @include interaction.tappable;
  }

  input::-ms-thumb {
    height: var(--icon-width);
    width: var(--icon-width);
    border-radius: 50%;
    background: var(--background-contrast);
    @include interaction.tappable;
  }

  input::-webkit-slider-runnable-track {
    cursor: pointer;
  }
</style>
