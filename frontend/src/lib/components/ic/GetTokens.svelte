<script lang="ts">
  /**
   * Transfer ICP to current principal. For test purpose only and only available on "testnet" too.
   */
  import { Modal } from "@dfinity/gix-components";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import {
    getICPs,
    getTestBalance,
    getTokens,
  } from "$lib/services/dev.services";
  import { Spinner, IconAccountBalance } from "@dfinity/gix-components";
  import { toastsError } from "$lib/stores/toasts.store";
  import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { ICPToken, type Token } from "@dfinity/utils";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { browser } from "$app/environment";
  import { ENABLE_ICP_ICRC } from "$lib/stores/feature-flags.store";

  let visible = false;
  let transferring = false;

  let inputValue: number | undefined = undefined;

  let selectedProjectId = OWN_CANISTER_ID;
  $: selectedProjectId = $selectedUniverseIdStore;

  const onSubmit = async () => {
    if (invalidForm || inputValue === undefined) {
      toastsError({
        labelKey: "Invalid ICPs input.",
      });
      return;
    }

    transferring = true;

    try {
      // Default to transfer ICPs if the test account's balance of the selected universe is 0.
      if (
        selectedProjectId.toText() === OWN_CANISTER_ID.toText() ||
        tokenBalanceE8s === 0n
      ) {
        await getICPs({
          icps: inputValue,
          icrcEnabled: $ENABLE_ICP_ICRC,
        });
      } else {
        await getTokens({
          tokens: inputValue,
          rootCanisterId: selectedProjectId,
        });
      }

      reset();
    } catch (err: unknown) {
      toastsError({
        labelKey: "ICPs could not be transferred.",
        err,
      });
    }

    transferring = false;
  };

  const onClose = () => reset();

  const reset = () => {
    visible = false;
    inputValue = undefined;
  };

  let invalidForm: boolean;
  $: invalidForm = inputValue === undefined || inputValue <= 0;

  // Check the balance of the test account in that universe.
  let tokenBalanceE8s = 0n;
  $: selectedProjectId,
    (async () => {
      // This was executed at build time and it depends on `window` in `base64ToUInt8Array` helper inside dev.api.ts
      if (browser) {
        tokenBalanceE8s = await getTestBalance(selectedProjectId);
      }
    })();

  // If the test account balance is 0, don't show a button that won't work. Show the ICP token instead.
  let token: Token;
  $: token =
    (tokenBalanceE8s === 0n ? ICPToken : $snsTokenSymbolSelectedStore) ??
    ICPToken;
</script>

<TestIdWrapper testId="get-tokens-component">
  {#if $authSignedInStore}
    <button
      role="menuitem"
      data-tid="get-icp-button"
      on:click|preventDefault|stopPropagation={() => (visible = true)}
      class="open"
    >
      <IconAccountBalance />
      <span>{`Get ${token.symbol}`}</span>
    </button>
  {/if}

  <Modal {visible} role="alert" on:nnsClose={onClose}>
    <span slot="title">{`Get ${token.symbol}`}</span>

    <form
      id="get-icp-form"
      data-tid="get-icp-form"
      on:submit|preventDefault={onSubmit}
    >
      <span class="label">How much?</span>

      <Input
        placeholderLabelKey="core.amount"
        name="tokens"
        inputType="icp"
        bind:value={inputValue}
        disabled={transferring}
      />
    </form>

    <button
      form="get-icp-form"
      data-tid="get-icp-submit"
      type="submit"
      class="primary"
      slot="footer"
      disabled={invalidForm || transferring}
    >
      {#if transferring}
        <Spinner />
      {:else}
        Get tokens
      {/if}
    </button>
  </Modal>
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .open {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    @include fonts.h5;

    color: var(--menu-color);

    padding: var(--padding-2x);

    &:focus,
    &:hover {
      color: var(--menu-select-color);
    }

    span {
      margin: 0 var(--padding) 0 var(--padding-2x);
    }

    z-index: var(--z-index);
  }

  form {
    display: flex;
    flex-direction: column;

    padding: var(--padding-2x) var(--padding);
  }

  button.primary {
    min-width: var(--padding-8x);
  }
</style>
