<script lang="ts">
  import { SplitContent } from "@dfinity/gix-components";
  import Title from "$lib/components/common/Title.svelte";
  import AccountMenu from "$lib/components/header/AccountMenu.svelte";
</script>

<SplitContent>
  <Title slot="title" />

  <AccountMenu slot="toolbar-end" />

  <slot slot="end" />
</SplitContent>
