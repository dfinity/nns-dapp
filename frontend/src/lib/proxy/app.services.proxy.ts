const importAppServices = () => import("../services/app.services");

export const initAppPrivateDataProxy = async (icrcEnabled: boolean) => {
  const { initAppPrivateData } = await importAppServices();
  return initAppPrivateData(icrcEnabled);
};
