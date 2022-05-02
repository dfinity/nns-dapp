<script lang="ts">
  import Modal from "../Modal.svelte";
  import { Principal } from "@dfinity/principal";
  import type { NeuronId } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import { startBusy, stopBusy } from "../../stores/busy.store";
  import { addHotkey } from "../../services/neurons.services";
  import { toastsStore } from "../../stores/toasts.store";
  import Spinner from "../../components/ui/Spinner.svelte";
  import { createEventDispatcher } from "svelte";
  import { getPrincipalFromString } from "../../utils/accounts.utils";
  import InputWithError from "../../components/ui/InputWithError.svelte";

  export let neuronId: NeuronId;

  let address: string = "";
  let validPrincipal: Principal | undefined;
  $: validPrincipal = getPrincipalFromString(address);
  let showError: boolean = false;
  let loading: boolean = false;

  // Used to hide error when address changes.
  let prevValidatedAddress: string | undefined;
  const validateHotkey = () => {
    // Hide error if no value
    if (address.length === 0) {
      showError = false;
      prevValidatedAddress = undefined;
      return;
    }
    try {
      prevValidatedAddress = address;
      Principal.fromText(address);
      showError = false;
    } catch (_) {
      showError = true;
    }
  };
  // Update `showError` to ensure we hide the error on input change
  $: showError =
    prevValidatedAddress !== undefined && prevValidatedAddress !== address
      ? false
      : showError;

  const dispatcher = createEventDispatcher();
  const add = async () => {
    if (validPrincipal !== undefined) {
      startBusy("add-hotkey-neuron");
      loading = true;
      const response = await addHotkey({ neuronId, principal: validPrincipal });
      if (response !== undefined) {
        toastsStore.success({
          labelKey: "neuron_detail.add_hotkey_success",
        });
      }
      loading = false;
      stopBusy("add-hotkey-neuron");
      dispatcher("nnsClose");
    } else {
      // Edge case, button is not enabled without `validPrincipal`.
      showError = true;
    }
  };
</script>

<Modal on:nnsClose theme="dark" size="medium">
  <span slot="title">{$i18n.neuron_detail.add_hotkey_modal_title}</span>
  <form on:submit|preventDefault={add} data-tid="add-hotkey-neuron-modal">
    <div class="input-wrapper">
      <h5>{$i18n.neuron_detail.enter_hotkey}</h5>
      <InputWithError
        inputType="text"
        placeholderLabelKey="neuron_detail.add_hotkey_placeholder"
        name="hotkey-principal"
        bind:value={address}
        theme="dark"
        errorMessage={showError ? $i18n.error.principal_not_valid : undefined}
        on:blur={validateHotkey}
      />
    </div>

    <button
      data-tid="add-hotkey-neuron-button"
      class="primary full-width"
      type="submit"
      disabled={validPrincipal === undefined}
    >
      {#if loading}
        <Spinner />
      {:else}
        {$i18n.core.confirm}
      {/if}
    </button>
  </form>
</Modal>

<style lang="scss">
  @use "../../themes/mixins/modal.scss";

  form {
    @include modal.section;
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .input-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
