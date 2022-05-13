<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { getIdentity } from "../../services/auth.services";
  import { addHotkeyFromHW } from "../../services/neurons.services";
  import { startBusy, stopBusy } from "../../stores/busy.store";
  import { i18n } from "../../stores/i18n";
  import Spinner from "../ui/Spinner.svelte";
  import { toastsStore } from "../../stores/toasts.store";
  import type { Account } from "../../types/account";
  import type { NeuronInfo } from "@dfinity/nns";
  import { authStore } from "../../stores/auth.store";

  export let account: Account;
  export let neuron: NeuronInfo;

  let loading: boolean = false;

  const dispatcher = createEventDispatcher();
  const dispatchNext = () => {
    dispatcher("nnsNext");
  };

  // Add the auth identity principal as hotkey
  const addCurrentUserToHotkey = async () => {
    loading = true;
    startBusy("add-hotkey-neuron");
    const identity = await getIdentity();
    const neuronId = await addHotkeyFromHW({
      neuronId: neuron.neuronId,
      principal: identity.getPrincipal(),
      accountIdentifier: account.identifier,
    });
    loading = false;
    stopBusy("add-hotkey-neuron");
    if (neuronId !== undefined) {
      toastsStore.success({
        labelKey: "neurons.add_user_as_hotkey_success",
      });
      dispatchNext();
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
      on:click={dispatchNext}
      data-tid="skip-add-principal-to-hotkey-modal"
      class="secondary full-width">{$i18n.neurons.skip}</button
    >
    <button
      class="primary full-width"
      on:click={addCurrentUserToHotkey}
      data-tid="confirm-add-principal-to-hotkey-modal"
      disabled={$authStore.identity?.getPrincipal() === undefined}
    >
      {#if loading}
        <Spinner />
      {:else}
        {$i18n.neuron_detail.add_hotkey}
      {/if}
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
