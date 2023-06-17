<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import { invalidAddress } from "$lib/utils/accounts.utils";
  import InputWithError from "$lib/components/ui/InputWithError.svelte";
  import type { TransactionNetwork } from "$lib/types/transaction";
  import type { Principal } from "@dfinity/principal";
  import { IconQRCodeScanner } from "@dfinity/gix-components";

  export let address = "";
  export let selectedNetwork: TransactionNetwork | undefined = undefined;
  export let rootCanisterId: Principal;
  export let qrCode = true;

  let showError = false;
  const dispatcher = createEventDispatcher();
  const showErrorIfAny = () => {
    showError =
      address.length > 0 &&
      invalidAddress({ address, network: selectedNetwork, rootCanisterId });
  };
  // Hide error on change
  $: address, (showError = false);

  const onBlur = () => {
    showErrorIfAny();
    dispatcher("nnsBlur");
  };

  $: selectedNetwork, showErrorIfAny();

  const onClickQRCode = () => dispatcher("nnsOpenQRCodeReader");
</script>

<InputWithError
  inputType="text"
  placeholderLabelKey="accounts.address"
  name="accounts-address"
  bind:value={address}
  errorMessage={showError ? $i18n.error.address_not_valid : undefined}
  showInfo={$$slots.label !== undefined}
  on:blur={onBlur}
  ><slot name="label" slot="label" />

  <svelte:fragment slot="inner-end">
    {#if qrCode}
      <button
        type="button"
        data-tid="address-qr-code-scanner"
        class="icon-only"
        on:click|stopPropagation={onClickQRCode}
        aria-label={$i18n.accounts.scan_qr_code_alt}
        ><IconQRCodeScanner /></button
      >
    {/if}
  </svelte:fragment>
</InputWithError>
