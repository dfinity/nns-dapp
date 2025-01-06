<script lang="ts">
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
  import { listKnownNeurons } from "$lib/services/known-neurons.services";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import {
    followeesNeurons,
    isHotKeyControllable,
    isNeuronControllable,
    type FolloweesNeuron,
  } from "$lib/utils/neuron.utils";
  import FollowNeuronsButton from "../actions/FollowNeuronsButton.svelte";
  import Followee from "./Followee.svelte";
  import { KeyValuePairInfo } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { nonNullish } from "@dfinity/utils";
  import { onMount } from "svelte";

  export let neuron: NeuronInfo;
  let isControllable: boolean;
  $: isControllable =
    isNeuronControllable({
      neuron,
      identity: $authStore.identity,
      accounts: $icpAccountsStore,
    }) ||
    isHotKeyControllable({
      neuron,
      identity: $authStore.identity,
    });
  let followees: FolloweesNeuron[];
  $: followees = followeesNeurons(neuron);

  onMount(listKnownNeurons);
</script>

<CardInfo noMargin testId="neuron-following-card-component">
  <KeyValuePairInfo testId="neuron-following">
    <h3 slot="key">{$i18n.neuron_detail.following_title}</h3>
    <svelte:fragment slot="info"
      >{$i18n.neuron_detail.following_description}</svelte:fragment
    >
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
      <FollowNeuronsButton />
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
