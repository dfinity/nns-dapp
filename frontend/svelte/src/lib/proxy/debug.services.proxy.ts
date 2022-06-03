import { LogType } from "../services/debug.services";

const importDebugServices = () => import("../services/debug.services");

export const generateDebugLogProxy = async (
  logType: LogType
): Promise<void> => {
  const { generateDebugLog } = await importDebugServices();

  return generateDebugLog(logType);
};
