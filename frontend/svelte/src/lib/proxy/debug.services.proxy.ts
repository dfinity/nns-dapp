const importDebugServices = () => import("../services/debug.services");

export const generateDebugLogProxy = async (): Promise<void> => {
  const { generateDebugLog } = await importDebugServices();

  return generateDebugLog();
};
