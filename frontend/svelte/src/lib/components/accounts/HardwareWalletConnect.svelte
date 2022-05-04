<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { LedgerConnectionState } from "../../constants/ledger.constants";
  import HardwareWalletConnectAction from "./HardwareWalletConnectAction.svelte";

  let connectionState: LedgerConnectionState =
    LedgerConnectionState.NOT_CONNECTED;

  const onSubmit = () => {
    // TODO(L2-433): Attach wallet
    alert("TODO(L2-433): Attach wallet");
  };

  let disabled: boolean;
  $: disabled = connectionState !== LedgerConnectionState.CONNECTED;
</script>

<form on:submit|preventDefault={onSubmit} class="wizard-wrapper">
  <div>
    <HardwareWalletConnectAction bind:connectionState />
  </div>

  <button
    class="primary full-width submit"
    type="submit"
    {disabled}
    data-tid="ledger-attach-button"
  >
    {$i18n.accounts.attach_wallet}
  </button>
</form>

<style lang="scss">
  @use "../../themes/mixins/modal.scss";

  form {
    @include modal.wizard-single-input-form;
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
