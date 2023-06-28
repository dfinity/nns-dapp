<script lang="ts">
  import { Content } from "@dfinity/gix-components";
  import Title from "$lib/components/header/Title.svelte";
  import HeaderToolbar from "$lib/components/header/HeaderToolbar.svelte";

  export let back: (() => Promise<void>) | undefined = undefined;
</script>

<Content back={back !== undefined} on:nnsBack={async () => await back?.()}>
  <Title slot="title" />

  <HeaderToolbar slot="toolbar-end" />

  <slot />
</Content>
