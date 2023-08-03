<script lang="ts">
  import CommonItemAction from "$lib/components/ui/CommonItemAction.svelte";
  import { IconStakedMaturity } from "@dfinity/gix-components";

  export let testId: string;
  export let title: string;
  export let subtitle: string;
</script>

<CommonItemAction {testId}>
  <IconStakedMaturity slot="icon" />
  <svelte:fragment slot="title">{title}</svelte:fragment>
  <svelte:fragment slot="subtitle">{subtitle}</svelte:fragment>
</CommonItemAction>
