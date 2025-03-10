<script lang="ts">
  import Followee from "$lib/components/neuron-detail/NeuronFollowingCard/Followee.svelte";
  import NeuronTag from "$lib/components/ui/NeuronTag.svelte";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import {
    followeesNeurons,
    getNeuronTags,
    type FolloweesNeuron,
    type NeuronTagData,
  } from "$lib/utils/neuron.utils";
  import { Card, IconRight } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { nonNullish } from "@dfinity/utils";
  import { startReducingVotingPowerAfterSecondsStore } from "$lib/derived/network-economics.derived";

  export let neuron: NeuronInfo;
  export let onClick: (() => void) | undefined;

  let isClickable: boolean;
  $: isClickable = nonNullish(onClick);

  let neuronTags: NeuronTagData[];
  $: neuronTags = getNeuronTags({
    neuron,
    identity: $authStore.identity,
    accounts: $icpAccountsStore,
    i18n: $i18n,
    startReducingVotingPowerAfterSeconds:
      $startReducingVotingPowerAfterSecondsStore,
  });

  let followees: FolloweesNeuron[];
  $: followees = followeesNeurons(neuron) ?? [];
</script>

<Card
  testId="nns-loosing-rewards-neuron-card-component"
  role={isClickable ? "button" : undefined}
  noMargin
  ariaLabel={$i18n.missing_rewards_modal.goto_neuron}
  on:click={() => onClick?.()}
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
      {#if isClickable}
        <div class="icon-right">
          <IconRight />
        </div>
      {/if}
    </div>

    {#if followees.length > 0}
      <div class="frame">
        {#each followees as followee}
          <Followee {followee} {neuron} isInteractive={false} />
        {/each}
      </div>
    {:else}
      <p data-tid="no-following" class="no-following">
        {$i18n.missing_rewards_modal.no_following}
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
