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

  // Exposed for test purpose only because we are testing with jest without effectively loading the QR code
  export let qrCodeRendered = false;

  let modalRendered = false;

  const onIntroEnd = () => (modalRendered = true);

  const dispatcher = createEventDispatcher();

  const reloadAccountAndClose = async () => {
    startBusy({
      initiator: "reload-receive-account",
    });

    await reloadAccount();
    dispatcher("nnsClose");

    stopBusy("reload-receive-account");
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
    bind:qrCodeRendered
  >
    <slot name="title" slot="title" />
    <slot name="description" slot="description" />
  </ReceiveAddressQRCode>

  {#if modalRendered}
    <div class="toolbar">
      {#if qrCodeRendered}
        <button
          class="primary"
          on:click={reloadAccountAndClose}
          data-tid="reload-receive-account">{$i18n.core.finish}</button
        >
      {/if}
    </div>
  {/if}
</Modal>

<style lang="scss">
  button.primary {
    width: 100%;
  }
</style>
