<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { LedgerConnectionState } from "../../constants/ledger.constants";
  import Spinner from "../ui/Spinner.svelte";
  import type { LedgerIdentity } from "../../identities/ledger.identity";
  import HardwareWalletInfo from "./HardwareWalletInfo.svelte";
  import { connectToHardwareWalletProxy } from "../../proxy/ledger.services.proxy";

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
  <h4>{$i18n.accounts.hardware_wallet_connected}</h4>
  <HardwareWalletInfo {ledgerIdentity} />
{:else}
  <p>{$i18n.accounts.connect_hardware_wallet_text}</p>
  <div class="connect">
    {#if connecting}
      <!-- // TODO(L2-433): spinner processing accessibility -->
      <Spinner />
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
  }
</style>
