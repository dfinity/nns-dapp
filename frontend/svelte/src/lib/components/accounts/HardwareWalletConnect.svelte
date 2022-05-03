<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { LedgerConnectionState } from "../../constants/ledger.constants";
  import Spinner from "../ui/Spinner.svelte";
  import { LedgerIdentity } from "../../identities/ledger.identity";
  import HardwareWalletInfo from "./HardwareWalletInfo.svelte";

  let connectionState: LedgerConnectionState =
    LedgerConnectionState.NOT_CONNECTED;
  let ledgerIdentity: LedgerIdentity | undefined = undefined;

  const connect = async () => {
    const { connectToHardwareWallet } = await import(
      "../../services/ledger.services"
    );

    await connectToHardwareWallet(
      ({ ledgerIdentity: identity, connectionState: state }) => {
        connectionState = state;
        ledgerIdentity = identity;
      }
    );
  };

  const onSubmit = () => {
    // TODO(L2-433): Attach wallet
    alert("TODO(L2-433): Attach wallet");
  };

  let disabled, connecting, connected: boolean;
  $: disabled = connectionState !== LedgerConnectionState.CONNECTED;
  $: connecting = connectionState === LedgerConnectionState.CONNECTING;
  $: connected =
    connectionState === LedgerConnectionState.CONNECTED &&
    ledgerIdentity !== undefined;
</script>

<form on:submit|preventDefault={onSubmit} class="wizard-wrapper">
  <div>
    {#if connected}
      <h4>Connected to Hardware Wallet</h4>
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
          >
            {$i18n.accounts.connect_hardware_wallet}
          </button>
        {/if}
      </div>
    {/if}
  </div>

  <button class="primary full-width submit" type="submit" {disabled}>
    {$i18n.accounts.attach_wallet}
  </button>
</form>

<style lang="scss">
  @use "../../themes/mixins/modal.scss";

  form {
    @include modal.wizard-single-input-form;
  }

  h4,
  p {
    margin-bottom: var(--padding-2x);
  }

  .connect {
    min-height: var(--button-min-height);
  }

  .submit {
    opacity: 0;
    visibility: hidden;
    transition: opacity 150ms, visibility 150ms;

    &:not([disabled]) {
      opacity: 1;
      visibility: visible;
    }
  }
</style>
