<script lang="ts">
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { BREAKPOINT_LARGE } from "@dfinity/gix-components";

  export let title: string;

  let innerWidth = 0;

  let list = false;
  $: list = innerWidth > BREAKPOINT_LARGE;

  $: (() =>
    layoutTitleStore.set({
      title: title,
      header: list ? "" : title,
    }))();
</script>

<svelte:window bind:innerWidth />

<slot />
