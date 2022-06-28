<script lang="ts">
  import Modal from "../Modal.svelte";
  import type { NeuronId } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import Spinner from "../../components/ui/Spinner.svelte";
  import NeuronCard from "../../components/neurons/NeuronCard.svelte";
  import { toastsStore } from "../../stores/toasts.store";
  import { createEventDispatcher, onMount } from "svelte";
  import VotingHistoryCard from "../../components/neurons/VotingHistoryCard.svelte";
  import { authStore } from "../../stores/auth.store";
  import { loadNeuron } from "../../services/neurons.services";

  export let neuronId: NeuronId;
  let neuron: NeuronInfo | undefined;

  const dispatch = createEventDispatcher();

  onMount(async () => {
    if (!$authStore.identity) {
      toastsStore.error({ labelKey: "error.missing_identity" });
      return;
    }

    // The fetched neuron doesn't belong to a user so it should not be added to the neuronsStore
    await loadNeuron({
      neuronId,
      setNeuron: ({ neuron: neuronInfo }) => (neuron = neuronInfo),
      handleError: () => {
        neuron = undefined;
        dispatch("nnsClose");
      },
    });
  });
</script>

<Modal testId="voting-history-modal" on:nnsClose size="big">
  <span slot="title">{$i18n.neuron_detail.title}</span>

  {#if neuron !== undefined}
    <div class="content">
      <NeuronCard proposerNeuron {neuron} />

      <VotingHistoryCard {neuron} />
    </div>
  {:else}
    <Spinner />
  {/if}
</Modal>

<style lang="scss">
  .content {
    padding: var(--padding-2x);
  }
</style>
