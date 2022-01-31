<script lang="ts">
  /**
   * A toast - snack-bar to display a short info or error message.
   */
  import IconClose from "../icons/IconClose.svelte";
  import { toastsStore, ToastMsg } from "../stores/toasts.store";
  import { fade, fly } from "svelte/transition";
  import { translate } from "../utils/i18n.utils";
  import { i18n } from "../stores/i18n";

  export let msg: ToastMsg;

  const close = () => toastsStore.hide();

  $: ({ labelKey, level, detail } = msg || { labelKey: "", level: "info" } as ToastMsg);
</script>

<div
  role="dialog"
  class="toast"
  class:error={level === "error"}
  in:fly={{ y: 100, duration: 200 }}
  out:fade={{ delay: 100 }}
>
  <p>
    {translate({ labelKey })}{detail ? ` ${detail}` : ''}
  </p>

  <button on:click={close} aria-label={$i18n.core.close}><IconClose /></button>
</div>

<style lang="scss">
  @use "../themes/mixins/text";

  .toast {
    display: flex;
    justify-content: space-between;
    align-items: center;

    position: fixed;
    bottom: calc(2 * var(--padding));
    left: 50%;
    transform: translate(-50%, 0);

    border-radius: var(--border-radius);
    background: var(--black);
    color: var(--black-contrast);
    box-shadow: 0 4px 16px 0 rgba(var(--background-rgb), 0.3);

    width: calc(100% - (8 * var(--padding)));

    padding: var(--padding) calc(var(--padding) * 2);
    box-sizing: border-box;

    z-index: calc(var(--z-index) + 999);

    @media (min-width: 880px) {
      max-width: var(--section-max-width);
    }

    &.error {
      background: var(--pink);
      color: var(--pink-contrast);
    }
  }

  p {
    @include text.clamp(4);

    margin: 0;
    font-size: 1rem;

    @media (min-width: 768px) {
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
