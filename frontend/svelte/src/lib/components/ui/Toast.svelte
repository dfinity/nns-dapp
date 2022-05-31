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
  import { onDestroy, onMount } from "svelte";

  export let msg: ToastMsg;

  const close = () => toastsStore.hide(msg.id);
  let text: string | undefined;

  let labelKey: string;
  let level: ToastLevel;
  let detail: string | undefined;
  let substitutions: I18nSubstitutions | undefined;

  $: ({ labelKey, level, detail, substitutions } = msg);
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
  class:error={level === "error"}
  class:warn={level === "warn"}
  in:fly={{ y: 100, duration: 200 }}
  out:fade={{ delay: 100 }}
>
  <p>
    {text}
  </p>

  <button
    class="close"
    class:error={level === "error"}
    class:warning={level === "warn"}
    on:click={close}>{$i18n.core.close}</button
  >
</div>

<style lang="scss">
  .toast {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--padding);

    // (>=3 lines x 1rem) + top/bottom paddings
    height: calc(8.5 * var(--padding));

    border-radius: var(--border-radius);
    background: var(--green-500);
    color: var(--green-500-contrast);
    box-shadow: 0 4px 16px 0 rgba(var(--background-rgb), 0.3);

    padding: var(--padding) var(--padding-2x);
    box-sizing: border-box;

    --scrollbar-background: #9dd196;
    --scrollbar-thumb: var(--green-500-shade);

    ::-webkit-scrollbar {
      background: var(--scrollbar-background);
      width: 0.8em;
      border-radius: 0.5em;
      -webkit-border-radius: 0.5em;
    }
    ::-webkit-scrollbar-thumb {
      background: var(--scrollbar-thumb);
      border: solid 2.5px var(--scrollbar-thumb);
      height: auto;
    }

    &.error {
      background: var(--pink);
      color: var(--pink-contrast);
      --scrollbar-background: #ffa3c5;
      --scrollbar-thumb: #a9054c;
    }

    &.warn {
      background: var(--yellow-500);
      color: var(--yellow-500-contrast);
      --scrollbar-background: var(--yellow-500-tint);
      --scrollbar-thumb: var(--yellow-500);

      button.close {
        color: var(--yellow-500-contrast);
      }
    }
  }

  p {
    margin: 0;
    max-height: 100%;
    overflow-y: auto;
    word-break: break-word;
  }

  button.close {
    // rewrite default button styles
    padding: var(--padding-0_5x) var(--padding);
    min-height: 0;
    border: 1px solid;
    border-radius: var(--border-radius);
    font-size: var(--font-size-h5);
  }
</style>
