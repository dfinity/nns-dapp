<script lang="ts">
  /**
   * Transfer ICP to current principal. For test purpose only and only available on dev environments.
   */
  import { Dropdown, DropdownItem, Modal } from "@dfinity/gix-components";
  import Input from "$lib/components/ui/Input.svelte";
  import {
    getICPs,
    getTestBalance,
    getSnsTokens,
    getBTC,
    getIcrcTokens,
  } from "$lib/services/dev.services";
  import { Spinner } from "@dfinity/gix-components";
  import { toastsError } from "$lib/stores/toasts.store";
  import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { Principal } from "@dfinity/principal";
  import { nonNullish } from "@dfinity/utils";
  import { getIcrcTokenTestAccountBalance } from "$lib/api/dev.api";
  import { tokensListUserStore } from "$lib/derived/tokens-list-user.derived";
  import { isUserTokenData } from "$lib/utils/user-token.utils";
  import { isUniverseCkBTC, isUniverseNns } from "$lib/utils/universe.utils";
  import type { UserToken, UserTokenData } from "$lib/types/tokens-page";
  import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
  import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
  import { createEventDispatcher } from "svelte";

  let transferring = false;

  let inputValue: number | undefined = undefined;

  const getBalance = async (universeId: Principal): Promise<bigint> => {
    const ledgerCanisterId =
      $snsProjectsCommittedStore.find(
        ({ rootCanisterId }) => rootCanisterId.toText() === universeId.toText()
      )?.summary.ledgerCanisterId ?? universeId;
    try {
      if (isUniverseNns(universeId)) {
        return await getTestBalance();
      } else if (isUniverseCkBTC(universeId)) {
        return 1n;
      } else {
        return await getIcrcTokenTestAccountBalance(ledgerCanisterId);
      }
    } catch (_) {
      // Return 0 if getting the balance fails.
      return 0n;
    }
  };

  const getTokensWithBalance = async (
    tokens: UserToken[]
  ): Promise<UserTokenData[]> => {
    const balances: Array<{ balance: bigint; universeIdText: string }> =
      await Promise.all(
        tokens.map(async (token) => ({
          balance: await getBalance(token.universeId),
          universeIdText: token.universeId.toText(),
        }))
      );
    return tokens.filter(isUserTokenData).filter(({ universeId }) => {
      return (
        balances.find(({ universeIdText }) => {
          return universeIdText === universeId.toText();
        })?.balance ?? 0n > 0n
      );
    });
  };
  let tokensWithBalance: UserTokenData[] = [];
  $: {
    getTokensWithBalance($tokensListUserStore)
      .then((tokens) => {
        tokensWithBalance = tokens;
      })
      .catch((err) => {
        console.error("error in getTokensWithBalance", err);
      });
  }

  let selectedUniverseId: string | undefined = tokensWithBalance
    .find(
      ({ universeId }) =>
        universeId.toText() === $selectedUniverseIdStore.toText()
    )
    ?.universeId.toText();
  let selectedTokenData: UserTokenData | undefined;
  $: selectedTokenData = tokensWithBalance.find(
    ({ universeId }) => universeId.toText() === selectedUniverseId
  );

  const dispatch = createEventDispatcher();
  const onSubmit = async () => {
    if (invalidForm || inputValue === undefined) {
      toastsError({
        labelKey: "Invalid ICPs input.",
      });
      return;
    }

    transferring = true;

    try {
      if (nonNullish(selectedUniverseId) && nonNullish(selectedTokenData)) {
        if (
          $snsProjectsCommittedStore.find(
            ({ rootCanisterId }) =>
              rootCanisterId.toText() === selectedUniverseId
          )
        ) {
          await getSnsTokens({
            tokens: inputValue,
            rootCanisterId: Principal.fromText(selectedUniverseId),
          });
        } else if (isUniverseCkBTC(selectedUniverseId)) {
          await getBTC({
            amount: inputValue,
          });
        } else if ($icrcCanistersStore[selectedUniverseId]) {
          await getIcrcTokens({
            tokens: inputValue,
            token: selectedTokenData.token,
            ledgerCanisterId: Principal.fromText(selectedUniverseId),
          });
        } else {
          // Default to transfer ICPs if the test account's balance of the selected universe is 0.
          await getICPs(inputValue);
        }
      }

      close();
    } catch (err: unknown) {
      toastsError({
        labelKey: "Tokens could not be transferred.",
        err,
      });
    }

    transferring = false;
    getSnsTokens;
  };

  const close = () => {
    dispatch("nnsClose");
  };

  let invalidForm: boolean;
  $: invalidForm = inputValue === undefined || inputValue <= 0;
</script>

<Modal visible role="alert" on:nnsClose={close}>
  <span slot="title">{`Get ${selectedTokenData?.token.symbol}`}</span>

  <form
    id="get-icp-form"
    data-tid="get-icp-form"
    on:submit|preventDefault={onSubmit}
  >
    <span>Select token</span>
    <Dropdown name="select-token" bind:selectedValue={selectedUniverseId}>
      {#each tokensWithBalance as { title, universeId } (universeId.toText())}
        <DropdownItem value={universeId.toText()}>{title}</DropdownItem>
      {/each}
    </Dropdown>

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
