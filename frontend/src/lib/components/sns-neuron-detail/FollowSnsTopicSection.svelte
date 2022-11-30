<script lang="ts">
  import FollowTopicSection from "$lib/components/neurons/FollowTopicSection.svelte";
  import NewSnsFolloweeModal from "$lib/modals/sns/neurons/NewSnsFolloweeModal.svelte";
  import { followeesByFunction } from "$lib/utils/sns-neuron.utils";
  import type { Principal } from "@dfinity/principal";
  import type {
    SnsNeuron,
    SnsNervousSystemFunction,
    SnsNeuronId,
  } from "@dfinity/sns";
  import { fromNullable } from "@dfinity/utils";
  import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
  import { IconClose, Value } from "@dfinity/gix-components";
  import Hash from "../ui/Hash.svelte";
  import { i18n } from "$lib/stores/i18n";

  export let neuron: SnsNeuron;
  export let rootCanisterId: Principal;
  export let nsFunction: SnsNervousSystemFunction;

  let showModal = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);

  let followees: SnsNeuronId[] = [];
  $: followees = followeesByFunction({ neuron, functionId: nsFunction.id });

  const removeCurrentFollowee = (followee: SnsNeuronId) => {
    // TODO: Remove followee https://dfinity.atlassian.net/browse/GIX-1112
    console.log("removeCurrentFollowee", followee);
  };
</script>

<FollowTopicSection
  on:nnsOpen={openModal}
  count={followees.length}
  id={nsFunction.id.toString()}
>
  <h3 slot="title">{nsFunction.name}</h3>
  <p slot="subtitle" class="subtitle description">
    {fromNullable(nsFunction.description)}
  </p>
  <ul>
    {#each followees as followee (subaccountToHexString(followee.id))}
      {@const followeeIdHex = subaccountToHexString(followee.id)}
      <li data-tid="current-followee-item">
        <Value>
          <Hash text={followeeIdHex} id={followeeIdHex} tagName="span" />
        </Value>
        <button
          class="text"
          aria-label={$i18n.core.remove}
          on:click={() => removeCurrentFollowee(followee)}><IconClose /></button
        >
      </li>
    {/each}
  </ul>
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
  @use "@dfinity/gix-components/styles/mixins/card";

  ul {
    @include card.list;
  }

  li {
    @include card.list-item;

    button {
      display: flex;
    }
  }
  .subtitle {
    margin: 0 0 var(--padding) 0;
  }
</style>
