<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { LedgerConnectionState } from "../../constants/ledger.constants";
  import Spinner from "../ui/Spinner.svelte";

  let connectionState: LedgerConnectionState = LedgerConnectionState.NOT_CONNECTED;

  const connect = async () => {
    const { connectToHardwareWallet } = await import(
      "../../services/ledger.services"
    );

    await connectToHardwareWallet(
      (state: LedgerConnectionState) => (connectionState = state)
    );
  };

  const onSubmit = () => {
    // TODO(L2-433): Attach wallet
    alert("TODO(L2-433): Attach wallet");
  };

  let disabled, connecting: boolean;
  $: disabled = connectionState !== LedgerConnectionState.CONNECTED;
  $: connecting = connectionState === LedgerConnectionState.CONNECTING;
</script>

<form on:submit|preventDefault={onSubmit} class="wizard-wrapper">
  <div>
    <p>{$i18n.accounts.connect_hardware_wallet_text}</p>
    <div class="connect">
      {#if connecting}
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
