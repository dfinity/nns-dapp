import { HttpAgent } from "@dfinity/agent";

const host = process.env.SERVICE_URL;

export const agent = new HttpAgent({ host });
