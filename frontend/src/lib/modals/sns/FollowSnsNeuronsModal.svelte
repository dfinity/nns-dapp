<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
  import { functionsToFollow } from "$lib/utils/sns-neuron.utils";
  import FollowSnsTopicSection from "$lib/components/sns-neuron-detail/FollowSnsTopicSection.svelte";
  import { Modal, Spinner } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNeuron } from "@dfinity/sns";
  import type { SnsNervousSystemFunction } from "@dfinity/sns";

  export let neuron: SnsNeuron;
  export let rootCanisterId: Principal;

  let functions: SnsNervousSystemFunction[] | undefined;
  $: functions = functionsToFollow(
    $snsFunctionsStore[rootCanisterId.toString()]
  );
</script>

<Modal on:nnsClose testId="follow-sns-neurons-modal">
  <svelte:fragment slot="title"
    >{$i18n.neurons.follow_neurons_screen}</svelte:fragment
  >
  <div>
    <p class="description">{$i18n.follow_neurons.description}</p>
    {#if functions === undefined}
      <Spinner />
    {:else}
      {#each functions as nsFunction (nsFunction.id.toString())}
        <FollowSnsTopicSection {nsFunction} {rootCanisterId} {neuron} />
      {/each}
    {/if}
  </div>
</Modal>

<style lang="scss">
  div {
    display: flex;
    flex-direction: column;
    gap: var(--padding-1_5x);
  }
</style>
