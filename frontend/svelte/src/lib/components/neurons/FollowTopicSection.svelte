<script lang="ts">
  // Tested in EditFollowNeurons.spec.ts
  import type { NeuronId, Topic, NeuronInfo } from "@dfinity/nns";
  import IconExpandMore from "../../icons/IconExpandMore.svelte";
  import NewFolloweeModal from "../../modals/neurons/NewFolloweeModal.svelte";
  import { removeFollowee } from "../../services/neurons.services";
  import { authStore } from "../../stores/auth.store";
  import { i18n } from "../../stores/i18n";
  import { toastsStore } from "../../stores/toasts.store";

  export let topic: Topic;
  export let neuron: NeuronInfo;

  let title: string;
  $: title = $i18n.follow_neurons[`topic_${topic}_title`];
  let subtitle: string;
  $: subtitle = $i18n.follow_neurons[`topic_${topic}_subtitle`];

  let isExpanded: boolean = false;
  let showNewFolloweeModal: boolean = false;
  let followees: NeuronId[] = [];

  const toggleContent = () => {
    // TODO: Fetch followees and render them - https://dfinity.atlassian.net/browse/L2-365
    isExpanded = !isExpanded;
  };

  const openNewFolloweeModal = () => (showNewFolloweeModal = true);
  const closeNewFolloweeModal = () => (showNewFolloweeModal = false);

  // TODO: Check that it works - https://dfinity.atlassian.net/browse/L2-365
  const removeCurrentFollowee = async (followee: NeuronId) => {
    await removeFollowee({
      identity: $authStore.identity,
      neuronId: neuron.neuronId,
      topic,
      followee,
    });
    toastsStore.show({
      labelKey: "new_followee.success_remove_followee",
      level: "info",
    });
  };
</script>

<article data-tid="follow-topic-section">
  <div class="wrapper">
    <div>
      <h3>{title}</h3>
      <p class="subtitle">{subtitle}</p>
    </div>
    <div class="toolbar">
      <!-- TODO: Set total followees - https://dfinity.atlassian.net/browse/L2-365 -->
      <h3 class="badge">0</h3>
      <!-- TODO: Use expandable component -->
      <span
        class:isExpanded
        on:click={toggleContent}
        data-tid="expand-topic-followees"><IconExpandMore /></span
      >
    </div>
  </div>
  <div class="content" class:isExpanded data-tid="follow-topic-section-current">
    <h5>{$i18n.follow_neurons.current_followees}</h5>
    <ul>
      {#each followees as followee}
        <li data-tid="current-followee-item">
          <!-- TODO: Use followee details - https://dfinity.atlassian.net/browse/L2-365 -->
          <p>DFINITY Foundation</p>
          <button on:click={() => removeCurrentFollowee(followee)}>x</button>
        </li>
      {/each}
    </ul>
    <div class="button-wrapper">
      <button
        class="secondary small"
        data-tid="open-new-followee-modal"
        on:click={openNewFolloweeModal}>{$i18n.follow_neurons.add}</button
      >
    </div>
  </div>
  {#if showNewFolloweeModal}
    <NewFolloweeModal {neuron} {topic} on:nnsClose={closeNewFolloweeModal} />
  {/if}
</article>

<style lang="scss">
  @use "../../themes/mixins/interaction";
  .wrapper {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: calc(2 * var(--padding));
  }

  .subtitle {
    margin: 0 0 var(--padding) 0;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: calc(2 * var(--padding));
    margin-top: calc(2 * var(--padding));
  }

  .badge {
    background-color: var(--background-contrast);
    color: var(--background);
    border-radius: 50%;
    padding: var(--padding);
    width: calc(2 * var(--padding));
    height: calc(2 * var(--padding));
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toolbar span {
    @include interaction.tappable;

    color: var(--background-contrast);

    transition: transform 0.3s;

    &.isExpanded {
      // We need to translateY to keep the center in the same place
      transform: rotate(180deg) translateY(4px);
    }
  }

  .content {
    visibility: hidden;
    max-height: 0;
    height: fit-content;
    overflow: hidden;
    transition: all 0.3s;

    &.isExpanded {
      visibility: visible;
      max-height: calc(300px);
      height: fit-content;
    }

    .button-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--padding) 0;
    }

    ul {
      list-style-type: none;
      padding: 0 calc(3 * var(--padding));
    }

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        @include interaction.tappable;
      }
    }
  }
</style>
