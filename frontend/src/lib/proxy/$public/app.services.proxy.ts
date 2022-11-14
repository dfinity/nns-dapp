const importAppServices = () => import("../../services/$public/app.services");

export const initAppProxy = async (): Promise<
  [PromiseSettledResult<void[]>, PromiseSettledResult<void[]>]
> => {
  const { initApp } = await importAppServices();
  return initApp();
};
