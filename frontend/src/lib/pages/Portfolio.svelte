<script lang="ts">
  import Card from "$lib/components/portfolio/Card.svelte";
  import LoginCard from "$lib/components/portfolio/LoginCard.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
</script>

<main data-tid="portfolio-page-component">
  <div class="top" class:single-card={$authSignedInStore}>
    <Card>Card1</Card>
    {#if !$authSignedInStore}
      <LoginCard />
    {/if}
  </div>
  <div class="content">
    <Card>Card3</Card>
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
      display: flex;
      flex-direction: column-reverse;
      gap: var(--padding-2x);

      @include media.min-width(large) {
        display: grid;
        grid-template-columns: 1fr 2fr;

        &.single-card {
          grid-template-columns: 1fr;
        }
      }
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: var(--padding-2x);
      grid-template-columns: 1fr;

      @include media.min-width(large) {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }
</style>
