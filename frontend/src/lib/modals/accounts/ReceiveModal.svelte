<script lang="ts">
  import { Modal } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import ReceiveAddressQRCode from "$lib/components/accounts/ReceiveAddressQRCode.svelte";
  import type { Account } from "$lib/types/account";

  export let account: Account;
  export let qrCodeLabel: string;
  export let logo: string;
  export let logoArialLabel: string;

  let modalRendered = false;

  const onIntroEnd = () => (modalRendered = true);
</script>

<Modal testId="receive-modal" on:nnsClose on:introend={onIntroEnd}>
  <span slot="title">{$i18n.ckbtc.receive}</span>

  <ReceiveAddressQRCode
    address={account.identifier}
    renderQRCode={modalRendered}
    {qrCodeLabel}
    {logo}
    {logoArialLabel}
    logoSize="big"
  >
    <svelte:fragment slot="description">TODO A DESCRIPTION</svelte:fragment>
  </ReceiveAddressQRCode>
</Modal>
