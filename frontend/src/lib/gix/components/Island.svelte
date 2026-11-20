<script lang="ts">
  import { onDestroy, type Snippet } from "svelte";
  import ScrollSentinel from "$lib/gix/components/ScrollSentinel.svelte";
  import { BREAKPOINT_LARGE } from "$lib/gix/constants/constants";
  import { layoutContentScrollY } from "$lib/gix/stores/layout.store";

  interface Props {
    testId?: string;
    children: Snippet;
  }

  let { testId, children }: Props = $props();

  let innerWidth = $state(0);

  $effect(() => {
    layoutContentScrollY.set(innerWidth < BREAKPOINT_LARGE ? "auto" : "hidden");
  });

  onDestroy(() => layoutContentScrollY.set("auto"));

  let scrollContainer = $state<HTMLElement | undefined>();
</script>

<svelte:window bind:innerWidth />

<div class="island" data-tid={testId}>
  <div bind:this={scrollContainer} class="scrollable-island">
    <ScrollSentinel {scrollContainer} />
    {@render children()}
  </div>
</div>

<style lang="scss">
  @use "../styles/mixins/media";
  @use "../styles/mixins/content";

  .island {
    @include content.island;

    height: 100%;

    overflow: hidden;

    ::-webkit-scrollbar {
      @include content.island;
    }

    @include media.min-width(large) {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      border-radius: var(--border-radius-2x);

      width: var(--island-width);
      max-width: var(--island-max-width);
      height: calc(100% - var(--header-height) - var(--padding-2x));

      margin-top: var(--padding-2x);
    }
  }

  .scrollable-island {
    height: 100%;

    overflow-x: hidden;
    overflow-y: auto;
  }
</style>
