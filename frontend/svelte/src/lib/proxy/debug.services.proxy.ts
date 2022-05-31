const importDebugServices = () => import("../services/debug.services");

export const generateDebugLogProxy = async (
  safeToFile: boolean
): Promise<void> => {
  const { generateDebugLog } = await importDebugServices();

  return generateDebugLog(safeToFile);
};
