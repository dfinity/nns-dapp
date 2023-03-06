<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import { invalidAddress } from "$lib/utils/accounts.utils";

  import InputWithError from "$lib/components/ui/InputWithError.svelte";
  import { TransactionNetwork } from "$lib/types/transaction";

  export let address = "";
  export let selectedNetwork: TransactionNetwork | undefined = undefined;

  let showError = false;
  const dispatcher = createEventDispatcher();
  const showErrorIfAny = () => {
    showError =
      address.length > 0 &&
      invalidAddress({ address, network: selectedNetwork });
  };
  // Hide error on change
  $: address, (showError = false);

  const onBlur = () => {
    showErrorIfAny();
    dispatcher("nnsBlur");
  };

  $: selectedNetwork, (() => showErrorIfAny())();
</script>

<InputWithError
  inputType="text"
  placeholderLabelKey="accounts.address"
  name="accounts-address"
  bind:value={address}
  errorMessage={showError ? $i18n.error.address_not_valid : undefined}
  showInfo={$$slots.label !== undefined}
  on:blur={onBlur}><slot name="label" slot="label" /></InputWithError
>
