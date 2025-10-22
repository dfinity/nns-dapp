<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { busy } from "@dfinity/gix-components";
  import type { KnownNeuron, Topic } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";

  export let knownNeuron: KnownNeuron;
  export let topics: Topic[] = [];
  export let updateFollowings: (followeeAddress: string) => Promise<void>;

  const dispatcher = createEventDispatcher();
  const followKnownNeuron = async () => {
    if (topics.length === 0) return;

    await updateFollowings(knownNeuron.id.toString());
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
