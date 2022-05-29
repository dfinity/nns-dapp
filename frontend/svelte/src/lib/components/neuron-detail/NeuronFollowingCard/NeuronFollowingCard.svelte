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
  import Card from "../../ui/Card.svelte";
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

<Card>
  <h3 slot="start">{$i18n.neuron_detail.following_title}</h3>
  <p>{$i18n.neuron_detail.following_description}</p>

  {#if followees.length > 0}
    <div class="frame">
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
</Card>

<style lang="scss">
  h3 {
    margin-bottom: 0;
  }

  p {
    margin-top: 0;
    color: var(--gray-200);
  }

  .frame {
    margin: calc(2 * var(--padding)) 0;
    padding: calc(2 * var(--padding));
    border: 1px solid var(--gray-600);
    border-radius: var(--border-radius);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
  }
</style>
