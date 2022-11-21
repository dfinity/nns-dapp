const importAppServices = () => import("../services/app.services");

export const initAppDataProxy = async (): Promise<
  [PromiseSettledResult<void[]>, PromiseSettledResult<void[]>]
> => {
  const { initAppPrivateData } = await importAppServices();
  return initAppPrivateData();
};
