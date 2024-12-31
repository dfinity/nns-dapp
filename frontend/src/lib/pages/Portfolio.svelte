<script lang="ts">
  import Card from "$lib/components/portfolio/Card.svelte";
  import LoginCard from "$lib/components/portfolio/LoginCard.svelte";
  import NoTokensCard from "$lib/components/portfolio/NoTokensCard.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
</script>

<main data-tid="portfolio-page-component">
  <div class="top" class:single-card={$authSignedInStore}>
    {#if !$authSignedInStore}
      <LoginCard />
    {/if}
    <Card>Card1</Card>
  </div>
  <div class="content">
    <NoTokensCard />
    <Card>Card4</Card>
  </div>
</main>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  main {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
    padding: var(--padding-2x);

    @include media.min-width(large) {
      display: grid;
      grid-template-rows: auto 1fr;
      gap: var(--padding-3x);
      padding: var(--padding-3x);
    }

    .top {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--padding-2x);

      @include media.min-width(large) {
        grid-template-columns: 1fr 2fr;

        > :global(article:first-of-type) {
          order: 1;
        }

        &.single-card {
          grid-template-columns: 1fr;
        }
      }
    }

    .content {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--padding-2x);

      @include media.min-width(large) {
        grid-template-columns: repeat(2, 1fr);
        grid-auto-rows: min-content;
        align-items: stretch;
      }
    }
  }
</style>
