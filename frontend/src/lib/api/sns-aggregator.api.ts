import { SNS_AGGREGATOR_CANISTER_URL } from "$lib/constants/environment.constants";
import {
  AGGREGATOR_CANISTER_VERSION,
  AGGREGATOR_PAGE_SIZE,
} from "$lib/constants/sns.constants";
import type { CachedSns, CachedSnsDto } from "$lib/types/sns-aggregator";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { convertDtoData } from "$lib/utils/sns-aggregator-converters.utils";

const aggergatorPageUrl = (page: number) => `/sns/list/page/${page}/slow.json`;

const querySnsAggregator = async (page = 0): Promise<CachedSnsDto[]> => {
  const response = await fetch(
    `${SNS_AGGREGATOR_CANISTER_URL}/${AGGREGATOR_CANISTER_VERSION}${aggergatorPageUrl(
      page
    )}`
  );
  if (!response.ok) {
    throw new Error("Error loading SNS projects from aggregator canister");
  }
  const data: CachedSnsDto[] = await response.json();
  if (data.length === AGGREGATOR_PAGE_SIZE) {
    const nextPageData = await querySnsAggregator(page + 1);
    return [...data, ...nextPageData];
  }
  return data;
};

export const querySnsProjects = async (): Promise<CachedSns[]> => {
  logWithTimestamp("Loading SNS projects from aggregator canister...");
  try {
    const data: CachedSnsDto[] = await querySnsAggregator();
    const convertedData = convertDtoData(data);
    logWithTimestamp("Loading SNS projects from aggregator canister completed");
    return convertedData;
  } catch (err) {
    console.error("Error converting data", err);
    throw new Error("Error converting data from aggregator canister");
  }
};
