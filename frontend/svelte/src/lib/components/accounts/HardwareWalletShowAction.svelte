<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { showAddressAndPubKeyOnHardwareWalletProxy } from "../../proxy/ledger.services.proxy";

  const showInfo = async () =>
    await showAddressAndPubKeyOnHardwareWalletProxy();
</script>

<button class="primary" type="button" on:click={showInfo}>
  {$i18n.accounts.show_info_hardware_wallet}
</button>
