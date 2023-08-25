<script lang="ts">
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { BREAKPOINT_LARGE } from "@dfinity/gix-components";

  // TODO: Rename this to make the responsiblity clearer
  export let title: string;
  export let showHeader = true;

  let innerWidth = 0;

  let list = false;
  $: list = innerWidth > BREAKPOINT_LARGE;

  $: (() =>
    layoutTitleStore.set({
      title: title,
      header: list || !showHeader ? "" : title,
    }))();
</script>

<svelte:window bind:innerWidth />

<slot />
