<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { onMount } from "svelte";
  import { listKnownNeurons } from "$lib/services/knownNeurons.services";
  import { accountsStore } from "$lib/stores/accounts.store";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import {
    type FolloweesNeuron,
    followeesNeurons,
    isNeuronControllable,
    isHotKeyControllable,
  } from "$lib/utils/neuron.utils";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import FollowNeuronsButton from "../actions/FollowNeuronsButton.svelte";
  import Followee from "./Followee.svelte";

  export let neuron: NeuronInfo;
  let isControllable: boolean;
  $: isControllable =
    isNeuronControllable({
      neuron,
      identity: $authStore.identity,
      accounts: $accountsStore,
    }) ||
    isHotKeyControllable({
      neuron,
      identity: $authStore.identity,
    });
  let followees: FolloweesNeuron[];
  $: followees = followeesNeurons(neuron);

  onMount(listKnownNeurons);
</script>

<CardInfo>
  <h3 slot="start">{$i18n.neuron_detail.following_title}</h3>
  <p class="description">{$i18n.neuron_detail.following_description}</p>

  {#if followees.length > 0}
    <div class="frame">
      <hr />

      {#each followees as followee}
        <Followee {followee} />
      {/each}
    </div>
  {/if}

  <div class="actions">
    {#if isControllable}
      <FollowNeuronsButton {neuron} />
    {/if}
  </div>
</CardInfo>

<style lang="scss">
  h3 {
    margin-bottom: 0;
  }

  p {
    margin-top: 0;
    margin-bottom: var(--padding-2x);
  }

  .frame {
    padding-bottom: var(--padding-2x);
  }

  .actions {
    display: flex;
    justify-content: flex-start;
  }
</style>
