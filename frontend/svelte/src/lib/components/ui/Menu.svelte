<script lang="ts">
  import Backdrop from "./Backdrop.svelte";
  import { cubicOut } from "svelte/easing";

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const animateMenu = (
    node: Element,
    options: { delay?: number; duration?: number }
  ) => ({
    easing: cubicOut,
    css: (t: number) => `transform: translate(${-100 * (1 - t)}%);`,
  });
  /* eslint-enable */

  export let open = false;
</script>

{#if open}
  <div role="menu">
    <Backdrop on:nnsClose={() => (open = false)} />

    <div class="inner" transition:animateMenu>
      <slot />
    </div>
  </div>
{/if}

<style lang="scss">
  @use "../../themes/mixins/interaction";

  div[role="menu"] {
    position: fixed;
    inset: 0;

    @include interaction.initial;

    --menu-z-index: calc(var(--z-index) + 997);
    z-index: var(--menu-z-index);
  }

  .inner {
    position: absolute;
    inset: 0 auto 0 0;

    display: flex;
    flex-direction: column;

    background: var(--background);
    color: var(--background-contrast);

    width: 304px;
    max-width: 100vw;

    box-shadow: 4px 0 16px rgba(var(--background-rgb), 0.3);

    padding: var(--padding-6x) 0 0;

    overflow-y: auto;
  }
</style>
