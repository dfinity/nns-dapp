const importAppServices = () => import("../services/app.services");

export const initAppPrivateProxy = async () => {
  const { initAppPrivate } = await importAppServices();
  return initAppPrivate();
};
