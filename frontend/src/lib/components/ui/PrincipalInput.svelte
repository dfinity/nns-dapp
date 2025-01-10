<script lang="ts">
  import InputWithError from "$lib/components/ui/InputWithError.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { getPrincipalFromString } from "$lib/utils/accounts.utils";
  import type { Principal } from "@dfinity/principal";

  export let placeholderLabelKey: string;
  export let name: string;
  export let principal: Principal | undefined = undefined;
  export let required: boolean | undefined = undefined;
  export let testId: string | undefined = undefined;
  export let disabled: boolean | undefined = undefined;

  let address = principal?.toText() ?? "";
  $: principal = getPrincipalFromString(address);
  let showError = false;

  const showErrorIfAny = () => {
    showError = address.length > 0 && principal === undefined;
  };
  // Hide error on change
  $: address, (showError = false);
</script>

<InputWithError
  inputType="text"
  {placeholderLabelKey}
  {name}
  {testId}
  {disabled}
  bind:value={address}
  errorMessage={showError ? $i18n.error.principal_not_valid : undefined}
  on:blur={showErrorIfAny}
  showInfo={$$slots.label !== undefined}
  {required}
>
  <slot name="label" slot="label" />
</InputWithError>
