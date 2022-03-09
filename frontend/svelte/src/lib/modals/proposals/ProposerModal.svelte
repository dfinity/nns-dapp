<script lang="ts">
  import Modal from "../Modal.svelte";
  import type { NeuronId } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import { NeuronInfo } from "@dfinity/nns";
  import { getNeuron } from "../../services/neurons.services";
  import Spinner from "../../components/ui/Spinner.svelte";
  import NeuronCard from "../../components/neurons/NeuronCard.svelte";
  import { toastsStore } from "../../stores/toasts.store";
  import { onMount } from "svelte";
  import VotingHistoryCard from "../../components/neurons/VotingHistoryCard.svelte";

  export let proposer: NeuronId;
  let neuron: NeuronInfo | undefined;

  onMount(async () => {
    try {
      neuron = await getNeuron(proposer);
    } catch (err) {
      neuron = undefined;

      toastsStore.show({ labelKey: "error.get_neuron", level: "error" });
      console.error(err);
    }
  });
</script>

<Modal on:nnsClose theme="dark">
  <span slot="title">{$i18n.neuron_detail.title}</span>

  {#if neuron !== undefined}
    <div class="content">
      <NeuronCard {neuron} />

      <VotingHistoryCard {neuron} />
    </div>
  {:else}
    <Spinner />
  {/if}
</Modal>

<style lang="scss">
  .content {
    padding: calc(2 * var(--padding));
  }
</style>
