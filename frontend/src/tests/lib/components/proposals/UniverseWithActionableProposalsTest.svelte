<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import UniverseWithActionableProposals from "$lib/components/proposals/UniverseWithActionableProposals.svelte";
  import type { Universe } from "$lib/types/universe";

  export let universe: Universe;
  export let testSlotContent: string | undefined = undefined;
</script>

<UniverseWithActionableProposals {universe}>
  <TestIdWrapper testId="slot">{testSlotContent}</TestIdWrapper>
</UniverseWithActionableProposals>
