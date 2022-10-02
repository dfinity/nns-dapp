<script lang="ts">
  import Banner from "../header/Banner.svelte";
  import MenuItems from "./MenuItems.svelte";
  import { layoutTitleStore, layoutBackStore } from "../../stores/layout.store";
  import { Layout, HeaderTitle } from "@dfinity/gix-components";
  import AccountMenu from "../header/AccountMenu.svelte";
  import { triggerDebugReport } from "../../services/debug.services";
  import { cubicIn } from "svelte/easing";

  let back = false;
  $: back = $layoutBackStore !== undefined;

  /* eslint-disable @typescript-eslint/no-unused-vars */
  // smoothness the content transition - i.e. the navigation
  const content = (
    _node: Element,
    { duration = 200 }: { duration?: number }
  ) => ({
    duration,
    css: (t) => {
      const opacityAnimation = cubicIn(t);

      return `
        opacity: ${opacityAnimation};
      );`;
    },
  });
  /* eslint-enable */
</script>

<Banner />

<Layout {back} on:nnsBack={() => $layoutBackStore?.()}>
  <div use:triggerDebugReport slot="title">
    <HeaderTitle>{$layoutTitleStore}</HeaderTitle>
  </div>

  <MenuItems slot="menu-items" />

  <AccountMenu slot="toolbar-end" />

  <div transition:content>
    <slot />
  </div>
</Layout>

<style lang="scss">
  div {
    max-width: inherit;
  }
</style>
