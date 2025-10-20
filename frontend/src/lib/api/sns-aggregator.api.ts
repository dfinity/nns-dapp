import { SNS_AGGREGATOR_CANISTER_URL } from "$lib/constants/environment.constants";
import { AGGREGATOR_CANISTER_VERSION } from "$lib/constants/sns.constants";
import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import { logWithTimestamp } from "$lib/utils/dev.utils";

const aggregatorPageUrl = (page: number) =>
  `${SNS_AGGREGATOR_CANISTER_URL}/${AGGREGATOR_CANISTER_VERSION}/sns/list/page/${page}/slow.json`;

// Aggregator has a page size of 10 elements.
// We currently have 51 projects so 6 pages
// https://github.com/dfinity/nns-dapp/blob/b056a5dd42ffc8f198ce8eb92688645389293ef6/rs/sns_aggregator/src/state.rs#L140
const PAGE_COUNT = 6;
const pages = [...Array(PAGE_COUNT).keys()].map(aggregatorPageUrl);

export const queryParallelSnsAggregator = async (): Promise<CachedSnsDto[]> => {
  const pagePromises = pages.map(async (page) => {
    try {
      const response = await fetch(page);

      if (!response.ok) {
        console.error(
          `Error loading SNS project page ${page} from aggregator canister (status ${response.status})`
        );
        return [] as CachedSnsDto[];
      }
      return await response.json();
    } catch (e) {
      console.error(
        `Error loading SNS project page ${page} from aggregator canister`,
        e
      );
      return [] as CachedSnsDto[];
    }
  });

  const results = await Promise.all(pagePromises);
  const allProjects = results.flat();

  if (allProjects.length === 0) throw new Error("Error loading SNS projects");

  return allProjects;
};

export const querySnsProjects = async (): Promise<CachedSnsDto[]> => {
  logWithTimestamp("Loading SNS projects from aggregator canister...");

  const data: CachedSnsDto[] = await queryParallelSnsAggregator();

  logWithTimestamp(
    `Loading SNS projects from aggregator canister completed. Loaded ${data.length} projects.`
  );
  return data;
};
