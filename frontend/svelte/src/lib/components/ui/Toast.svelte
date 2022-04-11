<script lang="ts">
  /**
   * A toast - snack-bar to display a short info or error message.
   */
  import IconClose from "../../icons/IconClose.svelte";
  import { toastsStore } from "../../stores/toasts.store";
  import { fade, fly } from "svelte/transition";
  import { translate } from "../../utils/i18n.utils";
  import { i18n } from "../../stores/i18n";
  import type { ToastLevel, ToastMsg } from "../../types/toast";

  export let msg: ToastMsg;

  const close = () => toastsStore.hide();
  let text: string | undefined;

  let labelKey: string;
  let level: ToastLevel;
  let detail: string | undefined;

  $: ({ labelKey, level, detail } = msg);
  $: text = `${translate({ labelKey })}${
    detail !== undefined ? ` ${detail}` : ""
  }`;
</script>

<div
  role="dialog"
  class="toast"
  class:error={level === "error"}
  class:warn={level === "warn"}
  in:fly={{ y: 100, duration: 200 }}
  out:fade={{ delay: 100 }}
>
  <p title={text}>
    {text}
  </p>

  <button on:click={close} aria-label={$i18n.core.close}><IconClose /></button>
</div>

<style lang="scss">
  @use "../../themes/mixins/text";
  @use "../../themes/mixins/media";

  .toast {
    display: flex;
    justify-content: space-between;
    align-items: center;

    position: fixed;
    bottom: var(--padding-2x);
    left: 50%;
    transform: translate(-50%, 0);

    border-radius: var(--border-radius);
    background: var(--black);
    color: var(--black-contrast);
    box-shadow: 0 4px 16px 0 rgba(var(--background-rgb), 0.3);

    width: calc(100% - (8 * var(--padding)));

    padding: var(--padding) var(--padding-2x);
    box-sizing: border-box;

    z-index: calc(var(--z-index) + 999);

    @include media.min-width(large) {
      max-width: var(--section-max-width);
    }

    &.error {
      background: var(--pink);
      color: var(--pink-contrast);
    }

    &.warn {
      background: var(--yellow-500);
      color: var(--yellow-500-contrast);
    }
  }

  p {
    @include text.clamp(4);

    margin: 0;
    font-size: 1rem;

    @include media.min-width(medium) {
      @include text.clamp(2);
    }
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    padding: 0;
  }
</style>
