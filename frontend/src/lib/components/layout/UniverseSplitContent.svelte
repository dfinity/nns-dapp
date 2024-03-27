<script lang="ts">
  import { SplitContent } from "@dfinity/gix-components";
  import Title from "$lib/components/header/Title.svelte";
  import SelectUniverseNav from "$lib/components/universe/SelectUniverseNav.svelte";
  import HeaderToolbar from "$lib/components/header/HeaderToolbar.svelte";
  import { ENABLE_VOTING_INDICATION } from "$lib/stores/feature-flags.store";
</script>

<SplitContent perceivedOnMobile={!$ENABLE_VOTING_INDICATION}>
  <SelectUniverseNav slot="start" />

  <Title slot="title" />

  <HeaderToolbar slot="toolbar-end" />

  <slot slot="end" />
</SplitContent>
