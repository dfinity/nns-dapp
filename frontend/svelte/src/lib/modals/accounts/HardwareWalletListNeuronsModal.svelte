<script lang="ts">
  import Modal from "../Modal.svelte";
  import { i18n } from "../../stores/i18n";
  import HardwareWalletNeurons from "../../components/accounts/HardwareWalletNeurons.svelte";
  import type { NeuronInfo } from "@dfinity/nns";
  import type {Account} from '../../types/account';

  export let selectedAccount: Account | undefined;
  export let neurons: NeuronInfo[];
</script>

<Modal on:nnsClose theme="dark" size="big">
  <span slot="title">{$i18n.neurons.title}</span>

  <div>
    <HardwareWalletNeurons {neurons} {selectedAccount} />
  </div>
</Modal>

<style lang="scss">
  div {
    padding: var(--padding-2x);
  }
</style>
