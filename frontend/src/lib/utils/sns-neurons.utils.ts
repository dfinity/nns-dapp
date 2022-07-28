import { SnsNeuron } from "@dfinity/sns";

export const sortSnsNeuronsByCreatedTimestamp = (
  neurons: SnsNeuron[]
): SnsNeuron[] =>
  neurons.sort((a, b) =>
    Number(b.created_timestamp_seconds - a.created_timestamp_seconds)
  );
