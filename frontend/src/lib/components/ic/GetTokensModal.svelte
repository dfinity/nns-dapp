<script lang="ts">
  /**
   * Transfer ICP to current principal. For test purpose only and only available on "testnet" too.
   */
  import { Modal } from "@dfinity/gix-components";
  import Input from "$lib/components/ui/Input.svelte";
  import {
    getICPs,
    getTestBalance,
    getTokens,
    getBTC,
    getIcrcTokens,
  } from "$lib/services/dev.services";
  import { Spinner } from "@dfinity/gix-components";
  import { toastsError } from "$lib/stores/toasts.store";
  import {
    isCkBTCUniverseStore,
    selectedIcrcTokenUniverseIdStore,
  } from "$lib/derived/selected-universe.derived";
  import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";
  import type { Principal } from "@dfinity/principal";
  import { nonNullish, type Token } from "@dfinity/utils";
  import { browser } from "$app/environment";
  import { getIcrcTokenTestAccountBalance } from "$lib/api/dev.api";
  import { tokensStore } from "$lib/stores/tokens.store";
  import { createEventDispatcher } from "svelte";

  export let tokenSymbol: string;

  let transferring = false;

  let inputValue: number | undefined = undefined;

  let snsSelectedProjectId: Principal | undefined;
  $: snsSelectedProjectId = $snsOnlyProjectStore;

  let icrcSelectedProjectId: Principal | undefined;
  $: icrcSelectedProjectId = $selectedIcrcTokenUniverseIdStore;

  let token: Token | undefined;
  $: token = nonNullish(icrcSelectedProjectId)
    ? $tokensStore[icrcSelectedProjectId?.toText()]?.token
    : undefined;

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
      if (nonNullish(snsSelectedProjectId) && tokenBalanceE8s > 0n) {
        await getTokens({
          tokens: inputValue,
          rootCanisterId: snsSelectedProjectId,
        });
      } else if (nonNullish(icrcSelectedProjectId) && nonNullish(token)) {
        await getIcrcTokens({
          tokens: inputValue,
          token,
          ledgerCanisterId: icrcSelectedProjectId,
        });
      } else if ($isCkBTCUniverseStore) {
        await getBTC({
          amount: inputValue,
        });
      } else {
        await getICPs(inputValue);
      }

      close();
    } catch (err: unknown) {
      toastsError({
        labelKey: "ICPs could not be transferred.",
        err,
      });
    }

    transferring = false;
  };

  const dispatch = createEventDispatcher();
  const close = () => {
    dispatch("nnsClose");
  };

  let invalidForm: boolean;
  $: invalidForm = inputValue === undefined || inputValue <= 0;

  // Check the balance of the test account in that universe.
  let tokenBalanceE8s = 0n;
  $: snsSelectedProjectId,
    (async () => {
      // This was executed at build time and it depends on `window` in `base64ToUInt8Array` helper inside dev.api.ts
      if (browser) {
        if (nonNullish(snsSelectedProjectId)) {
          tokenBalanceE8s = await getTestBalance(snsSelectedProjectId);
        }
        if (nonNullish(icrcSelectedProjectId)) {
          tokenBalanceE8s = await getIcrcTokenTestAccountBalance(
            icrcSelectedProjectId
          );
        }
      }
    })();
</script>

<Modal visible role="alert" on:nnsClose={close}>
  <span slot="title">{`Get ${tokenSymbol}`}</span>

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
  form {
    display: flex;
    flex-direction: column;

    padding: var(--padding-2x) var(--padding);
  }

  button.primary {
    min-width: var(--padding-8x);
  }
</style>
