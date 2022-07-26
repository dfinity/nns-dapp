<script lang="ts">
  import type { Principal } from "@dfinity/principal";

  export let rootCanisterId: Principal;
</script>

<!-- TODO: https://dfinity.atlassian.net/browse/L2-867 -->
<div data-tid="sns-neurons-body">
  {`SNS Neurons Page for ${rootCanisterId.toText()}`}
</div>
