<script lang="ts">
  import ICP from "../ic/ICP.svelte";
  import { ICP as ICPType } from "@dfinity/nns";
  import type { Account } from "../../types/account";
  import { i18n } from "../../stores/i18n";

  export let account: Account | undefined;

  let balance: ICPType;

  $: ({ balance } = account ?? ({ balance: ICPType.fromString('0') } as unknown as Account));
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
