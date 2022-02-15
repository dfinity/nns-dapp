<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import IconBackIosNew from "../../icons/IconBackIosNew.svelte";
  import { i18n } from "../../stores/i18n";
  import Toasts from "../ui/Toasts.svelte";
  import Tooltip from "../ui/Tooltip.svelte";
  import Footer from "./Footer.svelte";

  const dispatch = createEventDispatcher();
</script>

<header>
  <Tooltip id="back" text={$i18n.modals.back}>
    <button
      class="back"
      on:click|stopPropagation={() => dispatch("nnsBack")}
      aria-label={$i18n.modals.back}><IconBackIosNew /></button
    >
  </Tooltip>
  <h2><slot name="header" /></h2>
</header>
<main>
  <slot />
</main>

<Footer>
  <slot name="footer" />
</Footer>

<Toasts />

<style lang="scss">
  header {
    display: grid;
    grid-template-columns: var(--headless-layout-header-height) 1fr var(
        --headless-layout-header-height
      );
    align-items: center;
    height: var(--headless-layout-header-height);

    // to make the shadow visible
    position: relative;
    z-index: 1;

    background-color: var(--background);
    box-shadow: 0 4px 4px 1px rgba(var(--background-rgb), 0.7);

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
    }
  }

  main {
    position: absolute;
    inset: calc(var(--headless-layout-header-height)) 0 0;
    padding-top: calc(5 * var(--padding));

    overflow: auto;

    background-color: var(--gray-50-background);
  }
</style>
