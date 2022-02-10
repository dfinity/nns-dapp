<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import IconBackIosNew from "../../icons/IconBackIosNew.svelte";
  import { i18n } from "../../stores/i18n";
  import Toasts from "../ui/Toasts.svelte";
  import Footer from "./Footer.svelte";

  const dispatch = createEventDispatcher();
</script>

<header>
  <button
    class="back"
    on:click|stopPropagation={() => dispatch("nnsBack")}
    aria-label={$i18n.modals.back}><IconBackIosNew /></button
  >
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
    grid-template-columns: var(--isolated-page-header-height) 1fr var(
        --isolated-page-header-height
      );
    align-items: center;
    height: var(--isolated-page-header-height);

    // to make the shadow visible
    position: relative;
    z-index: 1;

    background-color: var(--background);
    box-shadow: 0 4px 4px 1px rgba(var(--background-rgb), 0.7);

    button {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }

    h2 {
      text-align: center;
    }
  }

  main {
    position: absolute;
    inset: calc(var(--isolated-page-header-height)) 0 0;
    padding-top: 50px;

    overflow: auto;

    background-color: var(--gray-50-background);
  }
</style>
