<script lang="ts">
  import Logout from "./Logout.svelte";
  import { i18n } from "../../stores/i18n";
  import { triggerDebugReport } from "../../utils/dev.utils";
  import Menu from "./Menu.svelte";
  import Header from "../ui/Header.svelte";
  import Toolbar from "../ui/Toolbar.svelte";
</script>

<Header>
  <Toolbar>
    <Menu slot="start" />
    <h4 use:triggerDebugReport>{$i18n.header.title}</h4>
    <Logout slot="end" />
  </Toolbar>
</Header>

<style lang="scss">
  @use "../../themes/mixins/text";

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
