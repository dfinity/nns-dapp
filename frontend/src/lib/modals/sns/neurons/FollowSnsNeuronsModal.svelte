<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
  import FollowSnsTopicSection from "$lib/components/sns-neuron-detail/FollowSnsTopicSection.svelte";
  import { Modal, Spinner } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNeuron } from "@dfinity/sns";
  import type { SnsNervousSystemFunction } from "@dfinity/sns";
  import Separator from "$lib/components/ui/Separator.svelte";

  export let neuron: SnsNeuron;
  export let rootCanisterId: Principal;

  let functions: SnsNervousSystemFunction[] | undefined;
  $: functions = $snsFunctionsStore[rootCanisterId.toString()]?.nsFunctions;
</script>

<Modal
  on:nnsClose
  testId="follow-sns-neurons-modal"
  --modal-content-overflow-y="scroll"
>
  <svelte:fragment slot="title"
    >{$i18n.neurons.follow_neurons_screen}</svelte:fragment
  >
  <p class="description">{$i18n.follow_neurons.description}</p>

  <Separator spacing="medium" />

  {#if functions === undefined}
    <Spinner />
  {:else}
    {#each functions as nsFunction (nsFunction.id.toString())}
      <FollowSnsTopicSection {nsFunction} {rootCanisterId} {neuron} />
    {/each}
  {/if}
</Modal>
