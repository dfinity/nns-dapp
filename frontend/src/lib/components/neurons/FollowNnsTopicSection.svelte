<script lang="ts">
  // Tested in EditFollowNeurons.spec.ts
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import FollowTopicSection from "$lib/components/neurons/FollowTopicSection.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
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
  import { IconClose, Value } from "@dfinity/gix-components";
  import { Topic, type NeuronId, type NeuronInfo } from "@dfinity/nns";
  import { nonNullish } from "@dfinity/utils";

  type Props = {
    topic: Topic;
    neuron: NeuronInfo;
  };
  const { topic, neuron }: Props = $props();

  // TODO: Align with `en.governance.json` "topics.[topic]"
  const title = $derived(getTopicTitle({ topic, i18n: $i18n }));
  let subtitle = $derived(getTopicSubtitle({ topic, i18n: $i18n }));
  let showNewFolloweeModal = $state(false);

  type FolloweeData = {
    neuronId: NeuronId;
    name?: string;
  };
  const followees: FolloweeData[] = $derived.by(() => {
    const followesPerTopic = followeesByTopic({ neuron, topic });

    const mapToKnownNeuron = (neuronId: NeuronId): FolloweeData => {
      const knownNeuron = $knownNeuronsStore.find(({ id }) => id === neuronId);
      return nonNullish(knownNeuron)
        ? {
            neuronId: knownNeuron.id,
            name: knownNeuron.name,
          }
        : { neuronId };
    };
    // If we remove the last followee of that topic, followesPerTopic is undefined.
    // and we need to reset the followees array
    return followesPerTopic?.map(mapToKnownNeuron) ?? [];
  });

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
    id={String(topic)}
    count={followees.length}
    {openNewFolloweeModal}
  >
    {#snippet title()}
      {title}
    {/snippet}
    {#snippet subtitle()}
      {subtitle}
    {/snippet}
    <ul>
      {#each followees as followee (followee.neuronId)}
        <li data-tid="current-followee-item">
          <Value>{followee.name ?? followee.neuronId}</Value>
          <button
            class="text"
            onclick={() => removeCurrentFollowee(followee.neuronId)}
            ><IconClose /></button
          >
        </li>
      {/each}
    </ul>
  </FollowTopicSection>

  {#if topic === Topic.Unspecified}
    <Separator testId="separator" spacing="small" />
  {/if}

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
