<script lang="ts">
  // Tested in EditFollowNeurons.spec.ts
  import { type NeuronId, Topic, type NeuronInfo } from "@dfinity/nns";
  import NewFolloweeModal from "$lib/modals/neurons/NewFolloweeModal.svelte";
  import { removeFollowee } from "$lib/services/neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { knownNeuronsStore } from "$lib/stores/knownNeurons.store";
  import { followeesByTopic } from "$lib/utils/neuron.utils";
  import FollowTopicSection from "./FollowTopicSection.svelte";
  import { KeyValuePair } from "@dfinity/gix-components";

  export let topic: Topic;
  export let neuron: NeuronInfo;

  // TODO: Align with `en.governance.json` "topics.[topic]"
  let title: string;
  $: title = $i18n.follow_neurons[`topic_${topic}_title`];
  let subtitle: string;
  $: subtitle = $i18n.follow_neurons[`topic_${topic}_subtitle`];
  let id: string;
  $: id = Topic[topic];

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
  {title}
  {subtitle}
  id={String(topic)}
  count={followees.length}
>
  <ul>
    {#each followees as followee}
      <li data-tid="current-followee-item">
        <KeyValuePair>
          <p slot="key" class="value">{followee.name ?? followee.neuronId}</p>
          <button
            slot="value"
            on:click={() => removeCurrentFollowee(followee.neuronId)}>x</button
          >
        </KeyValuePair>
      </li>
    {/each}
  </ul>
</FollowTopicSection>
{#if showNewFolloweeModal}
  <NewFolloweeModal {neuron} {topic} on:nnsClose={closeNewFolloweeModal} />
{/if}

<style lang="scss">
  ul {
    list-style-type: none;
    padding: 0;
  }
</style>
