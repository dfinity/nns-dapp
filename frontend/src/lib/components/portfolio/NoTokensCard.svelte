<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconAccountsPage } from "@dfinity/gix-components";
  import Card from "./Card.svelte";

  const href = "/tokens";
</script>

<Card testId="no-tokens-card">
  <div class="wrapper">
    <div class="icon">
      <IconAccountsPage />
    </div>
    <div class="text">
      <h5>{$i18n.portfolio.no_tokens_card_title}</h5>
      <p>{$i18n.portfolio.no_tokens_card_description}</p>
    </div>
    <a {href} class="button primary">{$i18n.portfolio.no_tokens_card_button}</a>
  </div>
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .wrapper {
    box-sizing: border-box;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: var(--padding-2x);

    padding: var(--padding-3x) var(--padding-2x);
    margin: 0 auto;
    height: 100%;
    text-align: center;

    @include media.min-width(medium) {
      gap: var(--padding-4x);
      padding: var(--padding-6x) var(--padding-4x);
      max-width: 450px;
    }

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
      color: var(--text-description);

      h5,
      p {
        margin: 0;
        text-wrap: pretty;
      }
      h5 {
        color: inherit;
        font-weight: bold;
      }
      p {
        margin-top: var(--padding);
      }
    }
  }
</style>
