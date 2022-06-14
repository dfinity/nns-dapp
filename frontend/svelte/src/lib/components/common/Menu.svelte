<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import Menu from "../ui/Menu.svelte";
  import GetICPs from "../ic/GetICPs.svelte";
  import Nav from "./Nav.svelte";
  import { IS_TESTNET } from "../../constants/environment.constants";
  import IconMenu from "../../icons/IconMenu.svelte";

  let open: boolean;
</script>

<button
  class="icon-only"
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
  @use "../../themes/mixins/effect";

  button {
    width: fit-content;
    padding: var(--padding-1_5x);
    margin: 0 var(--padding-0_5x);

    @include effect.ripple-effect(--yellow-500);

    :global(svg) {
      width: 30px;
      height: 30px;
    }
  }
</style>
