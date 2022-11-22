<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Collapsible } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  export let title: string;
  export let subtitle: string;
  export let id: string;
  export let count: number;

  const dispatcher = createEventDispatcher();
  const open = () => {
    dispatcher("nnsOpen");
  };
</script>

<article data-tid={`follow-topic-${id}-section`}>
  <Collapsible {id} iconSize="medium">
    <div class="wrapper" slot="header">
      <div>
        <h3>{title}</h3>
        <p class="subtitle description">{subtitle}</p>
      </div>
      <div class="toolbar">
        <h3 class="badge" data-tid={`topic-${id}-followees-badge`}>
          {count}
        </h3>
      </div>
    </div>
    <div class="content" data-tid="follow-topic-section-current">
      <p class="label">{$i18n.follow_neurons.current_followees}</p>
      <div class="followees-wrapper">
        <slot />
      </div>
      <div class="button-wrapper">
        <button
          class="primary"
          data-tid="open-new-followee-modal"
          on:click={open}>{$i18n.follow_neurons.add}</button
        >
      </div>
    </div>
  </Collapsible>
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
    .followees-wrapper {
      padding: 0 var(--padding) 0 0;
      margin-bottom: var(--padding);
    }
    .button-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--padding) 0;
    }
  }
</style>
