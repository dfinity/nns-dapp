<script lang="ts">
  import FollowTopicSection from "$lib/components/neurons/FollowTopicSection.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
  import { functionsToFollow } from "$lib/utils/sns-neuron.utils";
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
  <p class="description">{$i18n.follow_neurons.description}</p>
  <div>
    {#if functions === undefined}
      <Spinner />
    {:else}
      {#each functions as { name, id, description }}
        <FollowTopicSection count={0} title={name} subtitle={description} {id}>
          <!-- TODO: Render Followees https://dfinity.atlassian.net/browse/GIX-1114 -->
          <div>{`TODO: render followees ${neuron.followees.length}`}</div>
        </FollowTopicSection>
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
