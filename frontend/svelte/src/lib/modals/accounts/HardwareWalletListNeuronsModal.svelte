<script lang="ts">
  import Modal from "../Modal.svelte";
  import { i18n } from "../../stores/i18n";
  import HardwareWalletNeurons from "../../components/accounts/HardwareWalletNeurons.svelte";
</script>

<Modal on:nnsClose theme="dark" size="big">
  <span slot="title">{$i18n.neurons.title}</span>

  <div>
    <HardwareWalletNeurons />
  </div>
</Modal>

<style lang="scss">
  div {
    padding: var(--padding-2x);
  }
</style>
