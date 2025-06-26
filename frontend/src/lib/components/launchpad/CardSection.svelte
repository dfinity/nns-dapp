<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    title: string;
    children: Snippet;
  };
  const { title, children }: Props = $props();
</script>

<div class="card-section" data-tid="card-section-component">
  <h4>{title}</h4>
  <div class="cards">
    {@render children()}
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  h4 {
    // TODO(launchpad): variables?
    font-size: 16px;
    font-weight: 450;
    line-height: 20px;
  }

  .card-section {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }

  .cards {
    display: flex;
    gap: var(--padding);

    @include media.min-width(medium) {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--padding-2x);
    }

    @include media.min-width(large) {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
