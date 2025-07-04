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
</script>

{#if isOpen}
  <div
    class="highlight"
    role="alert"
    aria-live="polite"
    data-tid="highlight-component"
    out:fade={{ duration: 200 }}
  >
    <div class="wrapper">
      <div class="header">
        <div class="icon {level}" aria-hidden="true">
          <Icon size="24" />
        </div>

        <button
          data-tid="close-button"
          class="close"
          onclick={close}
          aria-label={$i18n.core.close}><IconClose size="24" /></button
        >
      </div>

      <div class="content">
        <h5 class="title" data-tid="highlight-title">{title}</h5>
        <p data-tid="highlight-description">{description}</p>
      </div>
      {#if link}
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          class="link"
          data-tid="highlight-link"
          >{$i18n.core.view_more}
        </a>
      {/if}
    </div>
  </div>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  :root {
    --highlight-info-bg: #ffffff26;
    --highlight-info-color: #fff;

    --highlight-success-bg: #2db28640;
    --highlight-success-color: #29a079;

    --highlight-warn-bg: #faa12340;
    --highlight-warn-color: #faa123;

    --highlight-danger-bg: #f2556f40;
    --highlight-danger-color: #f2556f;

    --highlight-background: #151a33;
    --highlight-text-color: #fff;
    --highligth-close-icon-color: #fff;

    --highligth-button: #4d79ff;

    --spacing-xs: 8px;
    --spacing-sm: 16px;
    --spacing-md: 24px;

    &[theme="dark"] {
      --highlight-info-bg: #dadef2;
      --highlight-info-color: #151a33;

      --highlight-success-bg: #2db28640;
      --highlight-success-color: #29a079;

      --highlight-warn-bg: #faa12340;
      --highlight-warn-color: #faa123;

      --highlight-danger-bg: #f2556f40;
      --highlight-danger-color: #f2556f;

      --highlight-background: #fff;
      --highlight-text-color: #151a33;
      --highligth-close-icon-color: #3d4d99;
    }
  }

  .highlight {
    box-sizing: border-box;

    position: fixed;
    z-index: calc(var(--bottom-sheet-z-index) + 1);

    padding: var(--spacing-md);
    border-radius: var(--spacing-xs);
    box-shadow: 8px 8px 16px 0 rgba(0, 0, 0, 0.25);

    background: var(--highlight-background);
    color: var(--highlight-text-color);

    min-height: 208px;

    top: calc(var(--header-height) + var(--spacing-sm));
    margin-left: var(--spacing-xs);
    margin-right: var(--spacing-xs);

    @include media.min-width(medium) {
      width: 400px;

      margin-left: 0;
      margin-right: 0;

      right: 46px;
      bottom: 54px;
      left: auto;
      top: auto;
    }

    .wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .close {
          color: var(--highligth-close-icon-color);
        }

        .icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;

          &.info {
            background-color: var(--highlight-info-bg);
            color: var(--highlight-info-color);
          }

          &.success {
            background-color: var(--highlight-success-bg);
            color: var(--highlight-success-color);
          }

          &.warn {
            background-color: var(--highlight-warn-bg);
            color: var(--highlight-warn-color);
          }

          &.danger {
            background-color: var(--highlight-danger-bg);
            color: var(--highlight-danger-color);
          }
        }
      }

      .content {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
        @include fonts.standard();
        color: var(--highlight-text-color);

        .title {
          font-weight: bold;
          color: var(--highlight-text-color);
        }
      }

      .link {
        color: var(--highligth-button);
        font-weight: var(--font-weight-bold);
        text-decoration: none;
      }
    }
  }
</style>
