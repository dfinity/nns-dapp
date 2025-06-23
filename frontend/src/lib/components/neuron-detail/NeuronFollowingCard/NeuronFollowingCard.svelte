<script lang="ts">
  import Followee from "$lib/components/neuron-detail/NeuronFollowingCard/Followee.svelte";
  import FollowNeuronsButton from "$lib/components/neuron-detail/actions/FollowNeuronsButton.svelte";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { listKnownNeurons } from "$lib/services/known-neurons.services";
  import { authStore } from "$lib/stores/auth.store";
  import { ENABLE_NNS_TOPICS } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import {
    followeesNeurons,
    isHotKeyControllable,
    isNeuronControllable,
  } from "$lib/utils/neuron.utils";
  import { KeyValuePairInfo } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { nonNullish } from "@dfinity/utils";
  import { onMount } from "svelte";

  type Props = {
    neuron: NeuronInfo;
  };
  const { neuron }: Props = $props();

  const isControllable = $derived(
    isNeuronControllable({
      neuron,
      identity: $authStore.identity,
      accounts: $icpAccountsStore,
    }) ||
      isHotKeyControllable({
        neuron,
        identity: $authStore.identity,
      })
  );
  const followees = $derived(followeesNeurons(neuron));
  const isFollowByTopic = $derived($ENABLE_NNS_TOPICS);

  onMount(listKnownNeurons);
</script>

<CardInfo noMargin testId="neuron-following-card-component">
  <KeyValuePairInfo testId="neuron-following">
    {#snippet key()}<h3>{$i18n.neuron_detail.following_title}</h3>{/snippet}
    {#snippet value()}{/snippet}
    {#snippet info()}
      {$i18n.neuron_detail.following_description_to_be_removed}
    {/snippet}
  </KeyValuePairInfo>

  {#if followees.length > 0 && nonNullish(neuron)}
    <div data-tid="followees-list" class="frame">
      {#each followees as followee}
        <Followee {followee} {neuron} />
      {/each}
    </div>
  {/if}

  <div class="actions">
    {#if isControllable}
      <FollowNeuronsButton {isFollowByTopic} />
    {/if}
  </div>
</CardInfo>

<style lang="scss">
  h3 {
    line-height: var(--line-height-standard);
  }

  .frame {
    padding: var(--padding-2x) 0 var(--padding-0_5x);
  }

  .actions {
    display: flex;
    justify-content: flex-start;
    padding-top: var(--padding);
  }
</style>
