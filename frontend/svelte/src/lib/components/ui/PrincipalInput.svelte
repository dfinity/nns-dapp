<script lang="ts">
  import type { Principal } from "@dfinity/principal";
  import { i18n } from "../../stores/i18n";
  import { getPrincipalFromString } from "../../utils/accounts.utils";
  import InputWithError from "./InputWithError.svelte";

  export let placeholderLabelKey: string;
  export let name: string;
  export let principal: Principal | undefined = undefined;

  let address: string = "";
  $: principal = getPrincipalFromString(address);
  let showError: boolean = false;

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
  theme="dark"
  errorMessage={showError ? $i18n.error.principal_not_valid : undefined}
  on:blur={showErrorIfAny}
/>
