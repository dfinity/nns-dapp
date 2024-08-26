<script lang="ts">
  import type { Principal } from "@dfinity/principal";
  import { i18n } from "$lib/stores/i18n";
  import { createEventDispatcher } from "svelte";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import Logo from "$lib/components/ui/Logo.svelte";
  import ImportTokenCanisterId from "$lib/components/accounts/ImportTokenCanisterId.svelte";
  import CalloutWarning from "$lib/components/common/CalloutWarning.svelte";

  export let ledgerCanisterId: Principal;
  export let indexCanisterId: Principal | undefined = undefined;
  export let tokenMetaData: IcrcTokenMetadata;

  const dispatch = createEventDispatcher();
</script>

<div class="container" data-tid="import-token-review-component">
  <div class="meta">
    <Logo
      src={tokenMetaData?.logo ?? ""}
      alt={tokenMetaData.name}
      size="medium"
      framed
    />
    <div class="token-name">
      <div data-tid="token-name">{tokenMetaData.name}</div>
      <div data-tid="token-symbol" class="description">
        {tokenMetaData.symbol}
      </div>
    </div>
  </div>

  <ImportTokenCanisterId
    testId="ledger-canister-id"
    label={$i18n.import_token.ledger_label}
    canisterId={ledgerCanisterId}
  />

  <ImportTokenCanisterId
    testId="index-canister-id"
    label={$i18n.import_token.index_label}
    canisterId={indexCanisterId}
    canisterIdFallback={$i18n.import_token.index_fallback_label}
  />

  <CalloutWarning htmlText={$i18n.import_token.warning} />

  <div class="toolbar">
    <button
      class="secondary"
      data-tid="back-button"
      on:click={() => dispatch("nnsBack")}
    >
      {$i18n.core.back}
    </button>

    <button
      data-tid="confirm-button"
      class="primary"
      on:click={() => dispatch("nnsConfirm")}
    >
      {$i18n.import_token.import_button}
    </button>
  </div>
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    gap: var(--padding-3x);
  }

  .meta {
    display: flex;
    align-items: center;
    gap: var(--padding-1_5x);
    padding: var(--padding) var(--padding-1_5x);
  }

  .token-name {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
  }
</style>
