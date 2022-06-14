<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { triggerDebugReport } from "../../utils/dev.utils";
  import Menu from "./Menu.svelte";
  import AccountMenu from "./AccountMenu.svelte";
</script>

<header>
  <Menu />
  <h4 use:triggerDebugReport>{$i18n.header.title}</h4>
  <AccountMenu />
</header>

<style lang="scss">
  @use "../../themes/mixins/img";
  @use "../../themes/mixins/text";

  header {
    position: absolute;
    top: var(--header-offset, 0);
    left: 0;
    right: 0;

    height: var(--header-height);
    overflow: hidden;

    display: grid;
    grid-template-columns: 25% 50% 25%;

    justify-content: center;
    align-items: center;

    // Fallback
    background: var(--blue-500);
    background: linear-gradient(99.27deg, var(--blue-500) -0.11%, #4E48D2 100.63%);
    color: var(--blue-500-contrast);
  }

  h4 {
    margin: 0;

    color: white;
    letter-spacing: 1.4px;

    grid-column-start: 2;

    @include text.clamp(2);

    text-align: center;

    z-index: var(--z-index);

    line-height: inherit;
  }
</style>
