<script lang="ts">
  import { Modal } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import ReceiveAddressQRCode from "$lib/components/accounts/ReceiveAddressQRCode.svelte";
  import type { Account } from "$lib/types/account";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { createEventDispatcher } from "svelte";

  export let account: Account;
  export let qrCodeLabel: string;
  export let logo: string;
  export let logoArialLabel: string;
  export let reloadAccount: () => Promise<void>;

  let modalRendered = false;

  const onIntroEnd = () => (modalRendered = true);

  const dispatcher = createEventDispatcher();

  const reloadAccountAndClose = async () => {
    startBusy({
      initiator: "reload-ckbtc-account",
    });

    reloadAccount();
    dispatcher("nnsClose");

    stopBusy("reload-ckbtc-account");
  };
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

  <div class="toolbar">
    <button
      class="primary"
      on:click={reloadAccountAndClose}
      data-tid="reload-ckbtc-account">{$i18n.core.done}</button
    >
  </div>
</Modal>

<style lang="scss">
  button.primary {
    width: 100%;
  }
</style>
