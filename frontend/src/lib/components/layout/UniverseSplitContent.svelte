<script lang="ts">
  import { SplitContent } from "@dfinity/gix-components";
  import Title from "$lib/components/header/Title.svelte";
  import SelectUniverseNav from "$lib/components/universe/SelectUniverseNav.svelte";
  import HeaderToolbar from "$lib/components/header/HeaderToolbar.svelte";

  export let votingIndicator: boolean = false;
</script>

<SplitContent>
  <SelectUniverseNav slot="start" {votingIndicator} />

  <Title slot="title" />

  <HeaderToolbar slot="toolbar-end" />

  <slot slot="end" />
</SplitContent>
