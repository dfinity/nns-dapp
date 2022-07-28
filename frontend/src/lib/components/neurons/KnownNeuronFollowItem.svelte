<script lang="ts">
  import type { KnownNeuron, NeuronId, Topic } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { addFollowee, removeFollowee } from "../../services/neurons.services";
  import { busy, startBusy, stopBusy } from "../../stores/busy.store";
  import { i18n } from "../../stores/i18n";

  export let knownNeuron: KnownNeuron;
  export let topic: Topic;
  export let neuronId: NeuronId;
  export let isFollowed: boolean = false;

  const dispatcher = createEventDispatcher();
  const toggleKnownNeuronFollowee = async () => {
    startBusy({ initiator: "add-followee" });

    const toggleFollowee = isFollowed ? removeFollowee : addFollowee;
    await toggleFollowee({
      neuronId,
      topic,
      followee: knownNeuron.id,
    });

    stopBusy("add-followee");
    dispatcher("nnsUpdated");
  };
</script>

<div data-tid={`known-neuron-item-${knownNeuron.id}`}>
  <p class="value">{knownNeuron.name}</p>
  <!-- TODO: Fix style while loading - https://dfinity.atlassian.net/browse/L2-404 -->
  <button
    class="primary small"
    disabled={$busy}
    on:click={toggleKnownNeuronFollowee}
  >
    {#if isFollowed}
      {$i18n.new_followee.unfollow}
    {:else}
      {$i18n.new_followee.follow}
    {/if}
  </button>
</div>

<style lang="scss">
  div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
