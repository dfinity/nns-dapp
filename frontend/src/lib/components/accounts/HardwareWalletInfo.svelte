<script lang="ts">
  import type { LedgerIdentity } from "$lib/identities/ledger.identity";
  import { principalToAccountIdentifier } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";

  export let ledgerIdentity: LedgerIdentity;

  let principalText: string;
  let accountIdentifier: string;
  $: principalText = ledgerIdentity.getPrincipal().toString();
  $: accountIdentifier = principalToAccountIdentifier(
    ledgerIdentity.getPrincipal()
  );
</script>

<div class="wrapper">
  <div>
    <p class="label" data-tid="hardware-wallet-principal">
      {$i18n.core.principal}
    </p>
    <p class="value">{principalText}</p>
  </div>
  <div>
    <p class="label">{$i18n.accounts.account_identifier}</p>
    <p class="value">{accountIdentifier}</p>
  </div>
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  p {
    word-wrap: break-word;
  }
</style>
