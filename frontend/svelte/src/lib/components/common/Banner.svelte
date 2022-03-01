<script lang="ts">
  export let headless: boolean = false;

  const deployEnv: string = process.env.DEPLOY_ENV;

  const rootStyle: string = `
    <style>
      :root {
        --header-offset: 50px;
      }
    </style>
  `;
</script>

<svelte:head>
  {#if deployEnv === "testnet"}
    {@html rootStyle}
  {/if}
</svelte:head>

{#if deployEnv === "testnet"}
  <div class:headless>
    <h4>For <strong>test</strong> purpose only.</h4>
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

    grid-column-start: 2;

    text-align: center;
  }
</style>
