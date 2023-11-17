<script lang="ts">
  import { Modal } from "@dfinity/gix-components";
  import type { Account } from "$lib/types/account";
  import { i18n } from "$lib/stores/i18n";
  import IdentifierHash from "$lib/components/ui/IdentifierHash.svelte";

  export let account: Account;

  const openBanxa = () => {
    window.open("https://banxa.com/", "_blank", "width=400,height=600");
  };
</script>

<Modal testId="buy-icp-modal-component" on:nnsClose>
  <span slot="title">{`Buy ICP`}</span>

  <div>
    <h5>{$i18n.accounts.your_icp_address}</h5>
    <IdentifierHash identifier={account?.identifier} />
  </div>

  <div class="toolbar">
    <button
      class="primary full-width"
      on:click={openBanxa}
      data-tid="reload-receive-account">{$i18n.accounts.buy_icp_banxa}</button
    >
  </div>
</Modal>
