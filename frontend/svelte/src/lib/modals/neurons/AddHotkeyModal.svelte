<script lang="ts">
  import Modal from "../Modal.svelte";
  import { Principal } from "@dfinity/principal";
  import type { NeuronId } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import Input from "../../components/ui/Input.svelte";
  import { startBusy, stopBusy } from "../../stores/busy.store";
  import { addHotkey } from "../../services/neurons.services";
  import { toastsStore } from "../../stores/toasts.store";
  import Spinner from "../../components/ui/Spinner.svelte";
  import { createEventDispatcher } from "svelte";

  export let neuronId: NeuronId;

  let address: string = "";
  let showAddressNotValid: boolean = false;
  let loading: boolean = false;

  const dispatcher = createEventDispatcher();
  const add = async () => {
    let principal: Principal | undefined = undefined;
    try {
      principal = Principal.fromText(address);
      // TODO: Validate principal on blur https://dfinity.atlassian.net/browse/L2-470
      showAddressNotValid = false;
    } catch (error) {
      showAddressNotValid = true;
    }
    if (principal !== undefined) {
      startBusy("add-hotkey-neuron");
      loading = true;
      const response = await addHotkey({ neuronId, principal });
      if (response !== undefined) {
        toastsStore.show({
          level: "info",
          labelKey: "neuron_detail.add_hotkey_success",
        });
      }
      loading = false;
      stopBusy("add-hotkey-neuron");
      dispatcher("nnsClose");
    } else {
      // Edge case, `Principal.fromText` will raise an error instead of returning undefined
      showAddressNotValid = true;
    }
  };
</script>

<Modal on:nnsClose theme="dark" size="medium">
  <span slot="title">{$i18n.neuron_detail.add_hotkey_modal_title}</span>
  <form on:submit|preventDefault={add} data-tid="add-hotkey-neuron-modal">
    <div class="input-wrapper">
      <h5>{$i18n.neuron_detail.enter_hotkey}</h5>
      <Input
        inputType="text"
        placeholderLabelKey="neuron_detail.add_hotkey_placeholder"
        name="hotkey-principal"
        bind:value={address}
        theme="dark"
      />
      <!-- TODO: Improve UX https://dfinity.atlassian.net/browse/L2-470 -->
      {#if showAddressNotValid}
        <p>{$i18n.error.principal_not_valid}</p>
      {/if}
    </div>

    <button
      data-tid="add-hotkey-neuron-button"
      class="primary full-width"
      type="submit"
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

    p {
      // TODO: improve color https://dfinity.atlassian.net/browse/L2-476
      font-size: var(--font-size-ultra-small);
    }
  }
</style>
