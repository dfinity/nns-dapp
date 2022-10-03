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
  import KeyValuePairInfo from "../../ui/KeyValuePairInfo.svelte";

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
  <KeyValuePairInfo testId="neuron-following">
    <h3 slot="key">{$i18n.neuron_detail.following_title}</h3>
    <svelte:fragment slot="info"
      >{$i18n.neuron_detail.following_description}</svelte:fragment
    >
  </KeyValuePairInfo>

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
    line-height: var(--line-height-standard);
  }

  .frame {
    padding-bottom: var(--padding-0_5x);
  }

  .actions {
    display: flex;
    justify-content: flex-start;
    padding-top: var(--padding);
  }
</style>
