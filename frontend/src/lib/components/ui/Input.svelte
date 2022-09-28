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
  export let autocomplete: "off" | "on" | undefined = undefined;
  export let value: string | number | undefined = undefined;
  export let placeholderLabelKey: string;
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
