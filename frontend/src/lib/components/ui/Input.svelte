<script lang="ts">
  import { translate } from "../../utils/i18n.utils";
  import { Input } from "@dfinity/gix-components";

  export let name: string;
  export let inputType: "icp" | "number" | "text" = "number";
  export let required: boolean = true;
  export let spellcheck: boolean | undefined = undefined;
  export let step: number | "any" | undefined = undefined;
  export let disabled: boolean = false;
  export let minLength: number | undefined = undefined;
  export let max: number | undefined = undefined;
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
  export let autocomplete: "off" | "on" | undefined = undefined;
  export let value: string | number | undefined = undefined;
  export let placeholderLabelKey: string;
  // When forwarding slots, they always appear as true
  // This is a known issue in Svelte
  // https://github.com/sveltejs/svelte/issues/6059
  // To hack this, we pass a prop to avoid showing info element when not needed
  // Ideally, this would be calculated
  // showInfo = $$slots.label || $$slots.additional
  export let showInfo: boolean = true;

  let placeholder: string;
  $: placeholder = translate({ labelKey: placeholderLabelKey });
</script>

<Input
  testId="input-ui-element"
  {inputType}
  {required}
  {spellcheck}
  {name}
  {step}
  {disabled}
  bind:value
  {minLength}
  {placeholder}
  {max}
  {autocomplete}
  on:blur
  on:focus
  on:input
  on:keydown
  {showInfo}
>
  <svelte:fragment slot="label"><slot name="label" /></svelte:fragment>
  <svelte:fragment slot="additional"><slot name="additional" /></svelte:fragment>
</Input>
