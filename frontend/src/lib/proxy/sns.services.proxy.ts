const importSnsServices = () => import("../services/sns.services");

export const loadSnsSummariesProxy = async (): Promise<void> => {
  const { loadSnsSummaries } = await importSnsServices();
  return loadSnsSummaries();
};

export const loadSnsSwapCommitmentsProxy = async (): Promise<void> => {
  const { loadSnsSwapCommitments } = await importSnsServices();
  return loadSnsSwapCommitments();
};
