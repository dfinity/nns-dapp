<script lang="ts">
  import AccountMenu from "./AccountMenu.svelte";
  import { triggerDebugReport } from "../../utils/dev.utils";
  import Header from "../ui/Header.svelte";
  import Toolbar from "../ui/Toolbar.svelte";
</script>

<Header>
  <Toolbar>
    <svelte:fragment slot="start"><slot name="start" /></svelte:fragment>
    <h4 use:triggerDebugReport><slot /></h4>
    <AccountMenu />
  </Toolbar>
</Header>

<style lang="scss">
  @use "../../themes/mixins/text";
  @use "../../themes/mixins/header";

  h4 {
    @include header.title;
  }
</style>
