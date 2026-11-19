<script lang="ts">
  import { nonNullish } from "@dfinity/utils";
  import type { Snippet } from "svelte";
  import Back from "$lib/gix/components/Back.svelte";
  import MenuButton from "$lib/gix/components/MenuButton.svelte";
  import Toolbar from "$lib/gix/components/Toolbar.svelte";
  import { layoutContentTopHidden } from "$lib/gix/stores/layout.store";
  import type { OnEventCallback } from "$lib/gix/types/event-modifiers";

  interface Props {
    title?: Snippet;
    toolbarEnd?: Snippet;
    onBack?: OnEventCallback;
  }

  let { title, toolbarEnd, onBack }: Props = $props();
</script>

<header class:hidden={$layoutContentTopHidden} data-tid="header-component">
  <Toolbar end={toolbarEnd}>
    {#snippet start()}
      {#if nonNullish(onBack)}
        <Back {onBack} />
      {:else}
        <MenuButton />
      {/if}
    {/snippet}

    {@render title?.()}
  </Toolbar>
</header>

<style lang="scss">
  @use "../styles/mixins/media";

  header {
    --toolbar-padding: 0;
    transition: all var(--animation-time-normal) ease-in-out;

    @include media.min-width(medium) {
      --toolbar-padding: 0 var(--padding-2x);
    }
    @include media.min-width(large) {
      --toolbar-padding: 0;
    }

    &.hidden {
      opacity: 0;
      transform: translateY(-100%);
      // Reset on tablet+
      @include media.min-width(medium) {
        opacity: 1;
        transform: none;
      }
    }
  }
</style>
