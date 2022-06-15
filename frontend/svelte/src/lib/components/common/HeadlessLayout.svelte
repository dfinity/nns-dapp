<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import IconBackIosNew from "../../icons/IconBackIosNew.svelte";
  import { i18n } from "../../stores/i18n";
  import Tooltip from "../ui/Tooltip.svelte";
  import Footer from "./Footer.svelte";
  import Banner from "./Banner.svelte";
  import { triggerDebugReport } from "../../utils/dev.utils";

  export let showFooter = true;

  const dispatch = createEventDispatcher();
</script>

<Banner headless={true} />

<header>
  <Tooltip id="back" text={$i18n.core.back}>
    <button
      class="back"
      on:click|stopPropagation={() => dispatch("nnsBack")}
      aria-label={$i18n.core.back}><IconBackIosNew /></button
    >
  </Tooltip>
  <h2 use:triggerDebugReport><slot name="header" /></h2>
</header>
<main>
  <slot />
</main>

{#if showFooter}
  <Footer>
    <slot name="footer" />
  </Footer>
{/if}

<style lang="scss">
  header {
    display: grid;
    grid-template-columns: var(--header-height) 1fr var(--header-height);
    align-items: center;
    height: var(--header-height);

    // to make the shadow visible
    position: relative;
    z-index: 1;

    // Fallback
    background: var(--header-background-fallback);
    background: var(--header-background);
    color: var(--header-color);

    :global(.tooltip-wrapper) {
      height: 100%;
    }

    button {
      display: flex;
      justify-content: center;
      align-items: center;

      // maximise click area
      width: 100%;
      height: 100%;
    }

    h2 {
      text-align: center;
      color: inherit;
    }
  }

  main {
    position: absolute;

    inset: calc(var(--header-height)) 0 0;

    overflow-y: auto;
    overflow-x: hidden;

    background-color: var(--gray-50-background);
  }
</style>
