<script lang="ts">
  import { Modal } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import ReceiveAddressQRCode from "$lib/components/accounts/ReceiveAddressQRCode.svelte";
  import type { Account } from "$lib/types/account";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { createEventDispatcher, onMount } from "svelte";
  import { QR_CODE_RENDERED } from "$lib/constants/environment.constants";
  import SelectAccountDropdown from "$lib/components/accounts/SelectAccountDropdown.svelte";
  import type { UniverseCanisterId } from "$lib/types/universe";

  export let universeId: UniverseCanisterId;
  export let account: Account | undefined;
  export let qrCodeLabel: string;
  export let logo: string;
  export let logoArialLabel: string;
  export let reloadAccount: (() => Promise<void>) | undefined;
  export let canSelectAccount: boolean;

  let qrCodeRendered = QR_CODE_RENDERED;

  let modalRendered = false;

  const onIntroEnd = () => (modalRendered = true);

  const dispatcher = createEventDispatcher();

  const reloadAccountAndClose = async () => {
    startBusy({
      initiator: "reload-receive-account",
    });

    await reloadAccount?.();
    dispatcher("nnsClose");

    stopBusy("reload-receive-account");
  };
</script>

<Modal testId="receive-modal" on:nnsClose on:introend={onIntroEnd}>
  <span slot="title">{$i18n.ckbtc.receive}</span>

  {#if canSelectAccount}
    <div class="source">
      <span class="label">{$i18n.accounts.receive_account}</span>

      <SelectAccountDropdown
        rootCanisterId={universeId}
        bind:selectedAccount={account}
      />
    </div>
  {/if}

  <ReceiveAddressQRCode
    address={account?.identifier}
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

  .source {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
    padding: 0 0 var(--padding-2x);
  }
</style>
