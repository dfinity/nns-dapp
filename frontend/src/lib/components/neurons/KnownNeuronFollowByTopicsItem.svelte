<script lang="ts">
  import { setFollowing } from "$lib/services/neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { busy } from "@dfinity/gix-components";
  import type { KnownNeuron, NeuronId, Topic } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";

  export let knownNeuron: KnownNeuron;
  export let topics: Topic[] = [];
  export let neuronId: NeuronId;

  const dispatcher = createEventDispatcher();
  const followKnownNeuron = async () => {
    if (topics.length === 0) return;

    startBusy({ initiator: "add-followee" });
    // if (isFollowed) {
    //   await removeFollowing({
    //     neuronId,
    //     topics: topics,
    //     followee: knownNeuron.id,
    //   });
    // } else {
    await setFollowing({
      neuronId,
      topics,
      followee: knownNeuron.id,
    });

    stopBusy("add-followee");
    dispatcher("nnsUpdated");
  };
</script>

<div data-tid="known-neuron-item-component">
  <p class="value">{knownNeuron.name}</p>
  <button class="primary" disabled={$busy} on:click={followKnownNeuron}>
    {$i18n.new_followee.follow}
  </button>
</div>

<style lang="scss">
  div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
