<script lang="ts">
  // Tested in EditFollowNeurons.spec.ts
  import { type NeuronId, Topic, type NeuronInfo } from "@dfinity/nns";
  import NewFolloweeModal from "$lib/modals/neurons/NewFolloweeModal.svelte";
  import { removeFollowee } from "$lib/services/neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { knownNeuronsStore } from "$lib/stores/knownNeurons.store";
  import { followeesByTopic } from "$lib/utils/neuron.utils";
  import { Collapsible } from "@dfinity/gix-components";

  export let topic: Topic;
  export let neuron: NeuronInfo;

  // TODO: Align with `en.governance.json` "topics.[topic]"
  let title: string;
  $: title = $i18n.follow_neurons[`topic_${topic}_title`];
  let subtitle: string;
  $: subtitle = $i18n.follow_neurons[`topic_${topic}_subtitle`];
  let id: string | undefined;
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

<article data-tid={`follow-topic-${topic}-section`}>
  <Collapsible {id} iconSize="medium">
    <div class="wrapper" slot="header">
      <div>
        <h3>{title}</h3>
        <p class="subtitle description">{subtitle}</p>
        {#if topic == 1}
          <p class="subtitle description">{$i18n.ManageNeuronWarning.topics_description}</p>
        {/if}
      </div>
      <div class="toolbar">
        <h3 class="badge" data-tid={`topic-${topic}-followees-badge`}>
          {followees.length}
        </h3>
      </div>
    </div>
    <div class="content" data-tid="follow-topic-section-current">
      <p class="label">{$i18n.follow_neurons.current_followees}</p>
      <ul>
        {#each followees as followee}
          <li data-tid="current-followee-item">
            <p class="value">{followee.name ?? followee.neuronId}</p>
            <button on:click={() => removeCurrentFollowee(followee.neuronId)}
              >x</button
            >
          </li>
        {/each}
      </ul>
      <div class="button-wrapper">
        <button
          class="primary"
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
  @use "@dfinity/gix-components/styles/mixins/interaction";

  article {
    h3 {
      // Titles longer than one line had too much space with the default line-height for h3
      line-height: normal;
    }

    :global(.collapsible-expand-icon) {
      align-items: start;
      padding-top: var(--padding-3x);
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
    // Used to align with the collapsible icon
    padding-right: var(--padding-2x);
    margin-top: var(--padding);
    margin-right: var(--padding-2x);
  }

  .badge {
    background-color: var(--background-contrast);
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
      padding: 0 var(--padding) 0 0;
      margin-bottom: var(--padding);
    }

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
</style>
