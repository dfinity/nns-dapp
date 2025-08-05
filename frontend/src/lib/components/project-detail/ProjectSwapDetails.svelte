<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import DateSeconds from "$lib/components/ui/DateSeconds.svelte";
  import {
    getDeniedCountries,
    getMaxNeuronsFundParticipation,
  } from "$lib/getters/sns-summary";
  import { i18n } from "$lib/stores/i18n";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import type { CountryCode } from "$lib/types/location";
  import {
    PROJECT_DETAIL_CONTEXT_KEY,
    type ProjectDetailContext,
  } from "$lib/types/project-detail.context";
  import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
  import { formatNumber } from "$lib/utils/format.utils";
  import { KeyValuePair } from "@dfinity/gix-components";
  import { ICPToken, TokenAmountV2, nonNullish } from "@dfinity/utils";
  import { getContext } from "svelte";

  const { store: projectDetailStore } = getContext<ProjectDetailContext>(
    PROJECT_DETAIL_CONTEXT_KEY
  );

  // type safety validation is done in ProjectDetail component
  let summary: SnsSummaryWrapper;
  $: summary = $projectDetailStore.summary as SnsSummaryWrapper;

  let token: IcrcTokenMetadata;
  $: token = summary.token;

  let minCommitmentIcp: TokenAmountV2;
  $: minCommitmentIcp = TokenAmountV2.fromUlps({
    amount: summary.getMinParticipantIcpE8s(),
    token: ICPToken,
  });

  let maxCommitmentIcp: TokenAmountV2;
  $: maxCommitmentIcp = TokenAmountV2.fromUlps({
    amount: summary.getMaxParticipantIcpE8s(),
    token: ICPToken,
  });

  let snsTokens: TokenAmountV2;
  $: snsTokens = TokenAmountV2.fromUlps({
    amount: summary.getSnsTokenE8s(),
    token,
  });

  let snsTotalTokenSupply: TokenAmountV2 | undefined | null;
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
      {#snippet key()}<span
          >{$i18n.sns_project_detail.total_tokens_supply}
        </span>{/snippet}
      {#snippet value()}<AmountDisplay
          amount={snsTotalTokenSupply}
          singleLine
        />{/snippet}
    </KeyValuePair>
  {/if}
  <KeyValuePair testId="sns-tokens-distributed">
    {#snippet key()}<span
        >{$i18n.sns_project_detail.total_tokens}
      </span>{/snippet}
    {#snippet value()}<AmountDisplay amount={snsTokens} singleLine />{/snippet}
  </KeyValuePair>
  <KeyValuePair testId="project-swap-min-participants">
    {#snippet key()}<span
        >{$i18n.sns_project_detail.min_participants}
      </span>{/snippet}
    {#snippet value()}<span
        >{formatNumber(summary.getMinParticipants(), {
          minFraction: 0,
          maxFraction: 0,
        })}</span
      >{/snippet}
  </KeyValuePair>
  <KeyValuePair testId="sns-min-participant-commitment">
    {#snippet key()}<span
        >{$i18n.sns_project_detail.min_participant_commitment}
      </span>{/snippet}
    {#snippet value()}<AmountDisplay
        amount={minCommitmentIcp}
        detailed
        singleLine
      />{/snippet}
  </KeyValuePair>
  <KeyValuePair testId="sns-max-participant-commitment">
    {#snippet key()}<span
        >{$i18n.sns_project_detail.max_participant_commitment}
      </span>{/snippet}
    {#snippet value()}<AmountDisplay
        amount={maxCommitmentIcp}
        singleLine
      />{/snippet}
  </KeyValuePair>
  {#if nonNullish(maxNFParticipation)}
    <KeyValuePair testId="sns-max-nf-commitment">
      {#snippet key()}<span
          >{$i18n.sns_project_detail.max_nf_commitment}
        </span>{/snippet}
      {#snippet value()}<AmountDisplay
          amount={TokenAmountV2.fromUlps({
            amount: maxNFParticipation,
            token: ICPToken,
          })}
          singleLine
        />{/snippet}
    </KeyValuePair>
  {/if}
  <KeyValuePair testId="sns-sale-end">
    {#snippet key()}<span>{$i18n.sns_project_detail.sale_end} </span>{/snippet}
    {#snippet value()}<DateSeconds
        seconds={Number(summary.getSwapDueTimestampSeconds() ?? 0n)}
        tagName="span"
      />{/snippet}
  </KeyValuePair>
  {#if hasDeniedCountries}
    <KeyValuePair testId="excluded-countries">
      {#snippet key()}<span
          >{$i18n.sns_project_detail.persons_excluded}
        </span>{/snippet}
      {#snippet value()}<span>{formattedDeniedCountryCodes}</span>{/snippet}
    </KeyValuePair>
  {/if}
</TestIdWrapper>
