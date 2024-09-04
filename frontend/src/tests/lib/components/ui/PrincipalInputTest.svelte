<script lang="ts">
  import PrincipalInput from "$lib/components/ui/PrincipalInput.svelte";
  import type { Principal } from "@dfinity/principal";

  export let placeholderLabelKey: string;
  export let name: string;
  export let disabled: boolean | undefined;

  let principal: Principal | undefined = undefined;
</script>

<PrincipalInput {name} {placeholderLabelKey} {principal} {disabled} />
