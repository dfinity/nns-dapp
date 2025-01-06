<script lang="ts">
  import FollowSnsTopicSection from "$lib/components/sns-neuron-detail/FollowSnsTopicSection.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { createSnsNsFunctionsProjectStore } from "$lib/derived/sns-ns-functions-project.derived";
  import { i18n } from "$lib/stores/i18n";
  import { Modal, Spinner } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNervousSystemFunction, SnsNeuron } from "@dfinity/sns";
  import { createEventDispatcher } from "svelte";
  import type { Readable } from "svelte/store";

  export let neuron: SnsNeuron;
  export let rootCanisterId: Principal;

  let functionsStore: Readable<SnsNervousSystemFunction[] | undefined>;
  $: functionsStore = createSnsNsFunctionsProjectStore(rootCanisterId);

  const dispatcher = createEventDispatcher();

  const close = () => dispatcher("nnsClose");
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
  <div class="toolbar">
    <button data-tid="close-button" class="secondary" on:click={close}>
      {$i18n.core.close}
    </button>
  </div>
</Modal>
