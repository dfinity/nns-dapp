<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import FollowTopicSection from "$lib/components/neurons/FollowTopicSection.svelte";
  import Hash from "$lib/components/ui/Hash.svelte";
  import NewSnsFolloweeModal from "$lib/modals/sns/neurons/NewSnsFolloweeModal.svelte";
  import { removeFollowee } from "$lib/services/sns-neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import {
    followeesByFunction,
    subaccountToHexString,
  } from "$lib/utils/sns-neuron.utils";
  import { IconClose, Value } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import type {
    SnsNervousSystemFunction,
    SnsNeuron,
    SnsNeuronId,
  } from "@dfinity/sns";
  import { fromNullable } from "@dfinity/utils";
  import { getContext } from "svelte";

  export let neuron: SnsNeuron;
  export let rootCanisterId: Principal;
  export let nsFunction: SnsNervousSystemFunction;

  const { reload }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let showModal = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);

  let followees: SnsNeuronId[] = [];
  $: followees = followeesByFunction({ neuron, functionId: nsFunction.id });

  const removeCurrentFollowee = async (followee: SnsNeuronId) => {
    startBusy({
      initiator: "remove-sns-followee",
    });

    const { success } = await removeFollowee({
      rootCanisterId,
      neuron: neuron,
      followee,
      functionId: nsFunction.id,
    });

    if (success) {
      await reload();
    }
    stopBusy("remove-sns-followee");
  };
</script>

<TestIdWrapper testId="follow-sns-topic-section-component">
  <FollowTopicSection
    on:nnsOpen={openModal}
    count={followees.length}
    id={nsFunction.id.toString()}
  >
    <svelte:fragment slot="title">{nsFunction.name}</svelte:fragment>
    <svelte:fragment slot="subtitle"
      >{fromNullable(nsFunction.description)}</svelte:fragment
    >
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
            on:click={() => removeCurrentFollowee(followee)}
            ><IconClose /></button
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
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/card";

  ul {
    @include card.list;
  }

  li {
    @include card.list-item;

    button {
      display: flex;
    }
  }
</style>
