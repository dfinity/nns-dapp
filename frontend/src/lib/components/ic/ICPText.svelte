<script lang="ts">
  import type { ICP } from "@dfinity/nns";
  import Icp from "./ICP.svelte";

  export let icp: ICP;
</script>

<span><slot /> <Icp singleLine {icp} /></span>
