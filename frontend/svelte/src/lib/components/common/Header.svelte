<script lang="ts">
  import Logout from "./Logout.svelte";
  import { i18n } from "../../stores/i18n";
  import GetICPs from "../ic/GetICPs.svelte";
  import { IS_TESTNET } from "../../constants/environment.constants";
  import { triggerDebugReport } from "../../utils/dev.utils";
</script>

<header>
  {#if IS_TESTNET}
    <GetICPs />
  {/if}

  <h4 use:triggerDebugReport>{$i18n.header.title}</h4>
  <Logout />
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
    background: var(--brand-razzmatazz);
    background: linear-gradient(
      90deg,
      var(--brand-sea-buckthorn) 0%,
      var(--brand-flamingo) 25%,
      var(--brand-razzmatazz) 50%,
      var(--brand-meteorite) 75%,
      var(--brand-picton-blue) 100%
    );
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
