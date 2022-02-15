import { HttpAgent } from "@dfinity/agent";
import { serviceURL } from "../constants/utils.constants";

// To avoid being executed in tests that only import it
export const createAgent = () => new HttpAgent({ host: serviceURL });
