<script lang="ts">
  import Modal from "../Modal.svelte";
  import { i18n } from "../../stores/i18n";
  import HardwareWalletNeurons from "../../components/accounts/HardwareWalletNeurons.svelte";
  import type { NeuronInfo } from "@dfinity/nns";

  export let neurons: NeuronInfo[];
</script>

<Modal on:nnsClose theme="dark" size="medium">
  <span slot="title">{$i18n.neurons.title}</span>

  <div>
    <HardwareWalletNeurons {neurons} />
  </div>
</Modal>

<style lang="scss">
  div {
    padding: var(--padding-2x);
  }
</style>
