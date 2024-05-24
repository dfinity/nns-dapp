<script lang="ts">
  import UniverseWithActionableProposals from "$lib/components/proposals/UniverseWithActionableProposals.svelte"
  import type {Universe} from "$lib/types/universe";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  export let universe: Universe;
  export let testSlotContent: string | undefined = undefined;
</script>

<UniverseWithActionableProposals {universe}>
    <TestIdWrapper testId="slot">{testSlotContent}</TestIdWrapper>
</UniverseWithActionableProposals>
