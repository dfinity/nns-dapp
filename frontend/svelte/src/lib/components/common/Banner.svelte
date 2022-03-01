<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import IconClose from "../../icons/IconClose.svelte";

  export let headless: boolean = false;

  let visible: boolean = JSON.parse(
    localStorage.getItem("nnsdapp-testnet-banner-display") || "true"
  );

  const testnet: boolean = process.env.DEPLOY_ENV === 'testnet';
  const localEnv: boolean = JSON.parse(process.env.ROLLUP_WATCH);
  const banner: boolean = testnet && !localEnv;

  let rootStyle: string | undefined;

  $: rootStyle = visible
    ? `
    <style>
      :root {
        --header-offset: 50px;
      }
    </style>
  `
    : undefined;

  const close = () => {
    visible = false;

    localStorage.setItem("nnsdapp-testnet-banner-display", "false");
  };
</script>

<svelte:head>
  {#if banner && rootStyle}
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
