<script lang="ts">
  import Collapsible from "$lib/gix/components/Collapsible.svelte";
  import type { CollapsibleProps } from "$lib/gix/types/collapsible";

  export let props: Omit<CollapsibleProps, "header" | "children"> = {};
</script>

<Collapsible {...props}>
  {#snippet header()}Jack{/snippet}
  Sparrow
</Collapsible>
