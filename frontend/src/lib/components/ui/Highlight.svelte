<script lang="ts" module>
  const iconMapper: Record<Props["level"], Component> = {
    ["info"]: IconEyeOpen,
    ["success"]: IconCheck,
    ["warn"]: IconErrorOutline,
    ["danger"]: IconErrorOutline,
  };
</script>

<script lang="ts">
  import { browser } from "$app/environment";
  import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
  import { i18n } from "$lib/stores/i18n";
  import {
    IconCheck,
    IconClose,
    IconErrorOutline,
    IconEyeOpen,
  } from "@dfinity/gix-components";
  import { type Component } from "svelte";
  import { fade } from "svelte/transition";

  const iconMapper: Record<Props["level"], Component> = {
    ["info"]: IconEyeOpen,
    ["success"]: IconCheck,
    ["warn"]: IconErrorOutline,
    ["danger"]: IconErrorOutline,
  };

  type Props = {
    level: "info" | "success" | "warn" | "danger";
    title: string;
    description: string;
    link?: string;
    id: string;
  };

  const { level, title, description, link, id }: Props = $props();
  const localStorageKey = StoreLocalStorageKey.HighlightDisplay + id;

  // TODO: Extract this into a util. This is a copy of $lib/components/header/Banner
  let isOpen = $state(
    browser
      ? (JSON.parse(
          localStorage?.getItem(localStorageKey) ?? "true"
        ) as boolean)
      : false
  );
  const Icon = $derived(iconMapper[level]);

  const close = () => {
    isOpen = false;

    localStorage?.setItem(localStorageKey, "false");
  };

  onMount(() => {
    const isClosed = localStorage.getItem(storageKeyPrefix);

    if (isClosed === "true") isOpen = false;
  });
</script>

{#if isOpen}
  <div
    class="highlight"
    role="alert"
    aria-live="polite"
    data-tid="highlight-component"
    out:fade={{ duration: 200 }}
  >
    <div class="highlight-wrapper">
      <div class="highlight-header">
        <div class="highlight-icon {level}" aria-hidden="true">
          <Icon size="24" />
        </div>

        <button
          data-tid="close-button"
          class="close"
          onclick={close}
          aria-label={$i18n.core.close}><IconClose /></button
        >
      </div>

      <div class="highlight-title" data-tid="highlight-title">{title}</div>
      <div class="highlight-content">
        <p class="highlight-description" data-tid="highlight-description"
          >{description}</p
        >

        {#if link}
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            class="highlight-link"
            data-tid="highlight-link"
            >{$i18n.core.view_more}
          </a>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .highlight {
    box-sizing: border-box;

    position: fixed;
    z-index: 1000;
    padding: var(--padding-2x) var(--padding-3x);

    border-radius: var(--border-radius);
    box-shadow: 8px 8px 16px 0 rgba(0, 0, 0, 0.25);

    background: var(--card-background-tint);
    color: var(--content-color);

    width: 90%;
    min-height: 204px;

    top: calc(var(--header-height) + var(--padding-2x));
    right: auto;
    left: 50%;
    transform: translateX(-50%);

    @include media.min-width(medium) {
      width: 423px;

      right: 48px;
      bottom: 64px;
      transform: translateX(0);
      left: auto;
      top: auto;
    }

    .highlight-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--padding-2x);

      .highlight-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .highlight-icon {
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;

          &.info {
            background-color: var(--background);
            color: var(--background-contrast);
          }

          &.success {
            background-color: var(--positive-emphasis-light);
            color: var(--positive-emphasis);
          }

          &.warn {
            background-color: var(--warning-emphasis-light);
            color: var(--warning-emphasis);
          }

          &.danger {
            background-color: var(--negative-emphasis-light);
            color: var(--negative-emphasis);
          }
        }
      }

      .highlight-title {
        @include fonts.h5();
        font-weight: bold;
      }

      .highlight-content {
        @include fonts.standard();

        display: flex;
        flex-direction: column;
        gap: var(--padding);

        .highlight-link {
          color: var(--button-secondary-color);
          font-weight: var(--font-weight-bold);
          text-decoration: none;
        }
      }
    }
  }
</style>
