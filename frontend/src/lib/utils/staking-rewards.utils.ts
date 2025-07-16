import {
  LEDGER_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import {
  DAYS_IN_AVG_YEAR,
  E8S_RATE,
  NNS_FINAL_REWARD_RATE,
  NNS_GENESIS_TIMESTAMP_SECONDS,
  NNS_INITIAL_REWARD_RATE,
  SECONDS_IN_DAY,
  SECONDS_IN_EIGHT_YEARS,
  SECONDS_IN_FOUR_YEARS,
} from "$lib/constants/constants";
import {
  MAX_AGE_BONUS,
  MAX_DISSOLVE_DELAY_BONUS,
} from "$lib/constants/neurons.constants";
import type { IcpSwapUsdPricesStoreData } from "$lib/derived/icp-swap.derived";
import type { GovernanceMetricsStoreData } from "$lib/stores/governance-metrics.store";
import type { NetworkEconomicsStoreData } from "$lib/stores/network-economics.store";
import { type NeuronsStore } from "$lib/stores/neurons.store";
import { type SnsAggregatorData } from "$lib/stores/sns-aggregator.store";
import { type NeuronsStore as SNSNeuronsStore } from "$lib/stores/sns-neurons.store";
import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import type { UserToken, UserTokenData } from "$lib/types/tokens-page";
import {
  cloneNeurons,
  getNeuronBonusRatio,
  getNeuronFreeMaturityE8s,
  getNeuronTotalMaturityE8s,
  getNeuronTotalStakeAfterFeesE8s,
  getNeuronTotalValueAfterFeesE8s,
  increaseNeuronMaturity,
  isNeuronEligibleToVote,
  maximiseNeuronParams,
  type AgnosticNeuron,
  type AgnosticNeuronArray,
} from "$lib/utils/agnostic-neuron.utils";
import { bigIntDiv, bigIntMul } from "$lib/utils/bigInt.utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { Principal } from "@dfinity/principal";
import { isNullish, nonNullish } from "@dfinity/utils";

/////////////////
/// DOC REFERENCE
/// https://docs.google.com/document/d/1jjglDtCZpdTHwPLB1hwW_oR-p4jU_t6ad1Gmw5bbiBk
/////////////////

export enum APY_CALC_ERROR {
  MISSING_DATA,
  UNEXPECTED,
}

type APY = Map<
  string,
  {
    cur: number;
    max: number;
    error?: APY_CALC_ERROR;
  }
>;

type StakingRewardDataReady = {
  loading: false;
  rewardBalanceUSD: number;
  rewardEstimateWeekUSD: number;
  stakingPower: number;
  stakingPowerUSD: number;
  apy: APY;
};

export type StakingRewardData =
  | { loading: true }
  | StakingRewardDataReady
  | {
      loading: false;
      error: string;
    };

export const isStakingRewardDataReady = (
  data: StakingRewardData
): data is StakingRewardDataReady => !data.loading && !("error" in data);

export interface StakingRewardCalcParams {
  auth: boolean;
  tokens: UserToken[];
  snsProjects: SnsAggregatorData;
  snsNeurons: SNSNeuronsStore;
  nnsNeurons: NeuronsStore;
  nnsEconomics: NetworkEconomicsStoreData;
  fxRates: IcpSwapUsdPricesStoreData;
  governanceMetrics: GovernanceMetricsStoreData;
  nnsTotalVotingPower: bigint | undefined;
}

export const getStakingRewardData = (
  params: StakingRewardCalcParams,
  forceInitialDate?: Date // For testing purposes
): StakingRewardData => {
  if (!params.auth) {
    logWithTimestamp("Staking rewards: user is not logged in.");
    return { loading: false, error: "Not authorized." };
  }

  if (isDataReady(params)) {
    logWithTimestamp("Staking rewards: data is available.");
    logWithTimestamp("Staking rewards: start calculation...");

    try {
      const res: StakingRewardData = {
        loading: false,
        rewardBalanceUSD: getRewardBalanceUSD(params),
        rewardEstimateWeekUSD: getRewardEstimationForWeek(
          params,
          forceInitialDate
        ),
        stakingPower: getStakingPower(params).value,
        stakingPowerUSD: getStakingPower(params).valueUSD,
        apy: getAPYs(params, forceInitialDate),
      };
      logWithTimestamp("Staking rewards: calculation completed, fields ready.");
      return res;
    } catch (e) {
      logWithTimestamp("Staking rewards: error during calculation.", e);
      return { loading: false, error: "Error during calculation." };
    }
  } else {
    logWithTimestamp("Staking rewards: waiting for data...");
    return { loading: true };
  }
};

const getRewardBalanceUSD = (params: StakingRewardCalcParams): number => {
  const { snsProjects, snsNeurons, nnsNeurons, fxRates } = params;

  const getReward = (
    neuron: AgnosticNeuron,
    ledgerPrincipal: Principal | string
  ): number =>
    bigIntDiv(getNeuronTotalMaturityE8s(neuron), BigInt(E8S_RATE), 20) *
    getFXRate(fxRates, ledgerPrincipal);

  let nnsTotalRewardUSD = 0;
  nnsNeurons.neurons?.forEach((neuron) => {
    try {
      nnsTotalRewardUSD += getReward(neuron, LEDGER_CANISTER_ID);
    } catch (e) {
      let message = `Staking rewards: unexpected error calculating NNS reward balance, ignoring neuron ${neuron.neuronId}.`;
      if (e instanceof ApyMissingDataError) {
        message = `Staking rewards: error calculating NNS reward balance, data is missing, ignoring neuron ${neuron.neuronId}.`;
      }
      logWithTimestamp(message, e);
    }
  });

  let snsTotalRewardUSD = 0;
  snsProjects.data?.forEach((sns) => {
    const rootPrincipal = sns.canister_ids.root_canister_id;
    const ledgerPrincipal = sns.canister_ids.ledger_canister_id;
    if (snsNeurons[rootPrincipal]) {
      snsNeurons[rootPrincipal].neurons.forEach((neuron) => {
        try {
          snsTotalRewardUSD += getReward(neuron, ledgerPrincipal);
        } catch (e) {
          let message = `Staking rewards: unexpected error calculating SNS reward balance, ignoring neuron ${neuron.id}.`;
          if (e instanceof ApyMissingDataError) {
            message = `Staking rewards: error calculating SNS reward balance, data is missing, ignoring neuron ${neuron.id}.`;
          }
          logWithTimestamp(message, e);
        }
      });
    }
  });

  return nnsTotalRewardUSD + snsTotalRewardUSD;
};

const getStakingPower = (params: StakingRewardCalcParams) => {
  const { snsProjects, snsNeurons, nnsNeurons, fxRates, tokens } = params;

  const getStaking = (
    neuron: AgnosticNeuron,
    ledgerPrincipal: Principal | string
  ) => {
    const staked = getNeuronTotalStakeAfterFeesE8s(neuron);
    const unstaked = getNeuronFreeMaturityE8s(neuron);

    return {
      stakedUSD:
        bigIntDiv(staked, BigInt(E8S_RATE), 20) *
        getFXRate(fxRates, ledgerPrincipal),
      totalUSD:
        bigIntDiv(staked + unstaked, BigInt(E8S_RATE), 20) *
        getFXRate(fxRates, ledgerPrincipal),
    };
  };

  let nnsTotalUSD = 0;
  let nnsStakedUSD = 0;
  nnsTotalUSD += getToken(tokens, LEDGER_CANISTER_ID)?.balanceInUsd ?? 0;
  nnsNeurons.neurons?.forEach((neuron) => {
    try {
      nnsStakedUSD += getStaking(neuron, LEDGER_CANISTER_ID).stakedUSD;
      nnsTotalUSD += getStaking(neuron, LEDGER_CANISTER_ID).totalUSD;
    } catch (e) {
      let message = `Staking rewards: unexpected error calculating NNS staking power, ignoring neuron ${neuron.neuronId}.`;
      if (e instanceof ApyMissingDataError) {
        message = `Staking rewards: error calculating NNS staking power, data is missing, ignoring neuron ${neuron.neuronId}.`;
      }
      logWithTimestamp(message, e);
    }
  });

  let snsTotalUSD = 0;
  let snsStakedUSD = 0;
  snsProjects.data?.forEach((sns) => {
    const rootPrincipal = sns.canister_ids.root_canister_id;
    const ledgerPrincipal = sns.canister_ids.ledger_canister_id;
    snsTotalUSD += getToken(tokens, ledgerPrincipal)?.balanceInUsd ?? 0;
    if (snsNeurons[rootPrincipal]) {
      snsNeurons[rootPrincipal].neurons.forEach((neuron) => {
        try {
          snsStakedUSD += getStaking(neuron, ledgerPrincipal).stakedUSD;
          snsTotalUSD += getStaking(neuron, ledgerPrincipal).totalUSD;
        } catch (e) {
          let message = `Staking rewards: unexpected error calculating SNS staking power, ignoring neuron ${neuron.id}.`;
          if (e instanceof ApyMissingDataError) {
            message = `Staking rewards: error calculating SNS staking power, data is missing, ignoring neuron ${neuron.id}.`;
          }
          logWithTimestamp(message, e);
        }
      });
    }
  });

  const totalStakedUSD = nnsStakedUSD + snsStakedUSD;
  const totalValueUSD = nnsTotalUSD + snsTotalUSD;

  return {
    value: totalValueUSD ? totalStakedUSD / totalValueUSD : 0,
    valueUSD: totalStakedUSD,
  };
};

const getRewardEstimationForWeek = (
  params: StakingRewardCalcParams,
  forceInitialDate?: Date
) => {
  let nnsReward = 0;
  try {
    nnsReward = getNnsRewardEstimationUSD(params, 7, false, forceInitialDate);
  } catch (e) {
    let message =
      "Staking rewards: unexpected error calculating NNS reward estimation, ignoring NNS reward.";
    if (e instanceof ApyMissingDataError) {
      message =
        "Staking rewards: error calculating NNS reward estimation, data is missing, ignoring NNS reward.";
    }
    logWithTimestamp(message, e);
  }

  let snsReward = 0;
  snsReward =
    params.snsProjects.data?.reduce((total, sns) => {
      try {
        return (
          total +
          getSnsRewardEstimationUSD(params, 7, sns, false, forceInitialDate)
        );
      } catch (e) {
        let message = `Staking rewards: unexpected error calculating SNS reward estimation for ${sns.canister_ids.root_canister_id}, ignoring SNS reward.`;
        if (e instanceof ApyMissingDataError) {
          message = `Staking rewards: error calculating SNS reward estimation for ${sns.canister_ids.root_canister_id}, data is missing, ignoring SNS reward.`;
        }
        logWithTimestamp(message, e);
        return total;
      }
    }, 0) ?? 0;

  return nnsReward + snsReward;
};

const getNnsRewardEstimationUSD = (
  params: StakingRewardCalcParams,
  days: number,
  maximiseParams: boolean = false,
  forceInitialDate?: Date
): number => {
  return getNeuronsRewardEstimationUSD({
    neurons: params.nnsNeurons.neurons ?? [],
    maximiseParams,
    days,
    otherParams: params,
    forceInitialDate,
  });
};

const getSnsRewardEstimationUSD = (
  params: StakingRewardCalcParams,
  days: number,
  sns: CachedSnsDto,
  maximiseParams: boolean = false,
  forceInitialDate?: Date
): number => {
  return getNeuronsRewardEstimationUSD({
    neurons:
      params.snsNeurons[sns.canister_ids.root_canister_id]?.neurons ?? [],
    maximiseParams,
    days,
    otherParams: params,
    sns,
    forceInitialDate,
  });
};

const getAPYs = (params: StakingRewardCalcParams, forceInitialDate?: Date) => {
  const { snsNeurons, nnsNeurons } = params;
  const apy: APY = new Map();

  try {
    apy.set(
      OWN_CANISTER_ID_TEXT,
      getAPY(
        params,
        nnsNeurons.neurons ?? [],
        LEDGER_CANISTER_ID.toText(),
        getNnsRewardEstimationUSD,
        forceInitialDate
      )
    );
  } catch (e) {
    let message = `Staking rewards: unexpected error calculating NNS APY, using 0.`;
    let error = APY_CALC_ERROR.UNEXPECTED;
    if (e instanceof ApyMissingDataError) {
      message = `Staking rewards: error calculating NNS APY, data is missing, using 0.`;
      error = APY_CALC_ERROR.MISSING_DATA;
    }
    logWithTimestamp(message, e);
    apy.set(OWN_CANISTER_ID_TEXT, {
      cur: 0,
      max: 0,
      error,
    });
  }

  params.snsProjects.data?.forEach((sns) => {
    const rootPrincipal = sns.canister_ids.root_canister_id;
    const ledgerPrincipal = sns.canister_ids.ledger_canister_id;
    try {
      apy.set(
        rootPrincipal,
        getAPY(
          params,
          snsNeurons[rootPrincipal]?.neurons ?? [],
          ledgerPrincipal,
          (params, days, maximiseNeuronParams, forceInitialDate) =>
            getSnsRewardEstimationUSD(
              params,
              days,
              sns,
              maximiseNeuronParams,
              forceInitialDate
            ),
          forceInitialDate
        )
      );
    } catch (e) {
      let message = `Staking rewards: unexpected error calculating SNS APY for ${rootPrincipal}, using 0.`;
      let error = APY_CALC_ERROR.UNEXPECTED;
      if (e instanceof ApyMissingDataError) {
        message = `Staking rewards: error calculating SNS APY for ${rootPrincipal}, data is missing, using 0.`;
        error = APY_CALC_ERROR.MISSING_DATA;
      }
      logWithTimestamp(message, e);
      apy.set(rootPrincipal, {
        cur: 0,
        max: 0,
        error,
      });
    }
  });

  return apy;
};

const getAPY = (
  params: StakingRewardCalcParams,
  neurons: AgnosticNeuron[],
  ledgerPrincipal: Principal | string,
  rewardEstimationFunction: (
    params: StakingRewardCalcParams,
    days: number,
    maximiseParams?: boolean,
    forceInitialDate?: Date
  ) => number,
  forceInitialDate?: Date
) => {
  const yearEstimatedRewardUSD = rewardEstimationFunction(
    params,
    365,
    false,
    forceInitialDate
  );
  const yearEstimatedMaxRewardUSD = rewardEstimationFunction(
    params,
    365,
    true,
    forceInitialDate
  );

  let totalUSD = 0;
  let totalMaxUSD = 0;
  const fxRate = getFXRate(params.fxRates, ledgerPrincipal);

  neurons.forEach((neuron) => {
    const neuronTotalStake = bigIntDiv(
      getNeuronTotalStakeAfterFeesE8s(neuron),
      BigInt(E8S_RATE),
      8
    );
    totalUSD += neuronTotalStake * fxRate;

    const neuronTotalMaxStake = bigIntDiv(
      // Considering the un-staked maturity as well
      getNeuronTotalValueAfterFeesE8s(neuron),
      BigInt(E8S_RATE),
      8
    );
    totalMaxUSD += neuronTotalMaxStake * fxRate;
  });

  if (totalUSD === 0 || totalMaxUSD === 0) {
    return { cur: 0, max: 0 };
  }

  return {
    cur: yearEstimatedRewardUSD / totalUSD,
    max: yearEstimatedMaxRewardUSD / totalMaxUSD,
  };
};

/////////////////////
/// SUPPORT FUNCTIONS
/////////////////////

const isDataReady = (params: StakingRewardCalcParams) => {
  const {
    tokens,
    snsProjects,
    snsNeurons,
    nnsNeurons,
    nnsEconomics,
    fxRates,
    governanceMetrics,
    nnsTotalVotingPower,
  } = params;

  const areTokensReady = !tokens?.some((t) => t.balance === "loading");
  const areSnsProjectsReady = Boolean(snsProjects?.data);
  const areSnsNeuronsReady = Boolean(Object.keys(snsNeurons).length);
  const areNnsNeuronsReady = Boolean(nnsNeurons?.neurons);
  const isNnsEconomicsReady = Boolean(nnsEconomics.parameters);
  const areFXRatesReady = fxRates !== "error" && Boolean(fxRates);
  const isGovernanceMetricsReady = Boolean(governanceMetrics.metrics);
  const isNnsTotalVotingPowerReady = nonNullish(nnsTotalVotingPower);

  return [
    areTokensReady,
    areSnsProjectsReady,
    areSnsNeuronsReady,
    areNnsNeuronsReady,
    isNnsEconomicsReady,
    areFXRatesReady,
    isGovernanceMetricsReady,
    isNnsTotalVotingPowerReady,
  ].every((x) => x === true);
};

const getNeuronsRewardEstimationUSD = (params: {
  neurons: AgnosticNeuronArray;
  maximiseParams?: boolean;
  days: number;
  sns?: CachedSnsDto;
  forceInitialDate?: Date;
  otherParams: StakingRewardCalcParams;
}) => {
  const {
    neurons: _neurons,
    maximiseParams,
    days,
    sns,
    forceInitialDate,
    otherParams,
  } = params;

  if (!_neurons || _neurons.length === 0) {
    return 0;
  }
  const neurons = cloneNeurons(_neurons);

  if (maximiseParams) {
    neurons.forEach((neuron) =>
      maximiseNeuronParams(
        neuron,
        getRewardParams(otherParams, sns).maxDissolve,
        forceInitialDate
      )
    );
  }

  let neuronsTotalRewardUSD = 0;
  for (let i = 0; i < days; i++) {
    const projectDayRewardUSD = neurons.reduce((acc, neuron) => {
      let neuronVotingPower = 0n;

      if (
        isNeuronEligibleToVote(
          neuron,
          getRewardParams(otherParams, sns).minStake,
          getRewardParams(otherParams, sns).minDissolve,
          getDate(i, forceInitialDate)
        )
      ) {
        const fullStake = getNeuronTotalStakeAfterFeesE8s(neuron);
        if (fullStake > 0n) {
          const votingPowerRatio =
            1 + getNeuronBonus(otherParams, neuron, i, sns, forceInitialDate);
          neuronVotingPower = bigIntMul(fullStake, votingPowerRatio, 20);
        }
      }

      if (neuronVotingPower > 0n) {
        const tokenReward = getTokenReward(
          otherParams,
          neuronVotingPower,
          i,
          sns,
          forceInitialDate
        );

        const rewardUSD =
          tokenReward *
          getFXRate(
            otherParams.fxRates,
            sns ? sns.canister_ids.ledger_canister_id : LEDGER_CANISTER_ID
          );
        increaseNeuronMaturity(
          neuron,
          BigInt(Math.floor(tokenReward * Number(E8S_RATE)))
        );
        return acc + rewardUSD;
      } else {
        return acc;
      }
    }, 0);

    neuronsTotalRewardUSD += projectDayRewardUSD;
  }
  return neuronsTotalRewardUSD;
};

const getFXRate = (
  fxRates: IcpSwapUsdPricesStoreData,
  ledgerPrincipal: Principal | string
) => {
  const principal =
    ledgerPrincipal instanceof Principal
      ? ledgerPrincipal.toText()
      : ledgerPrincipal;
  const rate = (fxRates as Record<string, number>)[principal];

  if (isNullish(rate)) {
    throw new ApyMissingDataError(`FX rate for ${principal}.`);
  }
  return rate;
};

const getToken = (tokens: UserToken[], ledgerPrincipal: Principal | string) => {
  return tokens.find(
    (t) =>
      t.ledgerCanisterId.toText() ===
      (ledgerPrincipal instanceof Principal
        ? ledgerPrincipal.toText()
        : ledgerPrincipal)
  ) as UserTokenData | undefined;
};

const getDate = (addDays: number = 0, forceInitialDate?: Date): Date => {
  const now = forceInitialDate ?? new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  date.setDate(now.getDate() + addDays);
  return date;
};

const getPoolReward = (params: {
  genesisTimestampSeconds: number;
  totalSupply: number;
  initialRewardRate: number;
  finalRewardRate: number;
  transitionDurationSeconds: number;
  referenceDate: Date;
}) => {
  const {
    genesisTimestampSeconds,
    totalSupply,
    initialRewardRate,
    finalRewardRate,
    transitionDurationSeconds,
    referenceDate,
  } = params;

  let rewardRate = 0;

  const durationDays = transitionDurationSeconds / SECONDS_IN_DAY;
  const elapsedDays = Math.round(
    (referenceDate.getTime() / 1000 - genesisTimestampSeconds) / SECONDS_IN_DAY
  );

  if (elapsedDays > durationDays) {
    rewardRate = finalRewardRate;
  } else {
    const rateDiff = initialRewardRate - finalRewardRate;
    const remainingDays = durationDays - elapsedDays;
    rewardRate =
      finalRewardRate + rateDiff * (remainingDays / durationDays) ** 2;
  }

  return (totalSupply * rewardRate) / DAYS_IN_AVG_YEAR;
};

const getTokenReward = (
  params: StakingRewardCalcParams,
  neuronVotingPower: bigint,
  addDays: number,
  sns?: CachedSnsDto,
  forceInitialDate?: Date
) => {
  const totalVotingPower = sns
    ? BigInt(
        sns.metrics?.get_metrics_result.Ok?.voting_power_metrics
          ?.governance_total_potential_voting_power ?? 0
      )
    : params.nnsTotalVotingPower;

  if (!totalVotingPower) {
    throw new ApyMissingDataError(
      "total voting power for " +
        (sns ? sns.canister_ids.root_canister_id : OWN_CANISTER_ID_TEXT)
    );
  }

  const neuronRewardRatioForTheDay = bigIntDiv(
    neuronVotingPower,
    totalVotingPower!,
    20
  );

  const rawReward =
    getPoolReward({
      genesisTimestampSeconds: getGenesisTimestampSeconds(sns),
      referenceDate: getDate(addDays, forceInitialDate),
      transitionDurationSeconds: getRewardParams(params, sns).rewardTransition,
      initialRewardRate: getRewardParams(params, sns).initialReward,
      finalRewardRate: getRewardParams(params, sns).finalReward,
      totalSupply: getRewardParams(params, sns).totalSupply,
    }) * neuronRewardRatioForTheDay;

  return Math.trunc(rawReward * E8S_RATE) / E8S_RATE;
};

const getNeuronBonus = (
  params: StakingRewardCalcParams,
  neuron: AgnosticNeuron,
  addDays: number,
  sns?: CachedSnsDto,
  forceInitialDate?: Date
): number =>
  getNeuronBonusRatio(neuron, {
    dissolveMax: getRewardParams(params, sns).maxDissolve,
    dissolveBonus: getRewardParams(params, sns).maxDissolveBonus,
    ageMax: getRewardParams(params, sns).maxAge,
    ageBonus: getRewardParams(params, sns).maxAgeBonus,
    referenceDate: getDate(addDays, forceInitialDate),
  });

const getGenesisTimestampSeconds = (sns?: CachedSnsDto): number => {
  if (sns) {
    const snsGenesisTimestamp =
      sns.metrics?.get_metrics_result.Ok?.genesis_timestamp_seconds;
    if (snsGenesisTimestamp) {
      return snsGenesisTimestamp;
    } else {
      logWithTimestamp(
        `Staking rewards: No genesis timestamp found for SNS ${sns.canister_ids.root_canister_id}, using 0.`
      );
      return 0;
    }
  } else {
    return NNS_GENESIS_TIMESTAMP_SECONDS;
  }
};

const getRewardParams = (
  params: StakingRewardCalcParams,
  sns?: CachedSnsDto
) => {
  if (sns) {
    return getSnsRewardParams(sns);
  } else {
    return getNnsRewardParams(params);
  }
};

class ApyMissingDataError extends Error {
  constructor(message: string, ...args: ErrorOptions[]) {
    logWithTimestamp("Staking rewards: missing data for" + message + ".");
    super(message, ...args);
  }
}

/////////////////////////
/// SUPPORT FUNCTIONS SNS
/////////////////////////

const getSnsRewardParams = (sns: CachedSnsDto) => {
  const snsSystemParams = sns.nervous_system_parameters;

  return {
    minDissolve: BigInt(
      snsSystemParams.neuron_minimum_dissolve_delay_to_vote_seconds ?? 0
    ),
    minStake: BigInt(snsSystemParams.neuron_minimum_stake_e8s ?? 0),
    maxDissolve: snsSystemParams.max_dissolve_delay_seconds ?? 0,
    maxDissolveBonus:
      (snsSystemParams.max_dissolve_delay_bonus_percentage ?? 0) / 100,
    maxAge: snsSystemParams.max_neuron_age_for_age_bonus ?? 0,
    maxAgeBonus: (snsSystemParams.max_age_bonus_percentage ?? 0) / 100,
    initialReward:
      (snsSystemParams.voting_rewards_parameters
        ?.initial_reward_rate_basis_points ?? 0) / 10000,
    finalReward:
      (snsSystemParams.voting_rewards_parameters
        ?.final_reward_rate_basis_points ?? 0) / 10000,
    rewardTransition:
      snsSystemParams.voting_rewards_parameters
        ?.reward_rate_transition_duration_seconds ?? 0,
    totalSupply: Math.trunc(sns.icrc1_total_supply / E8S_RATE),
  };
};

/////////////////////////
/// SUPPORT FUNCTIONS NNS
/////////////////////////

const getNnsRewardParams = (params: StakingRewardCalcParams) => ({
  minDissolve:
    params.nnsEconomics.parameters?.votingPowerEconomics
      ?.neuronMinimumDissolveDelayToVoteSeconds ?? 0n,
  minStake: params.nnsEconomics.parameters?.neuronMinimumStake ?? 0n,
  maxDissolve: SECONDS_IN_EIGHT_YEARS,
  maxDissolveBonus: MAX_DISSOLVE_DELAY_BONUS,
  maxAge: SECONDS_IN_FOUR_YEARS,
  maxAgeBonus: MAX_AGE_BONUS,
  initialReward: NNS_INITIAL_REWARD_RATE,
  finalReward: NNS_FINAL_REWARD_RATE,
  rewardTransition: SECONDS_IN_EIGHT_YEARS,
  totalSupply: Number(params.governanceMetrics.metrics?.totalSupplyIcp),
});
