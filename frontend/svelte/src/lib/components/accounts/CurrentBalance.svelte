<script lang="ts">
  import ICP from "../ic/ICP.svelte";
  import type { ICP as ICPType } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";

  export let balance: ICPType;
</script>

<div>
  <p>{$i18n.accounts.current_balance}:</p>
  <ICP inline={true} icp={balance} />
</div>

<style lang="scss">
  div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
