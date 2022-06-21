<script lang="ts">
  import Backdrop from "./Backdrop.svelte";
  import { cubicOut } from "svelte/easing";

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const animateMenu = (
    _node: Element,
    _options: { delay?: number; duration?: number }
  ) => {
    if (sticky) {
      return;
    }

    return {
      easing: cubicOut,
      css: (t: number) => `transform: translate(${-100 * (1 - t)}%);`,
    };
  };
  /* eslint-enable */

  export let open = false;
  export let sticky = false;

  let backdrop = true;
  $: backdrop = !sticky;
</script>

{#if open || sticky}
  <div role="menu" class:sticky>
    {#if backdrop}
      <Backdrop on:nnsClose={() => (open = false)} />
    {/if}

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

    &.sticky {
      position: relative;
      width: var(--menu-width);
      min-width: var(--menu-width);
    }
  }

  .inner {
    position: absolute;
    inset: 0 auto 0 0;

    display: flex;
    flex-direction: column;

    background: var(--background);
    color: var(--background-contrast);

    width: var(--menu-width);
    max-width: 100vw;

    box-shadow: 4px 0 16px rgba(var(--background-rgb), 0.3);

    padding: var(--padding-4x) 0 0;

    overflow-y: auto;
  }
</style>
