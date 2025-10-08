<script lang="ts">
  import Card from "$lib/components/portfolio/Card.svelte";
  import TokensCardHeader from "$lib/components/portfolio/TokensCardHeader.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { isMobileViewportStore } from "$lib/derived/viewport.derived";
  import { i18n } from "$lib/stores/i18n";
  import { IconAccountsPage, IconHeldTokens } from "@dfinity/gix-components";

  type Props = {
    icpOnlyTable?: boolean;
  };

  const { icpOnlyTable = false }: Props = $props();

  const href = AppPath.Tokens;
</script>

<Card testId={icpOnlyTable ? "no-held-icp-card" : "no-held-tokens-card"}>
  <div
    class="wrapper"
    role="region"
    aria-label={$i18n.portfolio.held_tokens_card_title}
  >
    <TokensCardHeader
      {href}
      title={$i18n.portfolio.held_tokens_card_title}
      linkText={$i18n.portfolio.held_tokens_card_link}
    >
      {#snippet icon()}
        <IconHeldTokens />
      {/snippet}
    </TokensCardHeader>
    <div class="content">
      {#if !$isMobileViewportStore}
        <span class="icon">
          <IconAccountsPage size="100px" />
        </span>
      {/if}
      <p>{$i18n.portfolio.no_tokens_card_description}</p>
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
