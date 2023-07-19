const importAppServices = () => import("../services/app.services");

export const initAppPrivateDataProxy = async () => {
  const { initAppPrivateData } = await importAppServices();
  return initAppPrivateData();
};
