<script lang="ts">
  import HardwareWalletInfo from "$lib/components/accounts/HardwareWalletInfo.svelte";
  import { LedgerConnectionState } from "$lib/constants/ledger.constants";
  import type { LedgerIdentity } from "$lib/identities/ledger.identity";
  import { connectToHardwareWalletProxy } from "$lib/proxy/icp-ledger.services.proxy";
  import { i18n } from "$lib/stores/i18n";
  import { Spinner } from "@dfinity/gix-components";

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
  p {
    margin-bottom: var(--padding-2x);
  }

  .connect {
    min-height: var(--button-min-height);
    width: fit-content;
  }
</style>
