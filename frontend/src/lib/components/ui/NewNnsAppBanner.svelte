<script lang="ts">
  import { browser } from "$app/environment";
  import icpLogo from "$lib/assets/icp-rounded.svg";
  import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
  import { analytics } from "$lib/services/analytics.services";
  import { i18n } from "$lib/stores/i18n";
  import { IconOpenInNew } from "@dfinity/gix-components";
  import { fade } from "svelte/transition";

  const NEW_NNS_APP_URL = "https://nns.internetcomputer.org";
  const localStorageKey = StoreLocalStorageKey.NewNnsAppBanner;

  let isOpen = $state(false);

  $effect.pre(() => {
    if (browser) {
      isOpen = JSON.parse(
        localStorage?.getItem(localStorageKey) ?? "true"
      ) as boolean;
    }
  });

  const close = () => {
    isOpen = false;
    localStorage?.setItem(localStorageKey, "false");
    analytics.event("new-nns-app-banner", { action: "stay-here" });
  };

  const dismiss = () => {
    isOpen = false;
  };
</script>

<svelte:window onkeydown={(e) => isOpen && e.key === "Escape" && dismiss()} />

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="backdrop" transition:fade={{ duration: 200 }} onclick={dismiss}>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="banner"
      role="dialog"
      aria-modal="true"
      aria-label={$i18n.highlight.new_nns_app_title}
      data-tid="new-nns-app-banner"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="hero">
        <div class="logo">
          <img src={icpLogo} alt="ICP" width="48" height="48" />
        </div>
      </div>

      <div class="body">
        <h3 class="title" data-tid="new-nns-app-title">
          {$i18n.highlight.new_nns_app_title}
        </h3>
        <p data-tid="new-nns-app-description">
          {$i18n.highlight.new_nns_app_description}
        </p>

        <div class="actions">
          <a
            class="button primary with-icon"
            data-tid="new-nns-app-cta"
            href={NEW_NNS_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onclick={() =>
              analytics.event("new-nns-app-banner", { action: "open-new-app" })}
          >
            {$i18n.highlight.new_nns_app_cta}
            <IconOpenInNew size="16" />
          </a>
          <button class="secondary" data-tid="new-nns-app-stay" onclick={close}>
            {$i18n.highlight.new_nns_app_stay}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .backdrop {
    position: fixed;
    inset: 0;
    z-index: calc(var(--bottom-sheet-z-index) + 2);
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--padding-2x);
  }

  .banner {
    background: var(--card-background);
    border-radius: var(--border-radius-2x);
    box-shadow: var(--box-shadow);
    width: 100%;
    max-width: 560px;
    overflow: hidden;
  }

  .hero {
    // The gradient is custom, no theme variable exists for decorative gradients
    --hero-gradient: linear-gradient(
      135deg,
      #c8d2f5 0%,
      #f5e6f0 50%,
      #f5e0d0 100%
    );

    background: var(--hero-gradient);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--padding-8x) var(--padding-3x);
  }

  @include media.dark-theme() {
    .hero {
      --hero-gradient: linear-gradient(
        135deg,
        #1e2347 0%,
        #2a1f3d 50%,
        #2d2235 100%
      );
    }
  }

  .logo {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: var(--box-shadow);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .body {
    padding: var(--padding-4x) var(--padding-4x) var(--padding-4x);
    text-align: center;
  }

  .title {
    margin: 0 0 var(--padding);
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--value-color);
  }

  p {
    margin: 0 0 var(--padding-3x);
    color: var(--description-color);
    line-height: 1.5;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: var(--padding-1_5x);

    @include media.min-width(medium) {
      flex-direction: row-reverse;
    }
  }

  .actions a,
  .actions button {
    flex: 1;
  }
</style>
