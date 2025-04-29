<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    IconCheck,
    IconClose,
    IconErrorOutline,
    IconEyeOpen,
  } from "@dfinity/gix-components";
  import type { Component } from "svelte";

  type Props = {
    level: "info" | "success" | "warn" | "danger";
    title: string;
    description: string;
    link: string;
  };

  const { level, title, description, link }: Props = $props();

  let isOpen = $state(true);

  const iconMapper: Record<Props["level"], Component> = {
    ["info"]: IconEyeOpen,
    ["success"]: IconCheck,
    ["warn"]: IconErrorOutline,
    ["danger"]: IconErrorOutline,
  };

  const Icon = $derived(iconMapper[level]);
  const close = () => {
    isOpen = false;
  };
</script>

{#if isOpen}
  <div class="highlight">
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

      <div class="highlight-title">{title}</div>
      <div class="highlight-content">
        <p class="highlight-description">{description}</p>

        <a href={link} class="highlight-link">View more</a>
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
    box-shadow: var(--strong-shadow, 8px 8px 16px 0 rgba(0, 0, 0, 0.25));

    background: var(--card-background);

    width: 320px;
    height: 204px;

    right: auto;
    left: 50%;
    transform: translateX(-50%);

    @include media.min-width(medium) {
      width: 423px;

      right: 48px;
      bottom: 64px;
      transform: translateX(0);
      left: auto;
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
