<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { busy } from "@dfinity/gix-components";
  import type { KnownNeuron } from "@dfinity/nns";

  type Props = {
    knownNeuron: KnownNeuron;
    updateFollowings: (followeeAddress: string) => Promise<void>;
  };

  const { knownNeuron, updateFollowings }: Props = $props();

  const followKnownNeuron = () => updateFollowings(knownNeuron.id.toString());
</script>

<div data-tid="known-neuron-item-component">
  <p class="value">{knownNeuron.name}</p>
  <button class="primary" disabled={$busy} onclick={followKnownNeuron}>
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
