<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    tagName?: "div" | "li";
    testId?: string;
    icon?: Snippet;
    children: Snippet;
    actions: Snippet;
  }

  let { tagName = "li", testId, icon, children, actions }: Props = $props();
</script>

<svelte:element this={tagName} class="container" data-tid={testId}>
  <div class="start-wrapper">
    <div class="icon-wrapper">
      {@render icon?.()}
    </div>
    {@render children()}
  </div>
  <div>
    {@render actions()}
  </div>
</svelte:element>

<style lang="scss">
  @use "../styles/mixins/media";

  .container {
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    gap: var(--padding-2x);

    width: 100%;
    --item-height: calc(var(--button-min-height) + var(--padding));

    @include media.min-width(medium) {
      justify-content: space-between;
      flex-direction: row;
      align-items: center;
    }

    .start-wrapper {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: var(--padding-2x);

      height: var(--item-height);
    }

    .icon-wrapper {
      aspect-ratio: 1 / 1;
      height: 100%;

      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
