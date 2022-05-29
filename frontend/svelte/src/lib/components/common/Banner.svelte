<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import IconClose from "../../icons/IconClose.svelte";
  import {
    IS_TESTNET,
    ROLLUP_WATCH,
  } from "../../constants/environment.constants";

  export let headless: boolean = false;

  const localstorageKey: string = "nnsdapp-testnet-banner-display";

  let visible: boolean = JSON.parse(
    localStorage.getItem(localstorageKey) ?? "true"
  ) as boolean;

  const testnet: boolean = IS_TESTNET;
  const localEnv: boolean = ROLLUP_WATCH;
  const banner: boolean = testnet && !localEnv;

  const rootStyle: string = `
    <style>
      :root {
        --header-offset: 50px;
      }
    </style>
  `;

  const close = () => {
    visible = false;

    localStorage.setItem(localstorageKey, "false");
  };
</script>

<svelte:head>
  {#if banner && visible}
    {@html rootStyle}
  {/if}
</svelte:head>

{#if banner && visible}
  <div class:headless>
    <h4>For <strong>test</strong> purpose only.</h4>
    <button on:click={close} aria-label={$i18n.core.close}><IconClose /></button
    >
  </div>
{/if}

<style lang="scss">
  @use "../../themes/mixins/text";

  div {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;

    &.headless {
      position: relative;
    }

    z-index: var(--z-index);

    height: var(--header-offset);

    display: grid;
    grid-template-columns: 25% 50% 25%;

    justify-content: center;
    align-items: center;

    background: var(--pink);
    color: var(--pink-contrast);

    :global(:root) {
      --header-offset: 60px;
    }
  }

  h4 {
    font-weight: 400;
    @include text.clamp(2);

    margin: 0;

    grid-column-start: 2;

    text-align: center;

    line-height: inherit;
  }

  button {
    display: flex;
    justify-self: flex-end;
    margin: 0 var(--padding);
  }
</style>
