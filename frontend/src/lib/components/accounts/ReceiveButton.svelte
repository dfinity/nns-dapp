<script lang="ts">
  import type { Account } from "$lib/types/account";
  import { i18n } from "$lib/stores/i18n";
  import { openAccountsModal } from "$lib/utils/modals.utils";
  import { busy } from "@dfinity/gix-components";
  import type { AccountsModalType } from "$lib/types/accounts.modal";
  import type { UniverseCanisterId } from "$lib/types/universe";

  export let testId = "receive-icp";
  export let type: AccountsModalType;
  export let account: Account | undefined = undefined;
  export let reload: (() => Promise<void>) | undefined = undefined;
  export let canSelectAccount = false;
  export let universeId: UniverseCanisterId | undefined;
  export let logo: string;
  export let tokenSymbol: string | undefined = undefined;

  const openModal = () =>
    openAccountsModal({
      type,
      data: {
        account,
        reload,
        canSelectAccount,
        universeId,
        tokenSymbol,
        logo,
      },
    });
</script>

<button
  class="secondary"
  on:click={openModal}
  disabled={$busy}
  data-tid={testId}>{$i18n.ckbtc.receive}</button
>
