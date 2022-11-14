const importSnsServices = () => import("../services/sns.services");

export const p_loadSnsSummariesProxy = async (): Promise<void> => {
  const { p_loadSnsSummaries } = await importSnsServices();
  return p_loadSnsSummaries();
};

export const p_loadSnsSwapCommitmentsProxy = async (): Promise<void> => {
  const { p_loadSnsSwapCommitments } = await importSnsServices();
  return p_loadSnsSwapCommitments();
};
