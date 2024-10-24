<script lang="ts">
  import type { Principal } from "@dfinity/principal";
  import PrincipalInput from "$lib/components/ui/PrincipalInput.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { Html } from "@dfinity/gix-components";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { createEventDispatcher } from "svelte";
  import { isNullish } from "@dfinity/utils";
  import CalloutWarning from "$lib/components/common/CalloutWarning.svelte";
  import ImportTokenCanisterId from "$lib/components/accounts/ImportTokenCanisterId.svelte";
  import { IconOpenInNew } from "@dfinity/gix-components";

  export let ledgerCanisterId: Principal | undefined = undefined;
  export let indexCanisterId: Principal | undefined = undefined;
  export let addIndexCanisterMode: boolean = false;

  const dispatch = createEventDispatcher();

  let isSubmitDisabled = true;
  $: isSubmitDisabled = addIndexCanisterMode
    ? isNullish(indexCanisterId)
    : isNullish(ledgerCanisterId);
</script>

<TestIdWrapper testId="import-token-form-component">
  <p class="description">{$i18n.import_token.description}</p>
  <a
    class="button ghost with-icon"
    data-tid="doc-link"
    href={$i18n.import_token.doc_link_url}
    target="_blank"
    rel="external noopener noreferrer"
  >
    <IconOpenInNew />
    {$i18n.import_token.doc_link_label}
  </a>

  <form on:submit|preventDefault={() => dispatch("nnsSubmit")}>
    {#if addIndexCanisterMode}
      <ImportTokenCanisterId
        testId="ledger-canister-id-view"
        label={$i18n.import_token.ledger_label}
        canisterId={ledgerCanisterId}
      />
    {:else}
      <PrincipalInput
        bind:principal={ledgerCanisterId}
        placeholderLabelKey="import_token.placeholder"
        name="ledger-canister-id"
        testId="ledger-canister-id"
        disabled={addIndexCanisterMode}
      >
        <svelte:fragment slot="label"
          >{$i18n.import_token.ledger_label}</svelte:fragment
        >
      </PrincipalInput>
    {/if}

    <PrincipalInput
      bind:principal={indexCanisterId}
      required={addIndexCanisterMode}
      placeholderLabelKey="import_token.placeholder"
      name="index-canister-id"
      testId="index-canister-id"
    >
      <Html
        slot="label"
        text={addIndexCanisterMode
          ? $i18n.import_token.index_label
          : $i18n.import_token.index_label_optional}
      />
    </PrincipalInput>

    <p class="description">
      <Html text={$i18n.import_token.index_canister_description} />
    </p>

    {#if !addIndexCanisterMode}
      <CalloutWarning htmlText={$i18n.import_token.warning} />
    {/if}

    <div class="toolbar">
      <button
        class="secondary"
        type="button"
        data-tid="cancel-button"
        on:click={() => dispatch("nnsClose")}
      >
        {$i18n.core.cancel}
      </button>

      <button
        data-tid="submit-button"
        class="primary"
        type="submit"
        disabled={isSubmitDisabled}
      >
        {addIndexCanisterMode ? $i18n.core.add : $i18n.core.next}
      </button>
    </div>
  </form>
</TestIdWrapper>

<style lang="scss">
  p.description {
    margin: 0 0 var(--padding-2x);
  }

  a {
    margin-bottom: var(--padding-3x);
    color: var(--primary);
    &:hover {
      text-decoration: underline;
    }
  }
</style>
