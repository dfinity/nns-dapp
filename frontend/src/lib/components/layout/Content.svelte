<script lang="ts">
  import { Content } from "@dfinity/gix-components";
  import AccountMenu from "$lib/components/header/AccountMenu.svelte";
  import Title from "$lib/components/header/Title.svelte";

  export let back: (() => Promise<void>) | undefined = undefined;
</script>

<Content back={back !== undefined} on:nnsBack={async () => await back?.()}>
  <Title slot="title" />

  <AccountMenu slot="toolbar-end" />

  <slot />
</Content>
