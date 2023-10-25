<script lang="ts">
  import { invalidIcpAddress } from "$lib/utils/accounts.utils";
  import { i18n } from "$lib/stores/i18n";
  import SelectDestinationAddress from "$lib/components/accounts/SelectDestinationAddress.svelte";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { TransactionNetwork } from "$lib/types/transaction";
  import { createEventDispatcher } from "svelte";
  import { assertNonNullish } from "@dfinity/utils";

  export let showManualAddress = false;
  export let selectedDestinationAddress: string | undefined = undefined;

  const onEnterAddress = () => {
    // The button is only enabled when the address is valid, so we know that the
    // address is not undefined here.
    assertNonNullish(selectedDestinationAddress);
    chooseDestinationAddress(selectedDestinationAddress);
  };

  const dispatcher = createEventDispatcher();
  const chooseDestinationAddress = (destinationAddress: string) =>
    dispatcher("nnsAddress", { address: destinationAddress });
</script>

<form
  data-tid="nns-destination-address-component"
  on:submit|preventDefault={onEnterAddress}
>
  <SelectDestinationAddress
    rootCanisterId={OWN_CANISTER_ID}
    bind:selectedDestinationAddress
    selectedNetwork={TransactionNetwork.ICP}
    bind:showManualAddress
    on:nnsOpenQRCodeReader
  />
  <div class="toolbar">
    <button
      class="primary"
      type="submit"
      data-tid="address-submit-button"
      disabled={invalidIcpAddress(selectedDestinationAddress)}
    >
      {$i18n.core.continue}
    </button>
  </div>
</form>
