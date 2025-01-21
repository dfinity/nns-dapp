<script lang="ts">
  import ImportTokenCanisterId from "$lib/components/accounts/ImportTokenCanisterId.svelte";
  import CalloutWarning from "$lib/components/common/CalloutWarning.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import PrincipalInput from "$lib/components/ui/PrincipalInput.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { Html, IconInfo, IconOpenInNew } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { isNullish } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import Banner from "$lib/components/ui/Banner.svelte";
  import BannerIcon from "$lib/components/ui/BannerIcon.svelte";

  export let ledgerCanisterId: Principal | undefined = undefined;
  export let indexCanisterId: Principal | undefined = undefined;
  export let mode: "add-index" = "add-index";

  const dispatch = createEventDispatcher();

  let isSubmitDisabled = true;
  $: isSubmitDisabled =
    mode === "add-index"
      ? isNullish(indexCanisterId)
      : isNullish(ledgerCanisterId);
</script>

<TestIdWrapper testId="import-token-form-component">
  <p class="description">{$i18n.import_token.description}</p>
  <a
    class="button ghost with-icon"
    data-tid="doc-link"
    href="https://internetcomputer.org/docs/current/developer-docs/daos/nns/using-the-nns-dapp/nns-dapp-importing-tokens"
    target="_blank"
    rel="external noopener noreferrer"
  >
    <IconOpenInNew />
    {$i18n.import_token.doc_link_label}
  </a>

  <form
    on:submit|preventDefault={() => $authSignedInStore && dispatch("nnsSubmit")}
  >
    {#if mode === "add-index"}
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
        disabled={mode === "add-index"}
      >
        <svelte:fragment slot="label"
          >{$i18n.import_token.ledger_label}</svelte:fragment
        >
      </PrincipalInput>
    {/if}

    <PrincipalInput
      bind:principal={indexCanisterId}
      required={mode === "add-index"}
      placeholderLabelKey="import_token.placeholder"
      name="index-canister-id"
      testId="index-canister-id"
    >
      <Html
        slot="label"
        text={mode === "add-index"
          ? $i18n.import_token.index_label
          : $i18n.import_token.index_label_optional}
      />
    </PrincipalInput>

    <p class="description">
      <Html text={$i18n.import_token.index_canister_description} />
    </p>

    {#if mode !== "add-index" && $authSignedInStore}
      <CalloutWarning htmlText={$i18n.import_token.warning} />
    {/if}

    {#if !$authSignedInStore}
      <Banner text="Please sign in to proceed with the token import.">
        <BannerIcon slot="icon">
          <IconInfo />
        </BannerIcon>
      </Banner>
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

      {#if $authSignedInStore}
        <button
          data-tid="submit-button"
          class="primary"
          type="submit"
          disabled={isSubmitDisabled}
        >
          {mode === "add-index" ? $i18n.core.add : $i18n.core.next}
        </button>
      {:else}
        <SignIn />
      {/if}
    </div>
  </form>
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  p.description {
    margin: 0 0 var(--padding-2x);
  }

  a {
    @include fonts.standard(true);
    margin-bottom: var(--padding-3x);
    color: var(--primary);
    &:hover {
      text-decoration: underline;
    }
  }
</style>
