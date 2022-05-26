<script lang="ts">
  import type { Principal } from "@dfinity/principal";
  import PrincipalInput from "../../../../lib/components/ui/PrincipalInput.svelte";

  export let placeholderLabelKey: string;
  export let name: string;

  let validPrincipal: Principal | undefined = undefined;
</script>

<PrincipalInput {name} {placeholderLabelKey} {validPrincipal} />
