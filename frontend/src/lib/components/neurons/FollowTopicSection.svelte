<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Collapsible } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";
  import type { Snippet } from "svelte";

  type Props = {
    id: string;
    count: number;
    openNewFolloweeModal: () => void;
    title: string;
    subtitle?: string;
    children: Snippet;
  };

  const { id, count, openNewFolloweeModal, title, subtitle, children }: Props =
    $props();
  const defaultTestId = "collapsible";
  let testId = $state(defaultTestId);

  $effect(() => {
    if (count === 0) return;
    testId = "";

    setTimeout(() => {
      testId = defaultTestId;
    }, 0);
  });
</script>

<article data-tid={`follow-topic-${id}-section`}>
  <Collapsible {id} iconSize="medium" {testId}>
    <div class="wrapper" slot="header">
      <span class="value" data-tid="topic-title">{title}</span>
      <span class="badge" data-tid={`topic-${id}-followees-badge`}>
        {count}
      </span>
    </div>
    <div class="content" data-tid="follow-topic-section-current">
      {#if nonNullish(subtitle)}
        <p class="subtitle description">{subtitle}</p>
      {/if}
      {#if count > 0}
        <p
          class="description current-followees"
          data-tid="current-followees-label"
        >
          {$i18n.follow_neurons.current_followees}
        </p>
      {/if}

      <div class="followees-wrapper">
        {@render children()}
      </div>
      <div class="button-wrapper">
        <button
          class="primary"
          data-tid="open-new-followee-modal"
          onclick={openNewFolloweeModal}>{$i18n.follow_neurons.add}</button
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
    padding: var(--padding-1_5x);
    width: var(--padding-0_5x);
    height: var(--padding-0_5x);
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
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

  .current-followees {
    padding: var(--padding) 0 0;
  }
</style>
