<script lang="ts">
  // Tested in EditFollowNeurons.spec.ts
  import type { NeuronId, Topic, NeuronInfo } from "@dfinity/nns";
  import NewFolloweeModal from "$lib/modals/neurons/NewFolloweeModal.svelte";
  import { removeFollowee } from "$lib/services/neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { knownNeuronsStore } from "$lib/stores/knownNeurons.store";
  import { followeesByTopic } from "$lib/utils/neuron.utils";
  import FollowTopicSection from "./FollowTopicSection.svelte";
  import { IconClose, Value } from "@dfinity/gix-components";

  export let topic: Topic;
  export let neuron: NeuronInfo;

  // TODO: Align with `en.governance.json` "topics.[topic]"
  let title: string;
  $: title = $i18n.follow_neurons[`topic_${topic}_title`];
  let subtitle: string;
  $: subtitle = $i18n.follow_neurons[`topic_${topic}_subtitle`];

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

<FollowTopicSection
  on:nnsOpen={openNewFolloweeModal}
  id={String(topic)}
  count={followees.length}
>
  <h3 slot="title">{title}</h3>
  <p slot="subtitle" class="subtitle description">{subtitle}</p>
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
