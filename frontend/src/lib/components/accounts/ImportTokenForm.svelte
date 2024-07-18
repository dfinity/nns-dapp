<script lang="ts">
  import type { Principal } from "@dfinity/principal";
  import PrincipalInput from "$lib/components/ui/PrincipalInput.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { Html, IconOpenInNew } from "@dfinity/gix-components";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import ImportTokenWarning from "$lib/components/accounts/ImportTokenWarning.svelte";
  import { createEventDispatcher } from "svelte";
  import { isNullish } from "@dfinity/utils";

  export let ledgerCanisterId: Principal | undefined = undefined;
  export let indexCanisterId: Principal | undefined = undefined;

  const dispatch = createEventDispatcher();

  let disabled = true;
  $: disabled = isNullish(ledgerCanisterId);
</script>

<TestIdWrapper testId="import-token-form-component">
  <p class="description">{$i18n.import_token.description}</p>

  <a
    class="where-to-find"
    href={$i18n.import_token.where_to_find_href}
    target="_blank"
    rel="noopener noreferrer"
  >
    <IconOpenInNew />
    {$i18n.import_token.where_to_find}</a
  >

  <form on:submit|preventDefault={() => dispatch("nnsSubmit")}>
    <PrincipalInput
      bind:principal={ledgerCanisterId}
      placeholderLabelKey="import_token.placeholder"
      name="ledger-canister-id"
    >
      <svelte:fragment slot="label"
        >{$i18n.import_token.ledger_label}</svelte:fragment
      >
    </PrincipalInput>

    <PrincipalInput
      bind:principal={indexCanisterId}
      required={false}
      placeholderLabelKey="import_token.placeholder"
      name="ledger-canister-id"
    >
      <Html slot="label" text={$i18n.import_token.index_label_optional} />
    </PrincipalInput>

    <p data-tid="index-canister-description" class="description">
      <Html text={$i18n.import_token.index_canister_description} />
    </p>

    <ImportTokenWarning />

    <div class="toolbar">
      <button
        class="secondary"
        type="button"
        data-tid="cancel-button"
        on:click={() => dispatch("nnsClose")}
      >
        {$i18n.core.cancel}
      </button>

      <button data-tid="next-button" class="primary" type="submit" {disabled}>
        {$i18n.core.next}
      </button>
    </div>
  </form>
</TestIdWrapper>

<style lang="scss">
  .description {
    margin: 0 0 var(--padding-2x);
  }

  .where-to-find {
    margin: 0 0 var(--padding-3x);

    display: flex;
    align-items: center;
    gap: var(--padding);
    color: var(--primary);
    text-decoration: none;
  }
</style>
