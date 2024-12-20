<script lang="ts">
  import Card from "$lib/components/portfolio/Card.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
</script>

<main>
  <div class="top">
    <Card>Card1</Card>
    {#if $authSignedInStore}
      <Card>Card2</Card>
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
      grid-template-rows: 150px 1fr;
      gap: var(--padding-3x);
      padding: var(--padding-3x);
    }

    .top {
      display: flex;
      flex-direction: column;
      gap: var(--padding-2x);

      :global(:nth-child(1)) {
        order: 1;
      }

      @include media.min-width(large) {
        display: grid;
        grid-template-columns: repeat(3, 1fr);

        :global(:nth-child(1)) {
          order: 0;
        }

        &:has(:first-child:nth-last-child(1)) {
          /* If only one card */
          grid-template-columns: 1fr;
        }

        &:has(:first-child:nth-last-child(2)) {
          /* If two cards */
          grid-template-columns: 1fr 2fr;
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
