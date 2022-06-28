<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { onMount } from "svelte";
  import { listKnownNeurons } from "../../../services/knownNeurons.services";
  import { accountsStore } from "../../../stores/accounts.store";
  import { authStore } from "../../../stores/auth.store";
  import { i18n } from "../../../stores/i18n";
  import {
    type FolloweesNeuron,
    followeesNeurons,
    isNeuronControllable,
    isHotKeyControllable,
  } from "../../../utils/neuron.utils";
  import CardInfo from "../../ui/CardInfo.svelte";
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
  <p>{$i18n.neuron_detail.following_description}</p>

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
  }

  .frame {
    margin: var(--padding-2x) 0;
    padding: var(--padding-2x) 0;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
  }
</style>
