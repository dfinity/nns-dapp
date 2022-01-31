<script lang="ts">
  import IconClose from "../icons/IconClose.svelte";
  import { msg } from "../stores/msg.store";
  import { fade, fly } from "svelte/transition";
  import { translate } from "../utils/i18n.utils";
  import { i18n } from "../stores/i18n";

  let visible: boolean;

  const close = () => msg.set(undefined);

  $: visible = $msg !== undefined;
  $: ({ labelKey, type: msgType } = $msg || {});
</script>

{#if visible}
  <div
    role="dialog"
    class="toast"
    class:error={msgType === "error"}
    in:fly={{ y: 100, duration: 200 }}
    out:fade={{ delay: 100 }}
  >
    <p>
      {translate({ labelKey })}
    </p>

    <button on:click={close} aria-label={$i18n.core.close}><IconClose /></button
    >
  </div>
{/if}

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

    @media (min-width: 880px) {
      max-width: var(--section-max-width);
    }

    &.error {
      background: var(--pink);
      color: var(--pink-contrast);
    }
  }

  p {
    @include text.clamp(2);

    margin: 0;
    font-size: 1rem;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
</style>
