<script lang="ts">
  import { Modal } from "@dfinity/gix-components";
  import type { NeuronId } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import { Spinner } from "@dfinity/gix-components";
  import NnsNeuronCard from "$lib/components/neurons/NnsNeuronCard.svelte";
  import { toastsError } from "$lib/stores/toasts.store";
  import { createEventDispatcher, onMount } from "svelte";
  import VotingHistoryCard from "$lib/components/neurons/VotingHistoryCard.svelte";
  import { authStore } from "$lib/stores/auth.store";
  import { loadNeuron } from "$lib/services/neurons.services";

  export let neuronId: NeuronId;
  let neuron: NeuronInfo | undefined;

  const dispatch = createEventDispatcher();

  onMount(async () => {
    if (!$authStore.identity) {
      toastsError({ labelKey: "error.missing_identity" });
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

<Modal testId="voting-history-modal" on:nnsClose>
  <span slot="title">{$i18n.neuron_detail.title}</span>

  {#if neuron !== undefined}
    <div class="content legacy">
      <NnsNeuronCard proposerNeuron {neuron} />

      <VotingHistoryCard {neuron} />
    </div>
  {:else}
    <Spinner />
  {/if}
</Modal>
