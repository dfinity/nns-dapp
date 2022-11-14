const importAppServices = () => import("../services/app.services");

export const initAppProxy = async (): Promise<
  [PromiseSettledResult<void[]>, PromiseSettledResult<void[]>]
> => {
  const { initApp } = await importAppServices();
  return initApp();
};

export const p_initAppProxy = async (): Promise<
  [PromiseSettledResult<void[]>, PromiseSettledResult<void[]>]
> => {
  const { p_initApp } = await importAppServices();
  return p_initApp();
};
