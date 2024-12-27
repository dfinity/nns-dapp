<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconAccountsPage } from "@dfinity/gix-components";
  import Card from "./Card.svelte";

  export let primaryCard = false;
  const href = "/neurons";
</script>

<Card testId="no-neurons-card">
  <div class="wrapper">
    <div class="icon">
      <IconAccountsPage />
    </div>
    <div class="text">
      <p class="description">{$i18n.portfolio.no_neurons_card_description}</p>
    </div>
    <a
      {href}
      class="button"
      class:primary={primaryCard}
      class:secondary={!primaryCard}>{$i18n.portfolio.no_neurons_card_button}</a
    >
  </div>
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .wrapper {
    box-sizing: border-box;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--padding-4x);

    padding: var(--padding-3x);
    margin: 0 auto;
    max-width: 400px;
    height: 100%;
    text-align: center;

    .icon {
      width: 80px;
      height: 80px;

      @include media.min-width(medium) {
        width: 144px;
        height: 144px;
      }
    }
    .text {
      p {
        margin: 0;
        margin-top: var(--padding);
      }
    }
  }
</style>
