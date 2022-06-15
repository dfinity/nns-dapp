<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import Menu from "../ui/Menu.svelte";
  import GetICPs from "../ic/GetICPs.svelte";
  import Nav from "./Nav.svelte";
  import { IS_TESTNET } from "../../constants/environment.constants";
  import IconMenu from "../../icons/IconMenu.svelte";
  import {themeStore} from "../../stores/theme.store";

  let open: boolean;
</script>

<button
  class={`icon-only ${$themeStore}`}
  on:click={() => (open = true)}
  aria-label={$i18n.header.menu}
>
  <IconMenu />
</button>

<Menu bind:open>
  <Nav />

  {#if IS_TESTNET}
    <GetICPs />
  {/if}
</Menu>

<style lang="scss">
  @use "../../themes/mixins/header";

  .dark {
    @include header.button(--brand-sea-buckthorn);
  }

  .light {
    @include header.button(--blue-500);
  }
</style>
