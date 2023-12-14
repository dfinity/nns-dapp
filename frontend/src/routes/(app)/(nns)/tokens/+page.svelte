<script lang="ts">
  import { goto } from "$app/navigation";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import Tokens from "$lib/pages/Tokens.svelte";
  import SignInTokens from "$lib/pages/SignInTokens.svelte";
  import { ENABLE_MY_TOKENS } from "$lib/stores/feature-flags.store";
  import { onMount } from "svelte";
  import { ActionType, type Action } from "$lib/types/actions";
  import { tokensListVisitorsStore } from "$lib/derived/tokens-list-visitors.derived";
  import { login } from "$lib/services/auth.services";
  import { loadCkBTCTokens } from "$lib/services/ckbtc-tokens.services";
  import { tokensListUserStore } from "$lib/derived/tokens-list-user.derived";
  import {
    snsProjectsCommittedStore,
    type SnsFullProject,
  } from "$lib/derived/sns/sns-projects.derived";
  import { uncertifiedLoadSnsAccountsBalances } from "$lib/services/sns-accounts-balance.services";
  import type { Universe, UniverseCanisterIdText } from "$lib/types/universe";
  import { isArrayEmpty } from "$lib/utils/utils";
  import { uncertifiedLoadAccountsBalance } from "$lib/services/wallet-uncertified-accounts.services";
  import { ckBTCUniversesStore } from "$lib/derived/ckbtc-universes.derived";
  import {
    isIcrcTokenUniverse,
    isUniverseCkBTC,
    isUniverseNns,
  } from "$lib/utils/universe.utils";
  import SnsTransactionModal from "$lib/modals/accounts/SnsTransactionModal.svelte";
  import type { UserTokenData } from "$lib/types/tokens-page";
  import { toTokenAmountV2 } from "$lib/utils/token.utils";
  import {
    icrcCanistersStore,
    type IcrcCanistersStoreData,
  } from "$lib/stores/icrc-canisters.store";
  import CkBtcTransactionModal from "$lib/modals/accounts/CkBTCTransactionModal.svelte";
  import { CKBTC_ADDITIONAL_CANISTERS } from "$lib/constants/ckbtc-additional-canister-ids.constants";
  import { updateBalance } from "$lib/services/ckbtc-minter.services";
  import { nonNullish } from "@dfinity/utils";
  import { Principal } from "@dfinity/principal";
  import IcrcTokenTransactionModal from "$lib/modals/accounts/IcrcTokenTransactionModal.svelte";
  import CkBtcReceiveModal from "$lib/modals/accounts/CkBTCReceiveModal.svelte";
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
  import { universesAccountsStore } from "$lib/derived/universes-accounts.derived";
  import type { Account } from "$lib/types/account";
  import IcrcReceiveModal from "$lib/modals/accounts/IcrcReceiveModal.svelte";

  onMount(() => {
    if (!$ENABLE_MY_TOKENS) {
      goto(AppPath.Accounts);
    }
    loadCkBTCTokens();
  });

  let loadSnsAccountsBalancesRequested = false;
  let loadCkBTCAccountsBalancesRequested = false;

  const loadSnsAccountsBalances = async (projects: SnsFullProject[]) => {
    // We start when the projects are fetched
    if (projects.length === 0) {
      return;
    }

    // We trigger the loading of the Sns Accounts Balances only once
    if (loadSnsAccountsBalancesRequested) {
      return;
    }

    loadSnsAccountsBalancesRequested = true;

    await uncertifiedLoadSnsAccountsBalances({
      rootCanisterIds: projects.map(({ rootCanisterId }) => rootCanisterId),
      excludeRootCanisterIds: [],
    });
  };

  const loadCkBTCAccountsBalances = async (universes: Universe[]) => {
    // We trigger the loading of the ckBTC Accounts Balances only once
    if (loadCkBTCAccountsBalancesRequested) {
      return;
    }

    /**
     * Calling updateBalance because users are confused about when and how to call it and product required to add this additional call within this process.
     * That way, when user navigates to the Tokens page, the call is also triggered.
     *
     * There is also a "Check for incoming BTC" button in the Wallet page.
     */
    universes.forEach((universe: Universe) => {
      const ckBTCCanisters = CKBTC_ADDITIONAL_CANISTERS[universe.canisterId];
      if (nonNullish(ckBTCCanisters.minterCanisterId)) {
        updateBalance({
          universeId: Principal.fromText(universe.canisterId),
          minterCanisterId: ckBTCCanisters.minterCanisterId,
          reload: () => loadAccountsBalances([universe.canisterId]),
          deferReload: false,
          uiIndicators: false,
        });
      }
    });

    loadCkBTCAccountsBalancesRequested = true;

    await loadAccountsBalances(universes.map(({ canisterId }) => canisterId));
  };

  const loadIcrcTokenAccounts = async (
    icrcCanisters: IcrcCanistersStoreData
  ) => {
    await loadAccountsBalances(Object.keys(icrcCanisters));
  };

  const loadAccountsBalances = async (
    universeIds: UniverseCanisterIdText[]
  ) => {
    // Selected universes are empty, no information shall and can be fetched
    if (isArrayEmpty(universeIds)) {
      return;
    }

    await uncertifiedLoadAccountsBalance({
      universeIds,
      excludeUniverseIds: [],
    });
  };

  const createReloadAccountBalance = (universeId: Principal) => () => {
    const isSnsProject = $snsProjectsCommittedStore.some(
      ({ rootCanisterId }) => rootCanisterId.toText() === universeId.toText()
    );
    if (isSnsProject) {
      return uncertifiedLoadSnsAccountsBalances({
        rootCanisterIds: [universeId],
        excludeRootCanisterIds: [],
      });
    }
    return loadAccountsBalances([universeId.toText()]);
  };

  $: (async () => {
    if ($authSignedInStore) {
      await Promise.allSettled([
        loadSnsAccountsBalances($snsProjectsCommittedStore),
        loadCkBTCAccountsBalances($ckBTCUniversesStore),
        loadIcrcTokenAccounts($icrcCanistersStore),
      ]);
    }
  })();

  type ModalType =
    | "sns-send"
    | "nns-send"
    | "ckbtc-send"
    | "icrc-send"
    | "icrc-receive"
    | "ckbtc-receive";
  let modal:
    | {
        type: ModalType;
        data: UserTokenData;
      }
    | undefined;
  const closeModal = () => {
    modal = undefined;
  };

  let ckBTCCanisters: CkBTCAdditionalCanisters | undefined;
  $: ckBTCCanisters =
    modal && isUniverseCkBTC(modal.data.universeId)
      ? CKBTC_ADDITIONAL_CANISTERS[modal?.data.universeId.toText()]
      : undefined;

  let account: Account | undefined;
  $: account =
    modal &&
    $universesAccountsStore[modal.data.universeId.toText()].find(
      ({ type }) => type === "main"
    );

  const handleAction = ({ detail }: { detail: Action }) => {
    // Any action from non-signed in user should be trigger a login
    if (!$authSignedInStore) {
      login();
    }
    if (detail.type === ActionType.Send) {
      if (isUniverseNns(detail.data.universeId)) {
        modal = { type: "nns-send", data: detail.data };
      } else if (isUniverseCkBTC(detail.data.universeId)) {
        modal = { type: "ckbtc-send", data: detail.data };
      } else if (
        isIcrcTokenUniverse({
          universeId: detail.data.universeId,
          icrcCanisters: $icrcCanistersStore,
        })
      ) {
        modal = { type: "icrc-send", data: detail.data };
      } else {
        // Default to SNS, this might change when we have more universe sources
        modal = { type: "sns-send", data: detail.data };
      }
    }
    if (detail.type === ActionType.Receive) {
      if (isUniverseCkBTC(detail.data.universeId)) {
        modal = { type: "ckbtc-receive", data: detail.data };
      } else {
        modal = { type: "icrc-receive", data: detail.data };
      }
    }
  };
</script>

<TestIdWrapper testId="tokens-route-component">
  {#if $authSignedInStore}
    <Tokens userTokensData={$tokensListUserStore} on:nnsAction={handleAction} />
  {:else}
    <SignInTokens
      on:nnsAction={handleAction}
      userTokensData={$tokensListVisitorsStore}
    />
  {/if}

  {#if modal?.type === "sns-send"}
    <SnsTransactionModal
      rootCanisterId={modal.data.universeId}
      token={modal.data.token}
      transactionFee={toTokenAmountV2(modal.data.fee)}
      on:nnsClose={closeModal}
    />
  {/if}

  {#if modal?.type === "ckbtc-send"}
    <CkBtcTransactionModal
      on:nnsClose={closeModal}
      on:nnsTransfer={closeModal}
      token={modal.data.token}
      transactionFee={modal.data.fee}
      universeId={modal.data.universeId}
      canisters={CKBTC_ADDITIONAL_CANISTERS[modal.data.universeId.toText()]}
    />
  {/if}

  {#if modal?.type === "icrc-send"}
    <IcrcTokenTransactionModal
      on:nnsClose={closeModal}
      ledgerCanisterId={modal.data.universeId}
      token={modal.data.token}
      transactionFee={modal.data.fee}
    />
  {/if}

  {#if modal?.type === "ckbtc-receive" && nonNullish(ckBTCCanisters) && nonNullish(account)}
    <CkBtcReceiveModal
      data={{
        canisters: ckBTCCanisters,
        account,
        universeId: modal.data.universeId,
        canSelectAccount: false,
        reload: createReloadAccountBalance(modal.data.universeId),
      }}
      on:nnsClose={closeModal}
    />
  {/if}

  {#if modal?.type === "icrc-receive" && nonNullish(account)}
    <IcrcReceiveModal
      data={{
        account,
        universeId: modal.data.universeId,
        canSelectAccount: false,
        reload: createReloadAccountBalance(modal.data.universeId),
        tokenSymbol: modal.data.token.symbol,
        logo: modal.data.logo,
      }}
      on:nnsClose={closeModal}
    />
  {/if}
</TestIdWrapper>
