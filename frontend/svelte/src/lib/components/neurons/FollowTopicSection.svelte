<script lang="ts">
  import type { Topic } from "@dfinity/nns";
  import IconExpandMore from "../../icons/IconExpandMore.svelte";
  import NewFolloweeModal from "../../modals/neurons/NewFolloweeModal.svelte";
  import { i18n } from "../../stores/i18n";

  export let topic: Topic;

  let title: string;
  $: title = $i18n.neurons.follow_neurons[`topic_${topic}_title`];
  let subtitle: string;
  $: subtitle = $i18n.neurons.follow_neurons[`topic_${topic}_subtitle`];

  let isExpanded: boolean = false;
  let showNewFolloweeModal: boolean = false;

  const toggleContent = () => (isExpanded = !isExpanded);

  const openNewFolloweeModal = () => (showNewFolloweeModal = true);
  const closeNewFolloweeModal = () => (showNewFolloweeModal = false);
</script>

<article>
  <div class="wrapper">
    <div>
      <h3>{title}</h3>
      <p class="subtitle">{subtitle}</p>
    </div>
    <div class="toolbar">
      <!-- TODO: Set total followees -->
      <h3 class="badge">0</h3>
      <span class:isExpanded on:click={toggleContent}><IconExpandMore /></span>
    </div>
  </div>
  <div class="content" class:isExpanded>
    <h4>{$i18n.neurons.follow_neurons.current_followees}</h4>
    <!-- TODO: Iterate followees -->
    <div class="button-wrapper">
      <button class="secondary small" on:click={openNewFolloweeModal}
        >{$i18n.neurons.follow_neurons.add}</button
      >
    </div>
  </div>
  {#if showNewFolloweeModal}
    <NewFolloweeModal on:nnsClose={closeNewFolloweeModal} />
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

    color: var(--black);

    transition: transform 0.3s;

    &.isExpanded {
      transform: rotate(180deg);
    }
  }

  .content {
    max-height: 0;
    height: fit-content;
    overflow: hidden;
    transition: max-height 0.3s;

    background: var(--background);

    &.isExpanded {
      max-height: calc(300px);
      height: fit-content;
    }

    h4 {
      padding: var(--padding);
    }

    .button-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--padding) 0;
    }
  }
</style>
