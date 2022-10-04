<script lang="ts">
  /**
   * Transfer ICP to current principal. For test purpose only and only available on "testnet" too.
   */
  import { Modal } from "@dfinity/gix-components";
  import Input from "../ui/Input.svelte";
  import { getICPs, getTokens } from "../../services/dev.services";
  import { Spinner, IconAccountBalance } from "@dfinity/gix-components";
  import { toastsError } from "../../stores/toasts.store";
  import { get } from "svelte/store";
  import { snsProjectSelectedStore } from "../../derived/selected-project.derived";
  import { OWN_CANISTER_ID } from "../../constants/canister-ids.constants";
  import { ICPToken, type Token } from "@dfinity/nns";
  import { snsTokenSymbolSelectedStore } from "../../derived/sns/sns-token-symbol-selected.store";

  let visible: boolean = false;
  let transferring: boolean = false;

  let inputValue: number | undefined = undefined;

  const onSubmit = async () => {
    if (invalidForm || inputValue === undefined) {
      toastsError({
        labelKey: "Invalid ICPs input.",
      });
      return;
    }

    transferring = true;

    const selectedProjectId = get(snsProjectSelectedStore);

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
</script>

<button
  role="menuitem"
  data-tid="get-icp-button"
  on:click|preventDefault|stopPropagation={() => (visible = true)}
  class="open"
>
  <IconAccountBalance />
  <span>{`Get ${token.symbol}`}</span>
</button>

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
  @use "@dfinity/gix-components/styles/mixins/media";

  .open {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    font-size: var(--font-size-h5);
    font-weight: 700;

    letter-spacing: var(--letter-spacing-title);

    padding: var(--padding-2x);

    &:focus,
    &:hover {
      background: var(--background-tint);
    }

    span {
      margin: 0 0 0 var(--padding);
    }
  }

  @include media.light-theme() {
    .open {
      &:focus,
      &:hover {
        background: var(--background-shade);
      }
    }
  }

  form {
    display: flex;
    flex-direction: column;

    padding: var(--padding-2x) var(--padding);
  }
</style>
