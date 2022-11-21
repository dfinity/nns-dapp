const importSnsServices = () => import("../services/sns.services");

export const loadSnsSwapCommitmentsProxy = async (): Promise<void> => {
  const { loadSnsSwapCommitments } = await importSnsServices();
  return loadSnsSwapCommitments();
};
