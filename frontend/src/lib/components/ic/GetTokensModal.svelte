<script lang="ts">
  /**
   * Transfer ICP to current principal. For test purpose only and only available on dev environments.
   */
  import {
    getIcrcTokenTestAccountBalance,
    getTestIcpAccountBalance,
  } from "$lib/api/dev.api";
  import Input from "$lib/components/ui/Input.svelte";
  import { icrcCanistersStore } from "$lib/derived/icrc-canisters.derived";
  import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { snsLedgerCanisterIdsStore } from "$lib/derived/sns/sns-canisters.derived";
  import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
  import { tokensByUniverseIdStore } from "$lib/derived/tokens.derived";
  import { universesStore } from "$lib/derived/universes.derived";
  import { getBTC, getICPs, getIcrcTokens } from "$lib/services/dev.services";
  import { toastsError } from "$lib/stores/toasts.store";
  import type { Universe } from "$lib/types/universe";
  import { isUniverseCkBTC, isUniverseNns } from "$lib/utils/universe.utils";
  import {
    Dropdown,
    DropdownItem,
    Modal,
    Spinner,
  } from "@dfinity/gix-components";
  import { Principal } from "@dfinity/principal";
  import { isNullish, nonNullish, type Token } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  let transferring = false;

  let inputValue: number | undefined = undefined;

  const getBalance = async (universeId: string): Promise<bigint> => {
    const universeIdPrincipal = Principal.fromText(universeId);
    const ledgerCanisterId =
      $snsProjectsCommittedStore.find(
        ({ rootCanisterId }) => rootCanisterId.toText() === universeId
      )?.summary.ledgerCanisterId ?? universeIdPrincipal;
    try {
      if (isUniverseNns(universeIdPrincipal)) {
        return await getTestIcpAccountBalance();
      } else if (isUniverseCkBTC(universeId)) {
        // Show always to get ckBTC
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
    universes: Universe[]
  ): Promise<Universe[]> =>
    (
      await Promise.all(
        universes.map(async (universe) => ({
          balance: await getBalance(universe.canisterId),
          universe,
        }))
      )
    )
      .filter(({ balance }) => balance > 0n)
      .map(({ universe }) => universe);
  let universesWithBalance: Universe[] = [];
  $: {
    getTokensWithBalance($universesStore)
      .then((universes) => {
        universesWithBalance = universes;
        // Set the selected universe if not set yet.
        selectedUniverseId ??= universes.find(({ canisterId }) => {
          return canisterId === $selectedUniverseIdStore.toText();
        })?.canisterId;
      })
      .catch((err) => {
        console.error("error in getTokensWithBalance", err);
      });
  }

  let selectedUniverseId: string | undefined = undefined;
  let selectedUniverse: Universe | undefined;
  $: selectedUniverse = universesWithBalance.find(
    ({ canisterId }) => canisterId === selectedUniverseId
  );
  let selectedToken: Token | undefined;
  $: selectedToken = nonNullish(selectedUniverseId)
    ? $tokensByUniverseIdStore[selectedUniverseId]
    : undefined;

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
      if (nonNullish(selectedUniverseId) && nonNullish(selectedUniverse)) {
        if (
          $snsProjectsCommittedStore.find(
            ({ rootCanisterId }) =>
              rootCanisterId.toText() === selectedUniverseId
          )
        ) {
          const ledgerCanisterId =
            $snsLedgerCanisterIdsStore[selectedUniverseId];
          if (isNullish(selectedToken)) {
            console.error(`token for ${selectedUniverseId} is undefined`);
          } else if (isNullish(ledgerCanisterId)) {
            console.error(
              `ledgerCanisterId for ${selectedUniverseId} is undefined`
            );
          } else {
            await getIcrcTokens({
              tokens: inputValue,
              token: selectedToken,
              ledgerCanisterId,
            });
          }
        } else if (isUniverseCkBTC(selectedUniverseId)) {
          await getBTC({
            amount: inputValue,
          });
        } else if ($icrcCanistersStore[selectedUniverseId]) {
          if (nonNullish(selectedToken)) {
            await getIcrcTokens({
              tokens: inputValue,
              token: selectedToken,
              ledgerCanisterId: Principal.fromText(selectedUniverseId),
            });
          } else {
            console.error(`token for ${selectedUniverseId} is undefined`);
          }
        } else {
          // Default to transfer ICPs if the test account's balance of the selected universe is 0.
          await getICPs(inputValue);
        }
      } else {
        console.error(
          "selectedUniverseId or selectedTokenData is undefined",
          selectedUniverseId,
          selectedUniverse
        );
      }

      close();
    } catch (err: unknown) {
      toastsError({
        labelKey: "Tokens could not be transferred.",
        err,
      });
    }

    transferring = false;
  };

  const close = () => {
    dispatch("nnsClose");
  };

  let invalidForm: boolean;
  $: invalidForm = inputValue === undefined || inputValue <= 0;
</script>

<Modal visible role="alert" on:nnsClose={close}>
  <span slot="title">{`Get ${selectedToken?.symbol ?? "Tokens"}`}</span>

  <form
    id="get-icp-form"
    data-tid="get-icp-form"
    on:submit|preventDefault={onSubmit}
  >
    <span>Select token</span>
    <Dropdown name="select-token" bind:selectedValue={selectedUniverseId}>
      {#each universesWithBalance as { title, canisterId } (canisterId)}
        <!-- data-tid in span used to wait for in e2e test -->
        <DropdownItem value={canisterId}
          ><span data-tid={title}>{title}</span></DropdownItem
        >
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
