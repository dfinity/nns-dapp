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
import { nonNullish } from "@dfinity/utils";

/////////////////
/// DOC REFERENCE
/// https://docs.google.com/document/d/1jjglDtCZpdTHwPLB1hwW_oR-p4jU_t6ad1Gmw5bbiBk
/////////////////

type APY = Map<
  string,
  {
    cur: number;
    max: number;
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
  params: StakingRewardCalcParams
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
        rewardEstimateWeekUSD:
          getNnsRewardEstimationUSD(params, 7) +
          getAllSnssRewardEstimationUSD(params, 7),
        stakingPower: getStakingPower(params).value,
        stakingPowerUSD: getStakingPower(params).valueUSD,
        apy: getAPYs(params),
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
    nnsTotalRewardUSD += getReward(neuron, LEDGER_CANISTER_ID);
  });

  let snsTotalRewardUSD = 0;
  snsProjects.data?.forEach((sns) => {
    const rootPrincipal = sns.canister_ids.root_canister_id;
    const ledgerPrincipal = sns.canister_ids.ledger_canister_id;
    if (snsNeurons[rootPrincipal]) {
      snsNeurons[rootPrincipal].neurons.forEach((neuron) => {
        snsTotalRewardUSD += getReward(neuron, ledgerPrincipal);
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
    nnsStakedUSD += getStaking(neuron, LEDGER_CANISTER_ID).stakedUSD;
    nnsTotalUSD += getStaking(neuron, LEDGER_CANISTER_ID).totalUSD;
  });

  let snsTotalUSD = 0;
  let snsStakedUSD = 0;
  snsProjects.data?.forEach((sns) => {
    const rootPrincipal = sns.canister_ids.root_canister_id;
    const ledgerPrincipal = sns.canister_ids.ledger_canister_id;
    snsTotalUSD += getToken(tokens, ledgerPrincipal)?.balanceInUsd ?? 0;
    if (snsNeurons[rootPrincipal]) {
      snsNeurons[rootPrincipal].neurons.forEach((neuron) => {
        snsStakedUSD += getStaking(neuron, ledgerPrincipal).stakedUSD;
        snsTotalUSD += getStaking(neuron, ledgerPrincipal).totalUSD;
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

const getNnsRewardEstimationUSD = (
  params: StakingRewardCalcParams,
  days: number,
  maximiseParams: boolean = false
): number => {
  return getNeuronsRewardEstimationUSD({
    neurons: params.nnsNeurons.neurons ?? [],
    maximiseParams,
    days,
    otherParams: params,
  });
};

const getSnsRewardEstimationUSD = (
  params: StakingRewardCalcParams,
  days: number,
  sns: CachedSnsDto,
  maximiseParams: boolean = false
): number => {
  return getNeuronsRewardEstimationUSD({
    neurons:
      params.snsNeurons[sns.canister_ids.root_canister_id]?.neurons ?? [],
    maximiseParams,
    days,
    otherParams: params,
    sns,
  });
};

const getAllSnssRewardEstimationUSD = (
  params: StakingRewardCalcParams,
  days: number
): number =>
  params.snsProjects.data?.reduce((total, sns) => {
    return total + getSnsRewardEstimationUSD(params, days, sns);
  }, 0) ?? 0;

const getAPYs = (params: StakingRewardCalcParams) => {
  const { snsNeurons, nnsNeurons } = params;
  const apy: APY = new Map();

  apy.set(
    OWN_CANISTER_ID_TEXT,
    getAPY(
      params,
      nnsNeurons.neurons ?? [],
      LEDGER_CANISTER_ID.toText(),
      getNnsRewardEstimationUSD
    )
  );
  params.snsProjects.data?.forEach((sns) => {
    const rootPrincipal = sns.canister_ids.root_canister_id;
    const ledgerPrincipal = sns.canister_ids.ledger_canister_id;
    apy.set(
      rootPrincipal,
      getAPY(
        params,
        snsNeurons[rootPrincipal]?.neurons ?? [],
        ledgerPrincipal,
        (params, days, maximiseNeuronParams) =>
          getSnsRewardEstimationUSD(params, days, sns, maximiseNeuronParams)
      )
    );
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
    maximiseParams?: boolean
  ) => number
) => {
  const yearEstimatedRewardUSD = rewardEstimationFunction(params, 365);
  const yearEstimatedMaxRewardUSD = rewardEstimationFunction(params, 365, true);

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
  otherParams: StakingRewardCalcParams;
}) => {
  const { neurons: _neurons, maximiseParams, days, sns, otherParams } = params;

  if (!_neurons || _neurons.length === 0) {
    return 0;
  }
  const neurons = cloneNeurons(_neurons ?? []);

  if (maximiseParams) {
    neurons.forEach((neuron) =>
      maximiseNeuronParams(
        neuron,
        getRewardParams(otherParams, sns).maxDissolve
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
          getDate(i)
        )
      ) {
        const fullStake = getNeuronTotalStakeAfterFeesE8s(neuron);
        if (fullStake > 0n) {
          const votingPowerRatio =
            1 + getNeuronBonus(otherParams, neuron, i, sns);
          neuronVotingPower = bigIntMul(fullStake, votingPowerRatio, 20);
        }
      }

      if (neuronVotingPower > 0) {
        const tokenReward = getTokenReward(
          otherParams,
          neuronVotingPower,
          i,
          sns
        );

        const rewardUSD =
          tokenReward * getFXRate(otherParams.fxRates, LEDGER_CANISTER_ID);
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
  return (fxRates as Record<string, number>)[
    ledgerPrincipal instanceof Principal
      ? ledgerPrincipal.toText()
      : ledgerPrincipal
  ];
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

const getDate = (addDays: number = 0): Date => {
  const now = new Date();
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
  sns?: CachedSnsDto
) => {
  const totalVotingPower = sns
    ? getTotalVotingPower(sns)
    : params.nnsTotalVotingPower;

  if (totalVotingPower === 0n) {
    logWithTimestamp(
      "Staking rewards: total voting power missing for reward calculation."
    );
    return 0;
  }

  const neuronRewardRatioForTheDay = bigIntDiv(
    neuronVotingPower,
    totalVotingPower!,
    20
  );

  const rawReward =
    getPoolReward({
      genesisTimestampSeconds: getGenesisTimestampSeconds(sns),
      referenceDate: getDate(addDays),
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
  sns?: CachedSnsDto
): number =>
  getNeuronBonusRatio(neuron, {
    dissolveMax: getRewardParams(params, sns).maxDissolve,
    dissolveBonus: getRewardParams(params, sns).maxDissolveBonus,
    ageMax: getRewardParams(params, sns).maxAge,
    ageBonus: getRewardParams(params, sns).maxAgeBonus,
    referenceDate: getDate(addDays),
  });

const getGenesisTimestampSeconds = (sns?: CachedSnsDto): number => {
  if (sns) {
    const snsGenesisTimestamp =
      SNS_GENESIS_TIMESTAMP_SECONDS[sns.canister_ids.root_canister_id];
    if (snsGenesisTimestamp) {
      return snsGenesisTimestamp;
    } else {
      logWithTimestamp(
        `Staking rewards: No genesis timestamp found for SNS ${sns.canister_ids.root_canister_id}.`
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
      snsSystemParams.voting_rewards_parameters
        ?.initial_reward_rate_basis_points ?? 0,
    finalReward:
      snsSystemParams.voting_rewards_parameters
        ?.final_reward_rate_basis_points ?? 0,
    rewardTransition:
      snsSystemParams.voting_rewards_parameters
        ?.reward_rate_transition_duration_seconds ?? 0,
    totalSupply: sns.icrc1_total_supply,
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

const getTotalVotingPower = (_sns: CachedSnsDto): bigint => {
  // @TODO: USE THE EXPOSED TOTAL VOTING POWER!
  return 0n;
};

////////////////////
/// TODO MOCKED DATA
////////////////////

const SNS_GENESIS_TIMESTAMP_SECONDS: Record<string, number> = {
  // Alice
  ["oh4fn-kyaaa-aaaaq-aaega-cai"]: 1736790536,
  // BOOM DAO
  ["xjngq-yaaaa-aaaaq-aabha-cai"]: 1693715788,
  // Catalyze
  ["uly3p-iqaaa-aaaaq-aabma-cai"]: 1693223087,
  // Cecil The Lion DAO
  ["ju4gz-6iaaa-aaaaq-aaeva-cai"]: 1741515516,
  // DecideAI DAO
  ["x4kx5-ziaaa-aaaaq-aabeq-cai"]: 1691591985, // Approx
  // DOLR AI
  ["67bll-riaaa-aaaaq-aaauq-cai"]: 1687199713, // Approx
  // Dragginz
  ["zxeu2-7aaaa-aaaaq-aaafa-cai"]: 1670315374, // Approx
  // ELNA AI
  ["gkoex-viaaa-aaaaq-aacmq-cai"]: 1709209296,
  // EstateDAO
  ["abhsa-pyaaa-aaaaq-aac3q-cai"]: 1712478525,
  // FomoWell
  ["pww3s-sqaaa-aaaaq-aaedq-cai"]: 1735934905,
  // FuelEV
  ["nllv2-byaaa-aaaaq-aaema-cai"]: 1738077495,
  // Gold DAO
  ["tw2vt-hqaaa-aaaaq-aab6a-cai"]: 1702368252,
  // IC Explorer
  ["n6mex-aqaaa-aaaaq-aaepq-cai"]: 1739708720,
  // ICFC
  ["gyito-zyaaa-aaaaq-aacpq-cai"]: 1710523096,
  // ICLighthouse DAO
  ["hjcnr-bqaaa-aaaaq-aacka-cai"]: 1708958462,
  // ICPanda
  ["d7wvo-iiaaa-aaaaq-aacsq-cai"]: 1710783322,
  // ICPEx
  ["jpz24-eqaaa-aaaaq-aaexq-cai"]: 1741941191,
  // ICPSwap
  ["csyra-haaaa-aaaaq-aacva-cai"]: 1711034629,
  // ICVC
  ["nuywj-oaaaa-aaaaq-aadta-cai"]: 1722750662,
  // Kinic
  ["7jkta-eyaaa-aaaaq-aaarq-cai"]: 1686064505,
  // KongSwap
  ["ormnc-tiaaa-aaaaq-aadyq-cai"]: 1729505139,
  // Mimic
  ["4m6il-zqaaa-aaaaq-aaa2a-cai"]: 1690320455, // Approx
  // Motoko
  ["ko36b-myaaa-aaaaq-aadbq-cai"]: 1715000742,
  // Neutrinite
  ["extk7-gaaaa-aaaaq-aacda-cai"]: 1702903834,
  // NFID Wallet
  ["m2blf-zqaaa-aaaaq-aaejq-cai"]: 1737735646,
  // Nuance
  ["rzbmc-yiaaa-aaaaq-aabsq-cai"]: 1694946754,
  // OpenChat
  ["3e3x2-xyaaa-aaaaq-aaalq-cai"]: 1677744638,
  // ORIGYN
  ["leu43-oiaaa-aaaaq-aadgq-cai"]: 1716620793,
  // Personal DAO
  ["izscx-raaaa-aaaaq-aaesq-cai"]: 1741017684,
  // PokedBots
  ["nb7he-piaaa-aaaaq-aadqq-cai"]: 1722453757,
  // Sneed
  ["fp274-iaaaa-aaaaq-aacha-cai"]: 1705799402,
  // SONIC
  ["qtooy-2yaaa-aaaaq-aabvq-cai"]: 1695889993,
  // Swampies
  ["l7ra6-uqaaa-aaaaq-aadea-cai"]: 1715346333,
  // TACO DAO
  ["lacdn-3iaaa-aaaaq-aae3a-cai"]: 1746713438,
  // TRAX
  ["ecu3s-hiaaa-aaaaq-aacaq-cai"]: 1702635478,
  // WaterNeuron
  ["jmod6-4iaaa-aaaaq-aadkq-cai"]: 1718691853,
  // Yuku AI
  ["cj5nf-5yaaa-aaaaq-aacxq-cai"]: 1711451235,
  // ---- (formerly CYCLES-TRANSFER-STATION)
  ["ibahq-taaaa-aaaaq-aadna-cai"]: 1719543728,
  // ---- ex Seers ---- (formerly SEERS)
  ["u67kc-jyaaa-aaaaq-aabpq-cai"]: 1694474846,
};
