<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconAccountsPage } from "@dfinity/gix-components";
  import Card from "./Card.svelte";
</script>

<Card testId="no-tokens-card">
  <div class="wrapper">
    <div class="icon">
      <IconAccountsPage />
    </div>
    <div class="text">
      <h4>{$i18n.portfolio.no_tokens_card_title}</h4>
      <p class="description">{$i18n.portfolio.no_tokens_card_description}</p>
    </div>
    <button class="primary">{$i18n.portfolio.no_tokens_card_button}</button>
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
    max-width: 450px;
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
      text-align: center;
      h4,
      p {
        margin: 0;
        text-wrap: pretty;
      }
      p {
        margin-top: var(--padding);
      }
    }
  }
</style>
