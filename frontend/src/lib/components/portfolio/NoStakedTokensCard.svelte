<script lang="ts">
  import Card from "$lib/components/portfolio/Card.svelte";
  import TokensCardHeader from "$lib/components/portfolio/TokensCardHeader.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { isMobileViewportStore } from "$lib/derived/viewport.derived";
  import { i18n } from "$lib/stores/i18n";
  import { IconNeuronsPage, IconStakedTokens } from "@dfinity/gix-components";

  const href = AppPath.Neurons;
</script>

<Card testId="no-staked-tokens-card">
  <div class="wrapper">
    <TokensCardHeader
      {href}
      title={$i18n.portfolio.staked_tokens_card_title}
      linkText={$i18n.portfolio.staked_tokens_card_link}
    >
      {#snippet icon()}
        <IconNeuronsPage />
      {/snippet}
    </TokensCardHeader>

    <div class="content">
      {#if !$isMobileViewportStore}
        <span class="icon">
          <IconStakedTokens size="100px" />
        </span>
      {/if}
      <p>{$i18n.portfolio.no_neurons_card_description}</p>
    </div>
  </div>
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .wrapper {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: 100%;

    .content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-grow: 1;
      padding: 16px;
      gap: 32px;

      @include media.min-width(small) {
        padding: 24px;
      }

      .icon {
        flex-shrink: 0;
        opacity: 0.7;
      }

      p {
        margin: 0;
        padding: 0;
        color: var(--text-description);
      }
    }
  }
</style>
