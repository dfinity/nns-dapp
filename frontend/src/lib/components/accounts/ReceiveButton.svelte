<script lang="ts">
  import type { Account } from "$lib/types/account";
  import { i18n } from "$lib/stores/i18n";
  import { openAccountsModal } from "$lib/utils/modals.utils";
  import { busy } from "@dfinity/gix-components";
  import type { AccountsModalType } from "$lib/types/accounts.modal";

  export let testId = "receive-icp";
  export let type: AccountsModalType;
  export let account: Account | undefined = undefined;
  export let reload: (() => Promise<void>) | undefined = undefined;
  export let canSelectAccount = false;

  const openModal = () =>
    openAccountsModal({
      type,
      data: {
        account,
        reload,
        canSelectAccount,
      },
    });
</script>

<button
  class="secondary"
  on:click={openModal}
  disabled={$busy}
  data-tid={testId}>{$i18n.ckbtc.receive}</button
>
