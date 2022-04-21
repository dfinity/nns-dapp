<script lang="ts">
  import Modal from "../Modal.svelte";
  import type { NeuronId } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import Input from "../../components/ui/Input.svelte";
  import { ACCOUNT_ADDRESS_MIN_LENGTH } from "../../constants/accounts.constants";

  export let neuronId: NeuronId;

  let address: string = "";

  const add = () => {
    console.log("adding", neuronId);
  };
</script>

<Modal on:nnsClose theme="dark" size="medium">
  <span slot="title">{$i18n.neuron_detail.add_hotkey_modal_title}</span>
  <section data-tid="add-hotkey-neuron-modal">
    <div class="input-wrapper">
      <h5>{$i18n.neuron_detail.enter_hotkey}</h5>
      <Input
        inputType="text"
        placeholderLabelKey="accounts.address"
        name="accounts-address"
        bind:value={address}
        minLength={ACCOUNT_ADDRESS_MIN_LENGTH}
        theme="dark"
      />
    </div>

    <button
      data-tid="add-hotkey-neuron-button"
      class="primary full-width"
      on:click={add}
    >
      {$i18n.core.confirm}
    </button>
  </section>
</Modal>

<style lang="scss">
  @use "../../themes/mixins/modal.scss";

  section {
    @include modal.section;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
    gap: var(--padding);
  }

  .input-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
