<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { addHotkeyForHardwareWalletNeuron } from "../../services/neurons.services";
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import type { NeuronId } from "@dfinity/nns";
  import { authStore } from "../../stores/auth.store";
  import { busy } from "../../stores/busy.store";

  export let account: Account;
  export let neuronId: NeuronId;

  const dispatcher = createEventDispatcher();
  const skip = () => {
    dispatcher("nnsSkip");
  };

  // Add the auth identity principal as hotkey
  const addCurrentUserToHotkey = async () => {
    // This screen is only for hardware wallet.
    const { success } = await addHotkeyForHardwareWalletNeuron({
      neuronId,
      accountIdentifier: account.identifier,
    });

    if (success) {
      dispatcher("nnsHotkeyAdded");
    }
  };
</script>

<div class="wizard-wrapper" data-tid="add-principal-to-hotkeys-modal">
  <div class="info">
    <h5>{$i18n.neurons.add_user_as_hotkey_message}</h5>
    <div>
      <h5>{$i18n.neurons.your_principal}</h5>
      <p>{$authStore.identity?.getPrincipal().toText() ?? ""}</p>
    </div>
  </div>
  <div class="buttons">
    <button
      on:click={skip}
      data-tid="skip-add-principal-to-hotkey-modal"
      class="primary full-width">{$i18n.neurons.skip}</button
    >
    <button
      class="primary full-width"
      on:click={addCurrentUserToHotkey}
      data-tid="confirm-add-principal-to-hotkey-modal"
      disabled={$authStore.identity?.getPrincipal() === undefined || $busy}
    >
      {$i18n.neuron_detail.add_hotkey}
    </button>
  </div>
</div>

<style lang="scss">
  .info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--padding-3x);
  }

  .buttons {
    display: flex;
    gap: var(--padding);
  }
</style>
