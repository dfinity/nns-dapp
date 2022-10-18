<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { addHotkeyForHardwareWalletNeuron } from "$lib/services/neurons.services";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import type { NeuronId } from "@dfinity/nns";
  import { authStore } from "$lib/stores/auth.store";
  import { busy } from "$lib/stores/busy.store";

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

<div class="wrapper" data-tid="add-principal-to-hotkeys-modal">
  <p class="description">{$i18n.neurons.add_user_as_hotkey_message}</p>

  <div>
    <p class="label">{$i18n.neurons.your_principal}</p>
    <p class="value">{$authStore.identity?.getPrincipal().toText() ?? ""}</p>
  </div>

  <div class="toolbar">
    <button
      on:click={skip}
      data-tid="skip-add-principal-to-hotkey-modal"
      class="secondary">{$i18n.neurons.skip}</button
    >
    <button
      class="primary"
      on:click={addCurrentUserToHotkey}
      data-tid="confirm-add-principal-to-hotkey-modal"
      disabled={$authStore.identity?.getPrincipal() === undefined || $busy}
    >
      {$i18n.neuron_detail.add_hotkey}
    </button>
  </div>
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }
</style>
