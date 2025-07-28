<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { abandonedProjectsCanisterId } from "$lib/constants/canister-ids.constants";
  import { E8S_PER_ICP } from "$lib/constants/icp.constants";
  import { AppPath } from "$lib/constants/routes.constants";
  import { snsProjectsActivePadStore } from "$lib/derived/sns/sns-projects.derived";
  import { isDesktopViewportStore } from "$lib/derived/viewport.derived";
  import { i18n } from "$lib/stores/i18n";
  import { compactCurrencyNumber, formatNumber } from "$lib/utils/format.utils";
  import { filterProjectsStatus } from "$lib/utils/projects.utils";
  import { IconRight } from "@dfinity/gix-components";
  import { SnsSwapLifecycle } from "@dfinity/sns";
  import { fade } from "svelte/transition";

  type Props = {
    withUpcomingLaunchesCards?: boolean;
  };
  const { withUpcomingLaunchesCards = false }: Props = $props();

  const snsProjects = $derived($snsProjectsActivePadStore);
  const launchedSnsProjects = $derived(
    filterProjectsStatus({
      swapLifecycle: SnsSwapLifecycle.Committed,
      projects: snsProjects,
    })
  );
  const raisedFunds = $derived(
    Number(
      launchedSnsProjects.reduce(
        (sum, project) =>
          sum + (project.summary.derived.buyer_total_icp_e8s ?? 0n),
        0n
      )
    ) / E8S_PER_ICP
  );
  const snsDaoLaunched = $derived(launchedSnsProjects.length);
  const proposalExecuted = "8500+";
  // get 15 [5x3] random logos from launched projects
  const logos = $derived.by(() => {
    const shuffle = <T,>(arr: T[]): T[] => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    const logos = launchedSnsProjects
      // remove abandoned projects because they don't provide a logo
      .filter(
        ({ rootCanisterId }) =>
          !abandonedProjectsCanisterId.includes(rootCanisterId.toText())
      )
      .map((project) => project.summary.metadata.logo);

    return shuffle(logos).slice(0, 15);
  });
</script>

{#snippet banner()}
  <div class="content">
    <div class="info">
      <h3 data-tid="launchpad-banner-title">{$i18n.launchpad.banner_title}</h3>
      <p>{$i18n.launchpad.banner_text}</p>
      <a href={AppPath.Launchpad} class="link" aria-label={$i18n.core.view}>
        <span>{$i18n.launchpad.banner_link}</span>
        <IconRight />
      </a>
    </div>

    <div class="stats">
      <div class="stat-item stat-item--a">
        <h6 data-tid="launchpad-banner-raised-by">
          {$i18n.launchpad.banner_raised_by}
        </h6>
        <span class="value" data-tid="launchpad-banner-raised-value">
          {withUpcomingLaunchesCards
            ? formatNumber(raisedFunds, { minFraction: 0, maxFraction: 0 })
            : compactCurrencyNumber(raisedFunds)}
          {$i18n.core.icp}
        </span>
      </div>
      <div class="stat-divider stat-divider--a"></div>
      <div class="stat-item stat-item--b">
        <h6 data-tid="launchpad-banner-launched">
          {$i18n.launchpad.banner_launched}
        </h6>
        <span class="value" data-tid="launchpad-banner-launched-value"
          >{snsDaoLaunched}</span
        >
      </div>
      <div class="stat-divider stat-divider--b"></div>
      <div class="stat-item stat-item--c">
        <h6 data-tid="launchpad-banner-proposals-executed">
          {$i18n.launchpad.banner_proposals_executed}
        </h6>
        <span class="value" data-tid="launchpad-banner-proposals-executed-value"
          >{proposalExecuted}</span
        >
      </div>
    </div>
  </div>
{/snippet}

<TestIdWrapper testId="launchpad-banner-component">
  {#if snsDaoLaunched > 0}
    {#if $isDesktopViewportStore}
      <section
        class="launchpad-banner"
        role="alert"
        aria-live="polite"
        data-tid="launchpad-banner-desktop-component"
        class:withUpcomingLaunchesCards
      >
        <div class="background">
          {#each logos as logo, index (logo)}
            <div
              class="logo"
              in:fade={{ delay: index * Math.random() * 250, duration: 1000 }}
            >
              <Logo
                src={logo}
                alt={$i18n.sns_launchpad.project_logo}
                size="huge"
              />
            </div>
          {/each}
        </div>

        {@render banner()}
      </section>
    {:else}
      <a
        href={AppPath.Launchpad}
        class="launchpad-banner"
        data-tid="launchpad-banner-mobile-component"
        aria-label={$i18n.core.view}
      >
        {@render banner()}
      </a>
    {/if}
  {/if}
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .launchpad-banner {
    background-color: var(--tag-background);
    border-radius: var(--border-radius-2x);
    min-width: 100%;
    padding: 0;

    // Extra mode when rendering together with upcoming launches cards.
    &.withUpcomingLaunchesCards {
      @include media.min-width(large) {
        .background {
          --bg-width: 50%;
        }

        .stats {
          flex: 2;
          padding: 30px 52px;
          gap: var(--padding-2x);

          grid-template-columns: 1fr auto 1fr;
          grid-template-rows: auto auto;
          grid-template-areas:
            "a a a"
            "b sep c";
        }

        .stat-item.stat-item--a {
          grid-area: a;

          .value {
            font-size: 27px;
            font-weight: 450;
            line-height: 31px;
          }
        }
        .stat-item.stat-item--b {
          grid-area: b;
        }
        .stat-item.stat-item--c {
          grid-area: c;
        }
        .stat-divider.stat-divider--a {
          grid-area: sep;
        }
        .stat-divider.stat-divider--b {
          display: none;
        }

        .stat-item--b,
        .stat-item--c {
          .value {
            font-size: 18px;
            font-weight: 450;
            line-height: 24px;
          }
        }
      }
    }
  }
  a.launchpad-banner {
    text-decoration: none;
  }
  section.launchpad-banner {
    // For the background
    position: relative;
    overflow: hidden;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
    padding: var(--padding-2x);
    z-index: 1;
    font-family: CircularXX;

    @include media.min-width(large) {
      flex-direction: row;
      gap: var(--padding-3x);
      padding: var(--padding-3x);
    }

    h3,
    h6,
    p {
      padding: 0;
      margin: 0;
    }
  }

  .info {
    flex: 2;
    z-index: 1;

    display: flex;
    flex-direction: column;
    gap: var(--padding);

    h3 {
      font-size: 18px;
      font-style: normal;
      font-weight: 450;
      line-height: 24px;
    }

    p {
      font-size: 12px;
      font-style: normal;
      font-weight: 450;
      line-height: 14px;

      @include media.min-width(large) {
        font-size: 14px;
        font-weight: 400;
        line-height: 18px;
        color: var(--tag-text);
      }
    }

    a {
      align-items: center;
      gap: var(--padding-0_5x);

      color: var(--primary);
      font-size: 14px;
      font-weight: 500;
      line-height: 18px;
      text-decoration: none;

      display: none;
      @include media.min-width(large) {
        display: flex;
      }
    }
  }

  // Dark theme exceptions
  @include media.dark-theme {
    .launchpad-banner .stats {
      @include media.min-width(large) {
        background: rgba(33, 39, 51, 0.4);

        .stat-divider {
          border-right-color: var(--night-575);
        }
      }
    }
  }

  .stats {
    flex: 3;
    display: flex;
    gap: var(--padding);

    @include media.min-width(large) {
      padding: var(--padding-2x) var(--padding-3x);
      display: grid;
      grid-template-columns: 1fr auto 1fr auto 1fr;
      justify-content: space-around;
      align-items: center;
      gap: var(--padding-3x);

      border-radius: var(--border-radius);
      background: rgba(#fff, 0.45);
      backdrop-filter: blur(11.5px);
    }
    @include media.min-width(xlarge) {
      flex: 1;
    }

    .stat-divider {
      width: 0;
      border-right: 1px solid var(--primary-contrast);
      margin: 0 var(--padding);

      @include media.min-width(large) {
        border-right-color: var(--elements-divider);
      }
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      gap: var(--padding-0_5x);

      @include media.min-width(large) {
        flex-direction: column-reverse;
        justify-content: center;
      }

      h6 {
        font-size: 11px;
        font-weight: 450;
        line-height: 13px;
        color: var(--label-color);

        @include media.min-width(large) {
          color: var(--description-color);
        }
      }

      .value {
        font-size: 16px;
        font-weight: 450;
        line-height: 20px;

        @include media.min-width(large) {
          font-size: 18px;
          font-weight: 450;
          line-height: 24px;
        }
      }
    }
  }

  .background {
    --bg-width: 465px;
    --logo-size: 65px;
    --logo-gap: 32px;
    --logo-1-column-y: 8px;
    --logo-2-column-y: -30px;
    --logo-3-column-y: 2px;
    --logo-4-column-y: 40px;
    --logo-5-column-y: 10px;

    position: absolute;
    top: 0;
    right: 0;
    width: var(--bg-width);
    height: 100%;

    display: none;
    @include media.min-width(large) {
      display: block;
    }
    @include media.min-width(xlarge) {
      --bg-width: 40%;
    }

    .logo {
      position: absolute;
      // Some logos are too contrasty that they decrease readability.
      opacity: 0.75;

      // x: 0, y: 0
      &:nth-child(1) {
        top: var(--logo-1-column-y);
        left: 0;
      }
      // x: 0, y: 1
      &:nth-child(2) {
        top: calc(var(--logo-1-column-y) + var(--logo-size) + var(--logo-gap));
        left: 0;
      }
      // x: 0, y: 2
      &:nth-child(3) {
        top: calc(
          var(--logo-1-column-y) + 2 * (var(--logo-size) + var(--logo-gap))
        );
        left: 0;
      }

      // x: 1, y: 0
      &:nth-child(4) {
        top: var(--logo-2-column-y);
        left: calc(1 * (var(--logo-size) + var(--logo-gap)));
      }
      // x: 1, y: 1
      &:nth-child(5) {
        top: calc(var(--logo-2-column-y) + var(--logo-size) + var(--logo-gap));
        left: calc(1 * (var(--logo-size) + var(--logo-gap)));
      }
      // x: 1, y: 2
      &:nth-child(6) {
        top: calc(
          var(--logo-2-column-y) + 2 * (var(--logo-size) + var(--logo-gap))
        );
        left: calc(1 * (var(--logo-size) + var(--logo-gap)));
      }

      // x: 2, y: 0
      &:nth-child(7) {
        top: var(--logo-3-column-y);
        left: calc(2 * (var(--logo-size) + var(--logo-gap)));
      }
      // x: 2, y: 1
      &:nth-child(8) {
        top: calc(var(--logo-3-column-y) + var(--logo-size) + var(--logo-gap));
        left: calc(2 * (var(--logo-size) + var(--logo-gap)));
      }
      // x: 2, y: 2
      &:nth-child(9) {
        top: calc(
          var(--logo-3-column-y) + 2 * (var(--logo-size) + var(--logo-gap))
        );
        left: calc(2 * (var(--logo-size) + var(--logo-gap)));
      }

      // x: 3, y: 0
      &:nth-child(10) {
        top: var(--logo-4-column-y);
        left: calc(3 * (var(--logo-size) + var(--logo-gap)));
      }
      // x: 3, y: 1
      &:nth-child(11) {
        top: calc(var(--logo-4-column-y) + var(--logo-size) + var(--logo-gap));
        left: calc(3 * (var(--logo-size) + var(--logo-gap)));
      }
      // x: 3, y: 2
      &:nth-child(12) {
        top: calc(
          var(--logo-4-column-y) + 2 * (var(--logo-size) + var(--logo-gap))
        );
        left: calc(3 * (var(--logo-size) + var(--logo-gap)));
      }

      // x: 4, y: 0
      &:nth-child(13) {
        top: var(--logo-5-column-y);
        left: calc(4 * (var(--logo-size) + var(--logo-gap)));
      }
      // x: 4, y: 1
      &:nth-child(14) {
        top: calc(var(--logo-5-column-y) + var(--logo-size) + var(--logo-gap));
        left: calc(4 * (var(--logo-size) + var(--logo-gap)));
      }
      // x: 4, y: 2
      &:nth-child(15) {
        top: calc(
          var(--logo-5-column-y) + 2 * (var(--logo-size) + var(--logo-gap))
        );
        left: calc(4 * (var(--logo-size) + var(--logo-gap)));
      }
    }
  }
</style>
