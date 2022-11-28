<script lang="ts">
  import FollowTopicSection from "$lib/components/neurons/FollowTopicSection.svelte";
  import NewSnsFolloweeModal from "$lib/modals/sns/neurons/NewSnsFolloweeModal.svelte";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNeuron, SnsNervousSystemFunction } from "@dfinity/sns";
  import { fromNullable } from "@dfinity/utils";

  export let neuron: SnsNeuron;
  export let rootCanisterId: Principal;
  export let nsFunction: SnsNervousSystemFunction;

  let showModal = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);
</script>

<FollowTopicSection
  on:nnsOpen={openModal}
  count={0}
  id={nsFunction.id.toString()}
>
  <h3 slot="title">{nsFunction.name}</h3>
  <p slot="subtitle" class="subtitle description">
    {fromNullable(nsFunction.description)}
  </p>
  <!-- TODO: Render Followees https://dfinity.atlassian.net/browse/GIX-1114 -->
  <div>{`TODO: render followees ${neuron.followees.length}`}</div>
</FollowTopicSection>

{#if showModal}
  <NewSnsFolloweeModal
    {rootCanisterId}
    {neuron}
    functionId={nsFunction.id}
    on:nnsClose={closeModal}
  />
{/if}

<style lang="scss">
  .subtitle {
    margin: 0 0 var(--padding) 0;
  }
</style>
