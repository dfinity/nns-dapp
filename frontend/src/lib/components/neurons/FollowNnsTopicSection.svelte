<script lang="ts">
  // Tested in EditFollowNeurons.spec.ts
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import NewFolloweeModal from "$lib/modals/neurons/NewFolloweeModal.svelte";
  import { removeFollowee } from "$lib/services/neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { knownNeuronsStore } from "$lib/stores/known-neurons.store";
  import {
    followeesByTopic,
    getTopicSubtitle,
    getTopicTitle,
  } from "$lib/utils/neuron.utils";
  import FollowTopicSection from "./FollowTopicSection.svelte";
  import { IconClose, Value } from "@dfinity/gix-components";
  import type { NeuronId, NeuronInfo, Topic } from "@dfinity/nns";

  export let topic: Topic;
  export let neuron: NeuronInfo;

  // TODO: Align with `en.governance.json` "topics.[topic]"
  let title: string;
  $: title = getTopicTitle({ topic, i18n: $i18n });
  let subtitle: string;
  $: subtitle = getTopicSubtitle({ topic, i18n: $i18n });

  let showNewFolloweeModal = false;
  type FolloweeData = {
    neuronId: NeuronId;
    name?: string;
  };
  let followees: FolloweeData[] = [];
  $: {
    const followesPerTopic = followeesByTopic({ neuron, topic });
    const mapToKnownNeuron = (neuronId: NeuronId): FolloweeData => {
      const knownNeuron = $knownNeuronsStore.find(
        (currentNeuron) => currentNeuron.id === neuronId
      );
      return knownNeuron !== undefined
        ? {
            neuronId: knownNeuron.id,
            name: knownNeuron.name,
          }
        : { neuronId };
    };
    // If we remove the last followee of that topic, followesPerTopic is undefined.
    // and we need to reset the followees array
    followees = followesPerTopic?.map(mapToKnownNeuron) ?? [];
  }

  const openNewFolloweeModal = () => (showNewFolloweeModal = true);
  const closeNewFolloweeModal = () => (showNewFolloweeModal = false);

  const removeCurrentFollowee = async (followee: NeuronId) => {
    startBusy({ initiator: "remove-followee" });
    await removeFollowee({
      neuronId: neuron.neuronId,
      topic,
      followee,
    });
    stopBusy("remove-followee");
  };
</script>

<TestIdWrapper testId="follow-nns-topic-section-component">
  <FollowTopicSection
    on:nnsOpen={openNewFolloweeModal}
    id={String(topic)}
    count={followees.length}
  >
    <svelte:fragment slot="title">{title}</svelte:fragment>
    <svelte:fragment slot="subtitle">{subtitle}</svelte:fragment>
    <ul>
      {#each followees as followee (followee.neuronId)}
        <li data-tid="current-followee-item">
          <Value>{followee.name ?? followee.neuronId}</Value>
          <button
            class="text"
            on:click={() => removeCurrentFollowee(followee.neuronId)}
            ><IconClose /></button
          >
        </li>
      {/each}
    </ul>
  </FollowTopicSection>
  {#if showNewFolloweeModal}
    <NewFolloweeModal {neuron} {topic} on:nnsClose={closeNewFolloweeModal} />
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
