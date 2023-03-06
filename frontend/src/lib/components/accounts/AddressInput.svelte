<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import { invalidAddress, invalidBtcAddress } from "$lib/utils/accounts.utils";

  import InputWithError from "$lib/components/ui/InputWithError.svelte";
  import { TransactionNetwork } from "$lib/types/transaction";
  import { BtcNetwork } from "@dfinity/ckbtc";

  export let address = "";
  export let selectedNetwork: TransactionNetwork | undefined = undefined;

  let showError = false;
  const dispatcher = createEventDispatcher();
  const showErrorIfAny = () => {
    showError =
      address.length > 0 &&
      (selectedNetwork === TransactionNetwork.BTC_MAINNET ||
      selectedNetwork === TransactionNetwork.BTC_TESTNET
        ? invalidBtcAddress({
            address,
            network:
              selectedNetwork === TransactionNetwork.BTC_TESTNET
                ? BtcNetwork.Testnet
                : BtcNetwork.Mainnet,
          })
        : invalidAddress(address));
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
