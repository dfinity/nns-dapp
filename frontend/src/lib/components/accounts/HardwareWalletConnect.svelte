<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { LedgerConnectionState } from "../../constants/ledger.constants";
  import HardwareWalletConnectAction from "./HardwareWalletConnectAction.svelte";
  import { toastsStore } from "../../stores/toasts.store";
  import { registerHardwareWalletProxy } from "../../proxy/ledger.services.proxy";
  import {
    ADD_ACCOUNT_CONTEXT_KEY,
    type AddAccountContext,
  } from "../../types/add-account.context";
  import { createEventDispatcher, getContext } from "svelte";
  import type { LedgerIdentity } from "../../identities/ledger.identity";
  import { busy, startBusy, stopBusy } from "../../stores/busy.store";
  import FooterModal from "../../modals/FooterModal.svelte";

  let connectionState: LedgerConnectionState =
    LedgerConnectionState.NOT_CONNECTED;

  let ledgerIdentity: LedgerIdentity | undefined = undefined;

  const context: AddAccountContext = getContext<AddAccountContext>(
    ADD_ACCOUNT_CONTEXT_KEY
  );

  const { store, back }: AddAccountContext = context;

  const dispatcher = createEventDispatcher();

  const onSubmit = async () => {
    if (disabled) {
      toastsStore.error({
        labelKey: "error__attach_wallet.connect",
      });
      return;
    }

    startBusy({ initiator: "accounts" });

    await registerHardwareWalletProxy({
      name: $store.hardwareWalletName,
      ledgerIdentity,
    });

    stopBusy("accounts");

    dispatcher("nnsClose");
  };

  let disabled: boolean;
  $: disabled = connectionState !== LedgerConnectionState.CONNECTED || $busy;
</script>

<form on:submit|preventDefault={onSubmit} class="wizard-wrapper">
  <div>
    <HardwareWalletConnectAction bind:connectionState bind:ledgerIdentity />
  </div>

  {#if !disabled}
    <FooterModal>
      <button class="secondary small" type="button" on:click={back}>
        {$i18n.accounts.edit_name}
      </button>
      <button
        class="primary small"
        type="submit"
        {disabled}
        data-tid="ledger-attach-button"
      >
        {$i18n.accounts.attach_wallet}
      </button>
    </FooterModal>
  {/if}
</form>

<style lang="scss">
  @use "../../themes/mixins/modal";

  form {
    @include modal.wizard-single-input-form;
  }
</style>
