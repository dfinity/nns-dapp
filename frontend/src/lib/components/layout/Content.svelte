<script lang="ts">
  import HeaderToolbar from "$lib/components/header/HeaderToolbar.svelte";
  import Title from "$lib/components/header/Title.svelte";
  import { Content } from "@dfinity/gix-components";

  export let back: (() => Promise<void>) | undefined = undefined;
</script>

<Content back={back !== undefined} on:nnsBack={async () => await back?.()}>
  <Title slot="title" />

  <HeaderToolbar slot="toolbar-end" />

  <slot />
</Content>
