<script lang="ts">
  import Logout from "./Logout.svelte";
  import { triggerDebugReport } from "../../utils/dev.utils";
  import Menu from "./Menu.svelte";
  import Header from "../ui/Header.svelte";
  import Toolbar from "../ui/Toolbar.svelte";
</script>

<Header>
  <Toolbar>
    <Menu slot="start" />
    <h4 use:triggerDebugReport><slot /></h4>
    <Logout slot="end" />
  </Toolbar>
</Header>

<style lang="scss">
  @use "../../themes/mixins/text";
  @use "../../themes/mixins/header";

  h4 {
    @include header.title;
  }
</style>
