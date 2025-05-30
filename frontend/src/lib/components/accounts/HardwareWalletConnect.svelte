<script lang="ts">
  import HardwareWalletConnectAction from "$lib/components/accounts/HardwareWalletConnectAction.svelte";
  import { LedgerConnectionState } from "$lib/constants/ledger.constants";
  import type { LedgerIdentity } from "$lib/identities/ledger.identity";
  import { registerHardwareWalletProxy } from "$lib/proxy/icp-ledger.services.proxy";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError } from "$lib/stores/toasts.store";
  import {
    ADD_ACCOUNT_CONTEXT_KEY,
    type AddAccountContext,
  } from "$lib/types/add-account.context";
  import { busy } from "@dfinity/gix-components";
  import { createEventDispatcher, getContext } from "svelte";

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
      toastsError({
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

<form on:submit|preventDefault={onSubmit}>
  <div>
    <HardwareWalletConnectAction bind:connectionState bind:ledgerIdentity />
  </div>

  {#if !disabled}
    <div class="toolbar">
      <button class="secondary" type="button" on:click={back}>
        {$i18n.accounts.edit_name}
      </button>
      <button
        class="primary"
        type="submit"
        {disabled}
        data-tid="ledger-attach-button"
      >
        {$i18n.core.create}
      </button>
    </div>
  {/if}
</form>
