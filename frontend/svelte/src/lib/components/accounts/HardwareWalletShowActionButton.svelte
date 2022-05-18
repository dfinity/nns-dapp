<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { showAddressAndPubKeyOnHardwareWalletProxy } from "../../proxy/ledger.services.proxy";
  import { busy } from "../../stores/busy.store";

  const showInfo = async () =>
    await showAddressAndPubKeyOnHardwareWalletProxy();
</script>

<button
  class="primary small"
  type="button"
  on:click={showInfo}
  data-tid="ledger-show-button"
  disabled={$busy}
>
  {$i18n.accounts.show_info_hardware_wallet}
</button>
