<script lang="ts">
  import type { KnownNeuron, NeuronId, Topic } from "@dfinity/nns";
  import { addFollowee, removeFollowee } from "../../services/neurons.services";
  import { authStore } from "../../stores/auth.store";
  import { i18n } from "../../stores/i18n";
  import { toastsStore } from "../../stores/toasts.store";
  import Spinner from "../ui/Spinner.svelte";

  export let knownNeuron: KnownNeuron;
  export let topic: Topic;
  export let neuronId: NeuronId;
  export let isFollowed: boolean = false;

  let loading: boolean = false;

  const addKnownNeuronFollowee = async () => {
    loading = true;
    const toggleFollowee = isFollowed ? removeFollowee : addFollowee;
    await toggleFollowee({
      identity: $authStore.identity,
      neuronId: neuronId,
      topic,
      followee: knownNeuron.id,
    });
    loading = false;
    toastsStore.show({
      labelKey: "new_followee.success_add_followee",
      level: "info",
    });
  };
</script>

<div data-tid={`known-neuron-item-${knownNeuron.id}`}>
  <p>{knownNeuron.name}</p>
  <!-- TODO: Fix style while loading - https://dfinity.atlassian.net/browse/L2-404 -->
  <button class="secondary small" on:click={addKnownNeuronFollowee}>
    {#if loading}
      <Spinner />
    {:else if isFollowed}
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
