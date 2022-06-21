<script lang="ts">
  import Menu from "../ui/Menu.svelte";
  import GetICPs from "../ic/GetICPs.svelte";
  import MenuItems from "./MenuItems.svelte";
  import IconClose from "../../icons/IconClose.svelte";
  import { IS_TESTNET } from "../../constants/environment.constants";
  import { i18n } from "../../stores/i18n";

  export let open: boolean = false;
  export let sticky: boolean = false;
</script>

<Menu bind:open {sticky}>
  <button
    on:click={() => (open = false)}
    aria-label={$i18n.core.close}
    data-tid="menu-close"
    class="close icon-only"><IconClose /></button
  >

  <MenuItems />

  {#if IS_TESTNET}
    <GetICPs />
  {/if}
</Menu>

<style lang="scss">
  @use "../../themes/mixins/effect";
  @use "../../themes/mixins/header";
  @use "../../themes/mixins/media";

  .close {
    align-self: flex-start;
    display: flex;
    margin: 0 var(--padding-0_5x) var(--padding);

    :global(svg) {
      width: 48px;
      height: 48px;
    }

    @include media.min-width(xlarge) {
      display: none;
    }
  }
</style>
