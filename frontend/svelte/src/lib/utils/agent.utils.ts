import { HttpAgent } from "@dfinity/agent";
import { serviceURL } from "../constants/utils.constants";

// To avoid being executed in tests that only import it
export const createAgent = async () => {
  const agent = new HttpAgent({ host: serviceURL });

  if (process.env.FETCH_ROOT_KEY === "true") {
    await agent.fetchRootKey();
  }

  return agent;
};
