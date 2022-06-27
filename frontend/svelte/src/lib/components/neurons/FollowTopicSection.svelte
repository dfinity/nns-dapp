<script lang="ts">
  // Tested in EditFollowNeurons.spec.ts
  import { type NeuronId, Topic, type NeuronInfo } from "@dfinity/nns";
  import NewFolloweeModal from "../../modals/neurons/NewFolloweeModal.svelte";
  import { removeFollowee } from "../../services/neurons.services";
  import { startBusy, stopBusy } from "../../stores/busy.store";
  import { i18n } from "../../stores/i18n";
  import { knownNeuronsStore } from "../../stores/knownNeurons.store";
  import { followeesByTopic } from "../../utils/neuron.utils";
  import Collapsible from "../ui/Collapsible.svelte";

  export let topic: Topic;
  export let neuron: NeuronInfo;

  let title: string;
  $: title = $i18n.follow_neurons[`topic_${topic}_title`];
  let subtitle: string;
  $: subtitle = $i18n.follow_neurons[`topic_${topic}_subtitle`];
  let id: string | undefined;
  $: id = Topic[topic];

  let showNewFolloweeModal: boolean = false;
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

<article data-tid={`follow-topic-${topic}-section`}>
  <Collapsible {id} iconSize="medium">
    <svelte:fragment slot="header">
      <div class="wrapper">
        <div>
          <h3>{title}</h3>
          <p class="subtitle">{subtitle}</p>
        </div>
        <div class="toolbar">
          <h3 class="badge" data-tid={`topic-${topic}-followees-badge`}>
            {followees.length}
          </h3>
        </div>
      </div>
    </svelte:fragment>
    <div class="content" data-tid="follow-topic-section-current">
      <h5>{$i18n.follow_neurons.current_followees}</h5>
      <ul>
        {#each followees as followee}
          <li data-tid="current-followee-item">
            <p>{followee.name ?? followee.neuronId}</p>
            <button on:click={() => removeCurrentFollowee(followee.neuronId)}
              >x</button
            >
          </li>
        {/each}
      </ul>
      <div class="button-wrapper">
        <button
          class="primary small"
          data-tid="open-new-followee-modal"
          on:click={openNewFolloweeModal}>{$i18n.follow_neurons.add}</button
        >
      </div>
    </div>
  </Collapsible>
  {#if showNewFolloweeModal}
    <NewFolloweeModal {neuron} {topic} on:nnsClose={closeNewFolloweeModal} />
  {/if}
</article>

<style lang="scss">
  @use "../../themes/mixins/interaction";

  article {
    :global(.collapsible-expand-icon) {
      align-items: start;
      padding-top: var(--padding-3x);
      color: var(--gray-50);
    }
  }

  .wrapper {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: var(--padding-2x);
    width: 100%;
  }

  .subtitle {
    margin: 0 0 var(--padding) 0;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding-right: var(--padding-2x);
    margin-top: var(--padding-2x);
    margin-right: var(--padding-2x);
  }

  .badge {
    background-color: var(--gray-50);
    color: var(--background);
    border-radius: 50%;
    padding: var(--padding);
    width: var(--padding-2x);
    height: var(--padding-2x);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .content {
    .button-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--padding) 0;
    }

    ul {
      list-style-type: none;
      padding: 0 var(--padding-3x);
    }

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
</style>
