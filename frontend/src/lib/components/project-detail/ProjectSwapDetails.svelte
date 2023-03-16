<script lang="ts">
  import { ICPToken, TokenAmount } from "@dfinity/nns";
  import type { SnsSummary } from "$lib/types/sns";
  import { getContext } from "svelte";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "$lib/types/project-detail.context";
  import { KeyValuePair } from "@dfinity/gix-components";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { SnsParams } from "@dfinity/sns";
  import DateSeconds from "$lib/components/ui/DateSeconds.svelte";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import { snsTotalTokenSupplyStore } from "$lib/stores/sns-total-token-supply.store";
  import type { Principal } from "@dfinity/principal";
  import { totalTokenSupply } from "$lib/utils/sns.utils";
  import { nonNullish } from "@dfinity/utils";
  import TestIdWrapper from "../common/TestIdWrapper.svelte";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let params: SnsParams;
  let token: IcrcTokenMetadata;
  let rootCanisterId: Principal;
  // type safety validation is done in ProjectDetail component
  $: ({
    swap: { params },
    token,
    rootCanisterId,
  } = $projectDetailStore.summary as SnsSummary);

  let minCommitmentIcp: TokenAmount;
  $: minCommitmentIcp = TokenAmount.fromE8s({
    amount: params.min_participant_icp_e8s,
    token: ICPToken,
  });
  let maxCommitmentIcp: TokenAmount;
  $: maxCommitmentIcp = TokenAmount.fromE8s({
    amount: params.max_participant_icp_e8s,
    token: ICPToken,
  });

  let snsTokens: TokenAmount;
  $: snsTokens = TokenAmount.fromE8s({
    amount: params.sns_token_e8s,
    token,
  });

  let snsTotalTokenSupply: TokenAmount | undefined;
  $: snsTotalTokenSupply = totalTokenSupply({
    totalSupplies: $snsTotalTokenSupplyStore,
    rootCanisterId,
    token,
  });
</script>

<TestIdWrapper testId="project-swap-details">
  {#if nonNullish(snsTotalTokenSupply)}
    <KeyValuePair testId="sns-total-token-supply">
      <span slot="key">{$i18n.sns_project_detail.total_tokens_supply} </span>
      <AmountDisplay slot="value" amount={snsTotalTokenSupply} singleLine />
    </KeyValuePair>
  {/if}
  <KeyValuePair>
    <span slot="key">{$i18n.sns_project_detail.total_tokens} </span>
    <AmountDisplay slot="value" amount={snsTokens} singleLine />
  </KeyValuePair>
  <KeyValuePair>
    <span slot="key">{$i18n.sns_project_detail.min_commitment} </span>
    <AmountDisplay slot="value" amount={minCommitmentIcp} singleLine />
  </KeyValuePair>
  <KeyValuePair>
    <span slot="key">{$i18n.sns_project_detail.max_commitment} </span>
    <AmountDisplay slot="value" amount={maxCommitmentIcp} singleLine />
  </KeyValuePair>
  <KeyValuePair>
    <span slot="key">{$i18n.sns_project_detail.sale_end} </span>
    <DateSeconds
      slot="value"
      seconds={Number(params.swap_due_timestamp_seconds ?? BigInt(0))}
      tagName="span"
    />
  </KeyValuePair>
</TestIdWrapper>
