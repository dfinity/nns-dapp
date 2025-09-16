<script>
  import Card from "$lib/components/portfolio/Card.svelte";
  import IconNeurons from "$lib/components/ui/icons/IconNeurons.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { isMobileViewportStore } from "$lib/derived/viewport.derived";
  import { i18n } from "$lib/stores/i18n";
  import { IconRight } from "@dfinity/gix-components";

  const testId = "start-staking-card";
  const href = AppPath.Staking;
  const linkText = $derived($i18n.portfolio.start_staking_card_link);
</script>

{#snippet backgroundIcon()}
  <div class="background-icon-container" aria-hidden="true">
    <div class="icon icon--mobile"><IconNeurons size="150px" /></div>
    <div class="icon icon--desktop"><IconNeurons size="200px" /></div>
  </div>
{/snippet}

{#if $isMobileViewportStore}
  <Card {testId}>
    {@render backgroundIcon()}
    <a {href} class="wrapper mobile" aria-label={linkText}>
      <h2 class="title">{$i18n.portfolio.start_staking_card_title}</h2>
      <p class="description">{$i18n.portfolio.start_staking_card_content}</p>
    </a>
  </Card>
{:else}
  <Card {testId}>
    {@render backgroundIcon()}
    <div class="wrapper desktop">
      <h2 class="title">{$i18n.portfolio.start_staking_card_title}</h2>
      <p class="description">{$i18n.portfolio.start_staking_card_content}</p>
      <a {href} aria-label={linkText}>
        <span>{linkText}</span>
        <IconRight />
      </a>
    </div>
  </Card>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  a {
    text-decoration: none;
  }

  .wrapper {
    height: 100%;
    background-color: var(--card-background-tint);
    box-sizing: border-box;

    h2,
    p {
      margin: 0;
      padding: 0;
    }

    .title {
      font-family: CircularXX;
      font-size: 18px;
      font-weight: 450;
      line-height: 24px;

      @include media.min-width(small) {
        font-size: 24px;
        line-height: 32px;
      }
    }
  }

  .mobile {
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .desktop {
    display: flex;
    flex-direction: column;
    padding: 24px;
    gap: 16px;

    a {
      display: flex;
      align-items: center;
      text-decoration: none;
      align-self: flex-end;
      margin-top: auto;
      font-weight: var(--font-weight-bold);

      color: var(--button-secondary-color);
    }
  }

  .background-icon-container {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    pointer-events: none;

    opacity: 0.07;

    .icon {
      color: #3d4d99;
      position: absolute;

      right: -10px;
      bottom: -20px;

      &--mobile {
        display: block;
        @include media.min-width(small) {
          display: none;
        }
      }

      &--desktop {
        display: none;
        @include media.min-width(small) {
          display: block;
        }
      }
    }
  }
</style>
