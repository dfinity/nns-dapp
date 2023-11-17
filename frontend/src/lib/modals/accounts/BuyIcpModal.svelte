<script lang="ts">
  import { Card, Modal } from "@dfinity/gix-components";
  import type { Account } from "$lib/types/account";

  export let account: Account;

  const openBanax = () => {
    window.open("https://banxa.com/", "_blank", "width=400,height=600");
  };
</script>

<Modal testId="buy-icp-modal-component" on:nnsClose>
  <span slot="title">{`Buy ICP`}</span>

  <div>
    <p>{`ICP Address ${account?.identifier}`}</p>
    <Card role="button" theme="framed" on:click={openBanax}>
      <p>{`Buy ICP with Banxa`}</p>
    </Card>
  </div>
</Modal>
