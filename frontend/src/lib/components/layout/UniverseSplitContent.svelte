<script lang="ts">
  import { SplitContent } from "@dfinity/gix-components";
  import Title from "$lib/components/header/Title.svelte";
  import AccountMenu from "$lib/components/header/AccountMenu.svelte";
  import SelectUniverseNav from "$lib/components/universe/SelectUniverseNav.svelte";
</script>

<SplitContent>
  <SelectUniverseNav slot="start" />

  <Title slot="title" />

  <AccountMenu slot="toolbar-end" />

  <slot slot="end" />
</SplitContent>
