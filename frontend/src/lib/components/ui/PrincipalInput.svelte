<script lang="ts">
  import type { Principal } from "@dfinity/principal";
  import { i18n } from "$lib/stores/i18n";
  import { getPrincipalFromString } from "$lib/utils/accounts.utils";
  import InputWithError from "./InputWithError.svelte";

  export let placeholderLabelKey: string;
  export let name: string;
  export let principal: Principal | undefined = undefined;

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
  bind:value={address}
  errorMessage={showError ? $i18n.error.principal_not_valid : undefined}
  on:blur={showErrorIfAny}
>
  <slot name="label" slot="label" />
</InputWithError>
