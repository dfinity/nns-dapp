<script lang="ts">
  import { TokenAmount, ICPToken, TokenAmountV2 } from "@dfinity/utils";
  import {
    getDeniedCountries,
    getMaxNeuronsFundParticipation,
  } from "$lib/getters/sns-summary";
  import type { SnsSummary } from "$lib/types/sns";
  import { getContext } from "svelte";
  import type { CountryCode } from "$lib/types/location";
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
  import { nonNullish } from "@dfinity/utils";
  import TestIdWrapper from "../common/TestIdWrapper.svelte";
  import { formatNumber } from "$lib/utils/format.utils";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  // type safety validation is done in ProjectDetail component
  let summary: SnsSummary;
  $: summary = $projectDetailStore.summary as SnsSummary;

  let params: SnsParams;
  let token: IcrcTokenMetadata;
  $: ({
    swap: { params },
    token,
  } = summary);

  let minCommitmentIcp: TokenAmountV2;
  $: minCommitmentIcp = TokenAmountV2.fromUlps({
    amount: params.min_participant_icp_e8s,
    token: ICPToken,
  });
  let maxCommitmentIcp: TokenAmountV2;
  $: maxCommitmentIcp = TokenAmountV2.fromUlps({
    amount: params.max_participant_icp_e8s,
    token: ICPToken,
  });

  let snsTokens: TokenAmountV2;
  $: snsTokens = TokenAmountV2.fromUlps({
    amount: params.sns_token_e8s,
    token,
  });

  let snsTotalTokenSupply: TokenAmount | undefined | null;
  $: snsTotalTokenSupply = $projectDetailStore.totalTokensSupply;

  let deniedCountryCodes: CountryCode[];
  $: deniedCountryCodes = getDeniedCountries(summary);

  let hasDeniedCountries: boolean;
  $: hasDeniedCountries = deniedCountryCodes.length > 0;

  let formattedDeniedCountryCodes: string;
  $: formattedDeniedCountryCodes = deniedCountryCodes.join(", ");

  let maxNFParticipation: bigint | undefined;
  $: maxNFParticipation = getMaxNeuronsFundParticipation(summary);
</script>

<TestIdWrapper testId="project-swap-details-component">
  {#if nonNullish(snsTotalTokenSupply)}
    <KeyValuePair testId="sns-total-token-supply">
      <span slot="key">{$i18n.sns_project_detail.total_tokens_supply} </span>
      <AmountDisplay slot="value" amount={snsTotalTokenSupply} singleLine />
    </KeyValuePair>
  {/if}
  <KeyValuePair testId="sns-tokens-distributed">
    <span slot="key">{$i18n.sns_project_detail.total_tokens} </span>
    <AmountDisplay slot="value" amount={snsTokens} singleLine />
  </KeyValuePair>
  <KeyValuePair testId="project-swap-min-participants">
    <span slot="key">{$i18n.sns_project_detail.min_participants} </span>
    <span slot="value"
      >{formatNumber(params.min_participants, {
        minFraction: 0,
        maxFraction: 0,
      })}</span
    >
  </KeyValuePair>
  <KeyValuePair testId="sns-min-participant-commitment">
    <span slot="key"
      >{$i18n.sns_project_detail.min_participant_commitment}
    </span>
    <AmountDisplay slot="value" amount={minCommitmentIcp} detailed singleLine />
  </KeyValuePair>
  <KeyValuePair testId="sns-max-participant-commitment">
    <span slot="key"
      >{$i18n.sns_project_detail.max_participant_commitment}
    </span>
    <AmountDisplay slot="value" amount={maxCommitmentIcp} singleLine />
  </KeyValuePair>
  {#if nonNullish(maxNFParticipation)}
    <KeyValuePair testId="sns-max-nf-commitment">
      <span slot="key">{$i18n.sns_project_detail.max_nf_commitment} </span>
      <AmountDisplay
        slot="value"
        amount={TokenAmountV2.fromUlps({
          amount: maxNFParticipation,
          token: ICPToken,
        })}
        singleLine
      />
    </KeyValuePair>
  {/if}
  <KeyValuePair testId="sns-sale-end">
    <span slot="key">{$i18n.sns_project_detail.sale_end} </span>
    <DateSeconds
      slot="value"
      seconds={Number(params.swap_due_timestamp_seconds ?? BigInt(0))}
      tagName="span"
    />
  </KeyValuePair>
  {#if hasDeniedCountries}
    <KeyValuePair testId="excluded-countries">
      <span slot="key">{$i18n.sns_project_detail.persons_excluded} </span>
      <span slot="value">{formattedDeniedCountryCodes}</span>
    </KeyValuePair>
  {/if}
</TestIdWrapper>
