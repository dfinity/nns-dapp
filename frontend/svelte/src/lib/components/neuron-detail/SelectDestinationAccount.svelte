<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { emptyAddress } from "../../utils/accounts.utils";
  import type { Account } from "../../types/account";
  import Address from "../accounts/Address.svelte";
  import SelectAccount from "../accounts/SelectAccount.svelte";
  import { createEventDispatcher } from "svelte";

  let address: string;

  const dispatcher = createEventDispatcher();
  const onEnterAddress = () => {
    dispatcher("nnsSelectAccount", { address });
  };

  const onSelectAccount = ({
    detail,
  }: CustomEvent<{ selectedAccount: Account }>) => {
    dispatcher("nnsSelectAccount", {
      address: detail.selectedAccount.identifier,
    });
  };
</script>

<Address bind:address on:submit={onEnterAddress} />
<h5>{$i18n.accounts.my_accounts}</h5>
<SelectAccount
  on:nnsSelectAccount={onSelectAccount}
  disableSelection={!emptyAddress(address)}
/>
