<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import FollowSnsTopicSection from "$lib/components/sns-neuron-detail/FollowSnsTopicSection.svelte";
  import { Modal, Spinner } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNeuron } from "@dfinity/sns";
  import type { SnsNervousSystemFunction } from "@dfinity/sns";
  import Separator from "$lib/components/ui/Separator.svelte";
  import type { Readable } from "svelte/store";
  import { createSnsNsFunctionsProjectStore } from "$lib/derived/sns-ns-functions-project.derived";

  export let neuron: SnsNeuron;
  export let rootCanisterId: Principal;

  let functionsStore: Readable<SnsNervousSystemFunction[] | undefined>;
  $: functionsStore = createSnsNsFunctionsProjectStore(rootCanisterId);
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

  {#if $functionsStore === undefined}
    <Spinner />
  {:else}
    {#each $functionsStore as nsFunction (nsFunction.id.toString())}
      <FollowSnsTopicSection {nsFunction} {rootCanisterId} {neuron} />
    {/each}
  {/if}
</Modal>
