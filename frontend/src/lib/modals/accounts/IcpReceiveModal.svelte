<script lang="ts">
  import { Modal } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import ReceiveAddressQRCode from "$lib/components/accounts/ReceiveAddressQRCode.svelte";
  import type { Account } from "$lib/types/account";
  import IC_LOGO from "$lib/assets/icp.svg";

  export let account: Account;

  let modalRendered = false;

  const onIntroEnd = () => (modalRendered = true);
</script>

<Modal testId="receive-modal" on:nnsClose on:introend={onIntroEnd}>
  <span slot="title">{$i18n.ckbtc.receive}</span>

  <ReceiveAddressQRCode
    address={account.identifier}
    renderQRCode={modalRendered}
    qrCodeLabel={$i18n.wallet.qrcode_aria_label_icp}
    logo={IC_LOGO}
    logoArialLabel={$i18n.core.icp}
  >
    <svelte:fragment slot="description">TODO A DESCRIPTION</svelte:fragment>
  </ReceiveAddressQRCode>
</Modal>
