<script lang="ts">
  import type { LedgerIdentity } from "../../identities/ledger.identity";
  import { principalToAccountIdentifier } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";

  export let ledgerIdentity: LedgerIdentity;

  let principalText: string;
  let accountIdentifier: string;
  $: principalText = ledgerIdentity.getPrincipal().toString();
  $: accountIdentifier = principalToAccountIdentifier(
    ledgerIdentity.getPrincipal()
  );
</script>

<h5>{$i18n.core.principal}</h5>
<p class="value">{principalText}</p>

<h5>{$i18n.accounts.account_identifier}</h5>
<p class="value">{accountIdentifier}</p>

<style lang="scss">
  h5 {
    margin: 0;
    align-self: flex-start;
  }

  p {
    margin: 0 0 var(--padding-0_5x);
    word-wrap: break-word;
    align-self: flex-start;

    &:first-of-type {
      margin-bottom: var(--padding-2x);
    }
  }
</style>
