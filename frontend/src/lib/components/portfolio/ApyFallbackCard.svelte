<script lang="ts">
  import { isMobileViewportStore } from "$lib/derived/viewport.derived";
  import { i18n } from "$lib/stores/i18n";
  import { IconError } from "@dfinity/gix-components";

  type Props = {
    stakingRewardData:
      | { loading: true }
      | {
          loading: false;
          error: string;
        };
  };

  const { stakingRewardData }: Props = $props();

  const isError = $derived(
    !stakingRewardData.loading && "error" in stakingRewardData
  );
  const testId = "apy-fallback-card";
</script>

{#snippet loadingContent()}
  <div class="content" data-tid="loading-content">
    <div class="content">
      <div class="subtitle skeleton"></div>
      <div class="main-value skeleton"></div>
      <div class="secondary-value">
        <div class="projection-skeleton skeleton"></div>
        <div class="estimation-skeleton skeleton"></div>
      </div>
    </div>

    <div class="content">
      <div class="subtitle skeleton"></div>
      <div class="main-value skeleton"></div>
      <div class="secondary-value-single skeleton"></div>
    </div>
  </div>
{/snippet}

{#snippet errorContent()}
  <div class="error-content" data-tid="error-content">
    <div class="error-icon">
      <IconError size="20" />
    </div>
    <div class="error-text">
      {$i18n.portfolio.apy_card_error}
    </div>
  </div>
{/snippet}

{#if $isMobileViewportStore}
  <article class="card mobile" data-tid={testId}>
    {#if isError}
      {@render errorContent()}
    {:else}
      {@render loadingContent()}
    {/if}
  </article>
{:else}
  <article class="card desktop" data-tid={testId}>
    {#if isError}
      <div class="title-text">{$i18n.portfolio.apy_card_title}</div>
      {@render errorContent()}
      <div class="link-area"></div>
    {:else}
      <div class="title skeleton"></div>
      {@render loadingContent()}
      <div class="link skeleton"></div>
    {/if}
  </article>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  .skeleton {
    background: linear-gradient(
      90deg,
      var(--card-background) 0px,
      var(--elements-divider) 50%,
      var(--card-background) 100%
    );
    background-size: 1000px 100%;
    animation: shimmer 2s infinite linear;
    border-radius: 4px;
  }

  .content {
    display: flex;
    justify-content: space-between;

    .content {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      gap: 4px;

      .subtitle {
        height: 16px;
        width: 80px;
      }

      .main-value {
        height: 32px;
        width: 120px;

        @include media.min-width(medium) {
          height: 36px;
          width: 140px;
        }
      }

      .secondary-value {
        display: flex;
        gap: 4px;
        align-items: center;

        .projection-skeleton {
          height: 16px;
          width: 60px;

          @include media.min-width(medium) {
            height: 20px;
            width: 70px;
          }
        }

        .estimation-skeleton {
          height: 16px;
          width: 80px;

          @include media.min-width(medium) {
            height: 20px;
            width: 100px;
          }
        }
      }

      .secondary-value-single {
        height: 16px;
        width: 90px;

        @include media.min-width(medium) {
          height: 20px;
          width: 110px;
        }
      }
    }
  }

  .error-content {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;

    @include media.min-width(medium) {
      margin-top: 32px;
    }

    .error-icon {
      display: flex;
      align-items: center;
      color: var(--negative-emphasis);
    }

    .error-text {
      font-size: 16px;
      font-weight: 450;
      color: var(--text-primary);
    }
  }

  .card {
    height: 100%;
    box-sizing: border-box;
    background-color: var(--background);
    box-shadow: var(--box-shadow);
    border-radius: 12px;
    overflow: hidden;
  }

  .card.mobile {
    padding: 20px 16px;
  }

  .card.desktop {
    display: grid;
    grid-template-rows: auto auto 1fr;
    padding: 24px;
    grid-gap: 16px;

    .title-text {
      font-size: 18px;
      font-style: normal;
      font-weight: 450;
      line-height: 24px;
    }

    .link,
    .title {
      height: 24px;
      width: 120px;
    }

    .link {
      align-self: end;
      justify-self: end;
    }
  }
</style>
