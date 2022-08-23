<script lang="ts">
  /**
   * A toast - snack-bar to display a short info or error message.
   */
  import { toastsStore } from "../../stores/toasts.store";
  import { fade, fly } from "svelte/transition";
  import {
    type I18nSubstitutions,
    replacePlaceholders,
    translate,
  } from "../../utils/i18n.utils";
  import { i18n } from "../../stores/i18n";
  import type { ToastLevel, ToastMsg } from "../../types/toast";
  import { onDestroy, onMount, SvelteComponent } from "svelte";
  import Spinner from "./Spinner.svelte";
  import IconWarning from "../../icons/IconWarning.svelte";
  import { IconClose } from "@dfinity/gix-components";
  import IconInfoOutline from "../../icons/IconInfoOutline.svelte";
  import IconCheckCircleOutline from "../../icons/IconCheckCircleOutline.svelte";
  import IconError from "../../icons/IconError.svelte";

  export let msg: ToastMsg;

  const iconMapper = (level: ToastLevel): typeof SvelteComponent =>
    ({
      ["success"]: IconCheckCircleOutline,
      ["warn"]: IconWarning,
      ["error"]: IconError,
      ["info"]: IconInfoOutline,
    }[level]);

  const close = () => toastsStore.hide(msg.id);
  let text: string | undefined;

  let labelKey: string;
  let level: ToastLevel;
  let detail: string | undefined;
  let substitutions: I18nSubstitutions | undefined;
  let spinner: boolean | undefined;

  $: ({ labelKey, level, detail, substitutions, spinner } = msg);
  $: text = `${replacePlaceholders(
    translate({ labelKey }),
    substitutions ?? {}
  )}${detail !== undefined ? ` ${detail}` : ""}`;

  let timeoutId: NodeJS.Timeout | undefined = undefined;

  const autoHide = () => {
    const { duration } = msg;

    if (duration === undefined) {
      return;
    }

    timeoutId = setTimeout(close, duration);
  };

  const cleanUpAutoHide = () => {
    if (timeoutId === undefined) {
      return;
    }

    clearTimeout(timeoutId);
  };

  onMount(autoHide);
  onDestroy(cleanUpAutoHide);
</script>

<div
  role="dialog"
  class="toast"
  in:fly={{ y: 100, duration: 200 }}
  out:fade={{ delay: 100 }}
>
  <div class="icon {level}" aria-hidden="true">
    {#if spinner}
      <Spinner size="small" inline />
    {:else}
      <svelte:component this={iconMapper(level)} />
    {/if}
  </div>

  <p>{text}</p>

  <button class="close" on:click={close} aria-label={$i18n.core.close}
    ><IconClose /></button
  >
</div>

<style lang="scss">
  .toast {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--padding-1_5x);

    border-radius: var(--border-radius);
    background: var(--card-background);
    box-shadow: var(--strong-shadow, 8px 8px 16px 0 rgba(0, 0, 0, 0.25));

    padding: var(--padding-1_5x);
    box-sizing: border-box;

    .icon {
      line-height: 0;

      &.success {
        color: var(--positive-emphasis);
      }

      &.info {
        color: var(--primary);
      }

      &.warn {
        color: var(--warning-emphasis-shade);
      }

      &.error {
        color: var(--negative-emphasis);
      }
    }

    p {
      margin: 0;
      flex-grow: 1;
      align-self: center;
      word-break: break-word;

      // (>=3 lines x 1rem) + top/bottom paddings
      max-height: calc(8.5 * var(--padding));
      overflow-y: auto;
    }

    button.close {
      padding: 0;
      line-height: 0;
    }
  }
</style>
