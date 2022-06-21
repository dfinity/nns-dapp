<script lang="ts">
  import Menu from "../ui/Menu.svelte";
  import GetICPs from "../ic/GetICPs.svelte";
  import MenuItems from "./MenuItems.svelte";
  import { IS_TESTNET } from "../../constants/environment.constants";

  export let open: boolean = false;
  export let sticky: boolean = false;

  let outerWidth: number = 0;

  // The media query breakpoint to stick the menu is xlarge 1200px
  $: sticky = outerWidth > 1200;
</script>

<svelte:window bind:outerWidth />

<Menu {sticky} bind:open>
  <MenuItems />

  {#if IS_TESTNET}
    <GetICPs />
  {/if}
</Menu>

<style lang="scss">
  @use "../../themes/mixins/effect";
  @use "../../themes/mixins/header";

  .open {
    @include header.button(--brand-sea-buckthorn);
  }

  .close {
    align-self: flex-start;
    display: flex;
    margin: 0 var(--padding-0_5x) var(--padding);

    :global(svg) {
      width: 48px;
      height: 48px;
    }
  }
</style>
