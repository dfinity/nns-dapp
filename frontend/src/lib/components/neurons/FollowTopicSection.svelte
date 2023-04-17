<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Collapsible } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

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
      <span class="value"><slot name="title" /></span>
      <span class="badge" data-tid={`topic-${id}-followees-badge`}>
        {count}
      </span>
    </div>
    <div class="content" data-tid="follow-topic-section-current">
      <p class="subtitle description"><slot name="subtitle" /></p>

      {#if count > 0}
        <p class="description current-following">
          {$i18n.follow_neurons.current_followees}
        </p>
      {/if}

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
  @use "@dfinity/gix-components/dist/styles/mixins/interaction";

  article {
    padding: 0 0 var(--padding-2x);

    &:first-of-type {
      margin-top: var(--padding-2x);
    }
  }

  .wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--padding-2x);
    width: calc(100% - var(--padding-4x));
  }

  .badge {
    background-color: var(--background-contrast);
    color: var(--background);
    border-radius: 50%;
    padding: var(--padding);
    width: var(--padding);
    height: var(--padding);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .button-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 0 var(--padding-2x);
  }

  .subtitle {
    padding: 0 0 var(--padding) 0;
  }

  .current-following {
    padding: var(--padding) 0 0;
  }
</style>
