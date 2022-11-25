<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { showAddressAndPubKeyOnHardwareWalletProxy } from "$lib/proxy/ledger.services.proxy";
  import { busy } from "@dfinity/gix-components";

  const showInfo = async () =>
    await showAddressAndPubKeyOnHardwareWalletProxy();
</script>

<button
  class="secondary"
  type="button"
  on:click={showInfo}
  data-tid="ledger-show-button"
  disabled={$busy}
>
  {$i18n.accounts.show_info_hardware_wallet}
</button>
