<script lang="ts">
  import type { Principal } from "@dfinity/principal";
  import { i18n } from "$lib/stores/i18n";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import ImportTokenWarning from "$lib/components/accounts/ImportTokenWarning.svelte";
  import { createEventDispatcher } from "svelte";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import Logo from "$lib/components/ui/Logo.svelte";
  import ImportTokenCanisterId from "$lib/components/accounts/ImportTokenCanisterId.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { isNullish } from "@dfinity/utils";

  export let ledgerCanisterId: Principal;
  export let indexCanisterId: Principal | undefined = undefined;
  export let tokenMetaData: IcrcTokenMetadata;

  const dispatch = createEventDispatcher();

  let ledgerCanisterHref: string;
  $: ledgerCanisterHref = replacePlaceholders(
    $i18n.import_token.link_to_canister,
    {
      $canisterId: ledgerCanisterId.toText(),
    }
  );
  let indexCanisterHref: string | undefined;
  $: indexCanisterHref = isNullish(indexCanisterId)
    ? undefined
    : replacePlaceholders($i18n.import_token.link_to_canister, {
        $canisterId: ledgerCanisterId.toText(),
      });
</script>

<div class="container" data-tid="import-token-review-component">
  <div class="meta">
    <Logo
      src={tokenMetaData?.logo ?? ""}
      alt={tokenMetaData.name}
      size="medium"
      framed
    />
    <div>
      <div>{tokenMetaData.name}</div>
      <div class="description">{tokenMetaData.symbol}</div>
    </div>
  </div>

  <TestIdWrapper testId="ledger-canister-id">
    <ImportTokenCanisterId
      label={$i18n.import_token.ledger_label}
      canisterId={ledgerCanisterId.toText()}
      canisterLinkHref={ledgerCanisterHref}
    />
  </TestIdWrapper>

  <TestIdWrapper testId="index-canister-id">
    <ImportTokenCanisterId
      label={$i18n.import_token.index_label}
      canisterId={indexCanisterId?.toText()}
      canisterLinkHref={indexCanisterHref}
      canisterIdFallback={$i18n.import_token.index_fallback_label}
    />
  </TestIdWrapper>

  <ImportTokenWarning />

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
</style>
