<script lang="ts">
  import LogoNNS from "$lib/gix/components/LogoNNS.svelte";
  import LogoOnChain from "$lib/gix/components/LogoOnChain.svelte";
  import Menu from "$lib/gix/components/Menu.svelte";
  import SplitPane from "$lib/gix/components/SplitPane.svelte";
  import StretchPane from "$lib/gix/components/StretchPane.svelte";

  export let layout: "split" | "stretch" = "split";

  let component: typeof StretchPane | typeof SplitPane;
  $: component = layout === "stretch" ? StretchPane : SplitPane;
</script>

<svelte:component this={component}>
  <Menu slot="menu" sticky={layout === "split"}>
    <slot name="menu-logo" slot="logo">
      <div>
        <LogoNNS />
      </div>
    </slot>
    <slot name="menu-oneliner" slot="oneliner">
      <LogoOnChain />
    </slot>
    <slot name="menu-items" />
  </Menu>

  <slot />
</svelte:component>

<style lang="scss">
  @use "../styles/mixins/media";

  div {
    padding: 0 var(--padding-6x) 0;

    @include media.min-width(large) {
      padding-top: var(--padding-2x);
    }
  }
</style>
