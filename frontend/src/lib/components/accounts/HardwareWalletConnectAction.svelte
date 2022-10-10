<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { LedgerConnectionState } from "$lib/constants/ledger.constants";
  import { Spinner } from "@dfinity/gix-components";
  import type { LedgerIdentity } from "$lib/identities/ledger.identity";
  import HardwareWalletInfo from "./HardwareWalletInfo.svelte";
  import { connectToHardwareWalletProxy } from "$lib/proxy/ledger.services.proxy";

  export let connectionState: LedgerConnectionState =
    LedgerConnectionState.NOT_CONNECTED;

  export let ledgerIdentity: LedgerIdentity | undefined = undefined;

  const connect = async () =>
    await connectToHardwareWalletProxy(
      ({ ledgerIdentity: identity, connectionState: state }) => {
        connectionState = state;
        ledgerIdentity = identity;
      }
    );

  let connecting: boolean;
  let connected: boolean;
  $: connecting = connectionState === LedgerConnectionState.CONNECTING;
  $: connected =
    connectionState === LedgerConnectionState.CONNECTED &&
    ledgerIdentity !== undefined;
</script>

{#if connected && ledgerIdentity !== undefined}
  <p class="description">{$i18n.accounts.hardware_wallet_connected}</p>
  <HardwareWalletInfo {ledgerIdentity} />
{:else}
  <p class="label">{$i18n.accounts.connect_hardware_wallet_text}</p>
  <div class="connect">
    {#if connecting}
      <!-- // TODO(L2-433): spinner processing accessibility -->
      <Spinner inline />
    {:else}
      <button
        class="primary"
        type="button"
        on:click|stopPropagation={connect}
        data-tid="ledger-connect-button"
      >
        {$i18n.accounts.connect_hardware_wallet}
      </button>
    {/if}
  </div>
{/if}

<style lang="scss">
  h4,
  p {
    margin-bottom: var(--padding-2x);
  }

  .connect {
    min-height: var(--button-min-height);
    width: fit-content;
  }
</style>
