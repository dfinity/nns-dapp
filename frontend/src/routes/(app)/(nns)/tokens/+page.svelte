<script lang="ts">
  import { goto } from "$app/navigation";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import Tokens from "$lib/pages/Tokens.svelte";
  import SignInTokens from "$lib/pages/SignInTokens.svelte";
  import { ENABLE_MY_TOKENS } from "$lib/stores/feature-flags.store";
  import { onMount } from "svelte";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { ICPToken, TokenAmount } from "@dfinity/utils";
  import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
  import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
  import CKBTC_LOGO from "$lib/assets/ckBTC.svg";
  import { UserTokenAction, type UserTokenData } from "$lib/types/tokens-page";
  import type { Action } from "$lib/types/actions";
  import { UnavailableTokenAmount } from "$lib/utils/token.utils";
  import { loadCkBTCTokens } from "$lib/services/ckbtc-tokens.services";
  import { tokensListVisitorsStore } from "$lib/derived/tokens-list-visitors.derived";
  import { login } from "$lib/services/auth.services";

  onMount(() => {
    if (!$ENABLE_MY_TOKENS) {
      goto(AppPath.Accounts);
    }
    loadCkBTCTokens();
  });

  const data: UserTokenData[] = [
    {
      universeId: OWN_CANISTER_ID,
      title: "Internet Computer",
      balance: TokenAmount.fromE8s({ amount: 314000000n, token: ICPToken }),
      logo: IC_LOGO_ROUNDED,
      actions: [UserTokenAction.GoToDetail],
    },
    {
      universeId: CKBTC_UNIVERSE_CANISTER_ID,
      title: "CkBTC",
      balance: new UnavailableTokenAmount({ name: "CKBTC", symbol: "ckBTC" }),
      logo: CKBTC_LOGO,
      actions: [UserTokenAction.Send, UserTokenAction.Receive],
    },
  ];

  const handleAction = ({ detail: _ }: { detail: Action }) => {
    // Any action from non-signed in user should be trigger a login
    if (!$authSignedInStore) {
      login();
    }
  };
</script>

<TestIdWrapper testId="tokens-route-component">
  {#if $authSignedInStore}
    <Tokens userTokensData={data} on:nnsAction={handleAction} />
  {:else}
    <SignInTokens
      on:nnsAction={handleAction}
      userTokensData={$tokensListVisitorsStore}
    />
  {/if}
</TestIdWrapper>
