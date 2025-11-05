<script lang="ts">
  import { translate } from "$lib/utils/i18n.utils";
  import { Input } from "@dfinity/gix-components";

  export let testId: string = "input-ui-element";
  export let name: string;
  export let inputType: "icp" | "currency" | "number" | "text" = "number";
  export let decimals: number | undefined = undefined;
  export let required = true;
  export let spellcheck: boolean | undefined = undefined;
  export let step: number | "any" | undefined = undefined;
  export let disabled = false;
  export let minLength: number | undefined = undefined;
  export let max: number | undefined = undefined;
  export let autocomplete: "off" | "on" | undefined = undefined;
  export let value: string | number | undefined = undefined;
  export let placeholderLabelKey: string;
  export let showInfo = true;
  export let onInput: undefined | (() => void) = undefined;
  export let onFocus: undefined | (() => void) = undefined;
  export let onBlur: undefined | (() => void) = undefined;

  let placeholder: string;
  $: placeholder = translate({ labelKey: placeholderLabelKey });
</script>

<Input
  {testId}
  {inputType}
  {decimals}
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
  {onBlur}
  {onFocus}
  {onInput}
  {showInfo}
>
  {#snippet start()}
    <slot name="start" />
  {/snippet}
  {#snippet label()}
    <slot name="label" />
  {/snippet}
  {#snippet end()}
    <slot name="end" />
  {/snippet}
  {#snippet innerEnd()}
    <slot name="inner-end" />
  {/snippet}
  {#snippet bottom()}
    <slot name="bottom" />
  {/snippet}
</Input>
