<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconClose } from "@dfinity/gix-components";
  import { IS_TESTNET } from "$lib/constants/environment.constants";
  import { DEV } from "$lib/constants/mockable.constants";
  import { browser } from "$app/environment";

  const localstorageKey = "nnsdapp-testnet-banner-display";

  let visible = browser
    ? (JSON.parse(localStorage.getItem(localstorageKey) ?? "true") as boolean)
    : false;

  const testnet = IS_TESTNET;
  const localEnv = DEV;
  const banner = testnet && !localEnv;

  const close = () => {
    visible = false;

    localStorage.setItem(localstorageKey, "false");
  };
</script>

{#if banner && visible}
  <div>
    <h3>For <strong>test</strong> purpose only.</h3>
    <button on:click={close} aria-label={$i18n.core.close}><IconClose /></button
    >
  </div>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/text";

  div {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;

    z-index: calc(var(--overlay-z-index) + 10);

    height: var(--header-offset);

    display: grid;
    grid-template-columns: 20% 60% 20%;

    justify-content: center;
    align-items: center;

    animation: banner-background 9s infinite linear;
    background: var(--negative-emphasis);
    color: var(--primary-contrast);

    padding: var(--padding-3x) 0;
    margin: var(--padding) var(--padding-2x);

    border-radius: var(--border-radius);
    border: 1px solid var(--banner-border-color);
  }

  h3 {
    @include text.clamp(2);

    margin: 0;

    grid-column-start: 2;

    text-align: center;

    color: inherit;
  }

  button {
    display: flex;
    justify-self: flex-end;
    margin: 0 var(--padding);
  }

  /* -global- */
  @keyframes -global-banner-background {
    0% {
      background: var(--negative-emphasis);
      --banner-border-color: #781136;
    }
    20% {
      background: #bd55a9;
      --banner-border-color: #4f1f46;
    }
    40% {
      background: #913db9;
      --banner-border-color: #3a184a;
    }
    50% {
      background: var(--primary);
      --banner-border-color: #280f50;
    }
    60% {
      background: #913db9;
      --banner-border-color: #3a184a;
    }
    80% {
      background: #bd55a9;
      --banner-border-color: #4f1f46;
    }
    100% {
      background: var(--negative-emphasis);
      --banner-border-color: #781136;
    }
  }
</style>
