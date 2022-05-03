<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { LedgerConnectionState } from "../../constants/ledger.constants";

  let connectionState: LedgerConnectionState = LedgerConnectionState.CONNECTING;

  const connect = async () => {
    const { connectToHardwareWallet } = await import(
      "../../services/ledger.services"
    );

    await connectToHardwareWallet(
      (state: LedgerConnectionState) => (connectionState = state)
    );
  };

  const onSubmit = () => {
    // TODO: Attach wallet
  };

  let disabled: boolean;
  $: disabled = connectionState !== LedgerConnectionState.CONNECTED;
</script>

<form on:submit|preventDefault={onSubmit} class="wizard-wrapper">
  <button
    class="primary full-width"
    type="button"
    on:click|stopPropagation={connect}
  >
    {$i18n.core.continue}
  </button>

  <button class="primary full-width" type="submit" {disabled}>
    {$i18n.core.continue}
  </button>
</form>
