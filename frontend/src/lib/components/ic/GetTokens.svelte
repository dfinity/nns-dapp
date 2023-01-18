<script lang="ts">
  /**
   * Transfer ICP to current principal. For test purpose only and only available on "testnet" too.
   */
  import { Modal } from "@dfinity/gix-components";
  import Input from "$lib/components/ui/Input.svelte";
  import { getICPs, getTokens } from "$lib/services/dev.services";
  import { Spinner, IconAccountBalance } from "@dfinity/gix-components";
  import { toastsError } from "$lib/stores/toasts.store";
  import { get } from "svelte/store";
  import { snsProjectIdSelectedStore } from "$lib/derived/selected-project.derived";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { ICPToken, type Token } from "@dfinity/nns";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";

  let visible = false;
  let transferring = false;

  let inputValue: number | undefined = undefined;

  const onSubmit = async () => {
    if (invalidForm || inputValue === undefined) {
      toastsError({
        labelKey: "Invalid ICPs input.",
      });
      return;
    }

    transferring = true;

    const selectedProjectId = get(snsProjectIdSelectedStore);

    try {
      if (selectedProjectId.toText() === OWN_CANISTER_ID.toText()) {
        await getICPs(inputValue);
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

  let token: Token;
  $: token = $snsTokenSymbolSelectedStore || ICPToken;

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);
</script>

{#if signedIn}
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

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/fonts";

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
      margin: 0 var(--padding) 0 0;
    }
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
