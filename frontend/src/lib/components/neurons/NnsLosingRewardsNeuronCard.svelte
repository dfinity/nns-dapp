<script lang="ts">
  import { Card, IconRight } from "@dfinity/gix-components";
  import {
    followeesNeurons,
    getNeuronTags,
    type FolloweesNeuron,
    type NeuronTagData,
  } from "$lib/utils/neuron.utils";
  import Followee from "../neuron-detail/NeuronFollowingCard/Followee.svelte";
  import type { NeuronInfo } from "@dfinity/nns";
  import { authStore } from "$lib/stores/auth.store";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { i18n } from "$lib/stores/i18n";
  import NeuronTag from "$lib/components/ui/NeuronTag.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{ nnsClick: void }>();

  export let neuron: NeuronInfo;

  let neuronTags: NeuronTagData[];
  $: neuronTags = getNeuronTags({
    neuron,
    identity: $authStore.identity,
    accounts: $icpAccountsStore,
    i18n: $i18n,
  });

  let followees: FolloweesNeuron[];
  $: followees = followeesNeurons(neuron) ?? [];
</script>

<Card
  testId="nns-loosing-rewards-neuron-card-component"
  role="button"
  noMargin
  ariaLabel={$i18n.losing_rewards_modal.goto_neuron}
  on:click={() => dispatch("nnsClick")}
>
  <div class="wrapper">
    <div class="header">
      <div class="title">
        <h3 class="neuron-id" data-tid="neuron-id">
          {neuron.neuronId}
        </h3>
        {#each neuronTags as tag}
          <NeuronTag {tag} />
        {/each}
      </div>
      <div class="icon-right">
        <IconRight />
      </div>
    </div>

    {#if followees.length > 0}
      <div class="frame">
        {#each followees as followee}
          <Followee {followee} {neuron} isInteractive={false} />
        {/each}
      </div>
    {:else}
      <p data-tid="no-following" class="no-following">
        {$i18n.losing_rewards_modal.no_following}
      </p>
    {/if}
  </div>
</Card>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }

  .header {
    display: flex;
    align-items: center;
  }

  .title {
    display: flex;
    flex-grow: 1;
    flex-wrap: wrap;
    column-gap: var(--padding);
    row-gap: var(--padding-0_5x);

    h3 {
      margin: 0;
    }
  }

  .icon-right {
    display: flex;
    align-items: center;
    color: var(--primary);
  }

  .no-following {
    color: var(--description-color);
  }
</style>
