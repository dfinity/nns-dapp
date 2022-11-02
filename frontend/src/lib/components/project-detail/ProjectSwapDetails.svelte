<script lang="ts">
  import { ICPToken, TokenAmount } from "@dfinity/nns";
  import type { SnsSummary, SnsTokenMetadata } from "$lib/types/sns";
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

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  let params: SnsParams;
  let token: SnsTokenMetadata;
  // type safety validation is done in ProjectDetail component
  $: ({
    swap: { params },
    token,
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
</script>

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
