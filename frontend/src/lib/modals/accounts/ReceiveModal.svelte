<script lang="ts">
  import ReceiveAddressQRCode from "$lib/components/accounts/ReceiveAddressQRCode.svelte";
  import ReceiveSelectAccountDropdown from "$lib/components/accounts/ReceiveSelectAccountDropdown.svelte";
  import { QR_CODE_RENDERED_DEFAULT_STATE } from "$lib/constants/mockable.constants";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { Modal } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  export let universeId: UniverseCanisterId | undefined = undefined;
  export let account: Account | undefined;
  export let qrCodeLabel: string;
  export let logo: string;
  export let logoArialLabel: string;
  export let reload: (() => Promise<void>) | undefined;
  export let canSelectAccount: boolean;
  export let tokenSymbol: string;

  let qrCodeRendered = QR_CODE_RENDERED_DEFAULT_STATE;

  let modalRendered = false;

  const onIntroEnd = () => (modalRendered = true);

  const dispatcher = createEventDispatcher();

  const reloadAccountAndClose = async () => {
    startBusy({
      initiator: "reload-receive-account",
    });

    await reload?.();
    dispatcher("nnsClose");

    stopBusy("reload-receive-account");
  };
</script>

<Modal testId="receive-modal" on:nnsClose on:introend={onIntroEnd}>
  <span slot="title"
    >{replacePlaceholders($i18n.core.receive_with_token, {
      $token: tokenSymbol,
    })}</span
  >

  <ReceiveSelectAccountDropdown
    {account}
    on:nnsSelectedAccount={({ detail }) => (account = detail)}
    {canSelectAccount}
    {universeId}
  />

  <ReceiveAddressQRCode
    address={account?.identifier}
    renderQRCode={modalRendered}
    {qrCodeLabel}
    {logo}
    {logoArialLabel}
    logoSize="big"
    bind:qrCodeRendered
  >
    <slot name="address-label" slot="address-label" />
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
