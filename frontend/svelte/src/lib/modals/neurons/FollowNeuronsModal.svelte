<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import EditFollowNeurons from "../../components/neurons/EditFollowNeurons.svelte";
  import { i18n } from "../../stores/i18n";
  import Modal from "../Modal.svelte";

  export let neuron: NeuronInfo;
</script>

<Modal theme="dark" size="medium" on:nnsClose>
  <span slot="title">{$i18n.neurons.follow_neurons_screen}</span>
  <section>
    <EditFollowNeurons {neuron} />
  </section>
</Modal>

<style lang="scss">
  section {
    height: min(500px, calc(100vh - 156px - (2 * var(--padding))));
    margin: 0;
    padding: calc(2 * var(--padding));
    max-width: 100%;
  }
</style>
