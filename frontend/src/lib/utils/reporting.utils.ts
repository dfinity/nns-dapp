import type {
  ReportingPeriod,
  TransactionResults,
  TransactionsDateRange,
} from "$lib/types/reporting";
import {
  getFutureDateFromDelayInSeconds,
  nanoSecondsToDateTime,
  nowInBigIntNanoSeconds,
  secondsToDate,
} from "$lib/utils/date.utils";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import { mapIcpTransactionToReport } from "$lib/utils/icp-transactions.utils";
import {
  formatMaturity,
  getStateInfo,
  neuronAvailableMaturity,
  neuronStake,
  neuronStakedMaturity,
} from "$lib/utils/neuron.utils";
import {
  CsvGenerationError,
  FileSystemAccessError,
  saveGeneratedCsv,
} from "$lib/utils/reporting.save-csv-to-file.utils";
import { formatTokenV2 } from "$lib/utils/token.utils";
import { transactionName } from "$lib/utils/transactions.utils";
import { NeuronState, type NeuronInfo } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import {
  ICPToken,
  TokenAmountV2,
  isNullish,
  nonNullish,
  secondsToDuration,
} from "@dfinity/utils";

type Metadata = {
  label: string;
  value: string;
};

export type CsvDataset<T> = {
  data: T[];
  metadata?: Metadata[];
};

export type CsvHeader<T> = {
  id: keyof T;
  label: string;
};

/**
 * Forces Excel to treat a value as a string by wrapping it in an Excel formula.
 * Uses the '="value"' format which prevents Excel from automatically converting
 * large numbers into scientific notation or losing precision.
 */
const wrapAsExcelStringFormula = (value: bigint) => `="${value.toString()}"`;

const escapeCsvValue = (value: unknown): string => {
  if (isNullish(value)) return "";

  let stringValue = String(value);

  const patternForExcelFormulaString = /^="\d+"$/;
  if (patternForExcelFormulaString.test(stringValue)) {
    return stringValue;
  }

  const patternForSpecialCharacters = /[",\r\n=@|]/;
  if (!patternForSpecialCharacters.test(stringValue)) {
    return stringValue;
  }

  const formulaInjectionCharacters = "=@|";
  const characterToBreakFormula = "'";
  if (formulaInjectionCharacters.includes(stringValue[0])) {
    stringValue = `${characterToBreakFormula}${stringValue}`;
  }

  const patternForCharactersToQuote = /[",\r\n]/;
  if (patternForCharactersToQuote.test(stringValue)) {
    stringValue = `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

export const convertToCsv = <T>({
  data,
  headers,
  metadata = [],
}: {
  data: T[];
  headers: CsvHeader<T>[];
  metadata?: Metadata[];
}) => {
  if (headers.length === 0) return "";

  const PAD_LEFT_WHEN_METADATA_PRESENT = 2;
  const csvRows: string[] = [];
  let padLeft = 0;

  if (metadata.length > 0) {
    const sanitizedMetadata = metadata.map(({ label, value }) => ({
      label: escapeCsvValue(label),
      value: escapeCsvValue(value),
    }));

    const metadataRow = sanitizedMetadata
      .map(({ label, value }) => `${label},${value}`)
      .join("\n");
    csvRows.push(metadataRow);

    // Add an empty row to separate metadata from data
    const emptyRow = "";
    csvRows.push(emptyRow);

    padLeft = PAD_LEFT_WHEN_METADATA_PRESENT;
  }

  const emptyPrefix = Array(padLeft).fill("");
  const sanitizedHeaders = headers
    .map(({ label }) => label)
    .map((header) => escapeCsvValue(header));
  csvRows.push([...emptyPrefix, ...sanitizedHeaders].join(","));

  for (const row of data) {
    const values = headers.map((header) => escapeCsvValue(row[header.id]));

    csvRows.push([...emptyPrefix, ...values].join(","));
  }

  return csvRows.join("\n");
};

export const combineDatasetsToCsv = <T>({
  datasets,
  headers,
}: {
  headers: CsvHeader<T>[];
  datasets: CsvDataset<T>[];
}): string => {
  const csvParts: string[] = [];
  // A double empty line break requires 3 new lines
  const doubleCsvLineBreak = "\n\n\n";

  for (const dataset of datasets) {
    const { data, metadata } = dataset;
    const csvContent = convertToCsv<T>({ data, headers, metadata });
    csvParts.push(csvContent);
  }
  return csvParts.join(doubleCsvLineBreak);
};

/**
 * Downloads data as a single CSV file combining multiple datasets, using either the File System Access API or fallback method.
 *
 * @param options - Configuration object for the CSV download
 * @param options.datasets - Array of dataset objects to be combined into a single CSV
 * @param options.datasets[].data - Array of objects to be converted to CSV. Each object should have consistent keys
 * @param options.datasets[].metadata - Optional array of metadata objects. Each object should include a `label` and `value` key. When present, the corresponding data will be shifted two columns to the left
 * @param options.headers - Array of objects defining the headers and their order in the CSV. Each object should include an `id` key that corresponds to a key in the data objects
 * @param options.fileName - Name of the file without extension (defaults to "data")
 * @param options.description - File description for save dialog (defaults to "Csv file")
 *
 * @throws {FileSystemAccessError|CsvGenerationError} If there is an issue accessing the file system or generating the CSV
 * @returns {Promise<void>} Promise that resolves when the combined CSV file has been downloaded
 *
 * @remarks
 * - Uses the modern File System Access API when available, falling back to traditional download method
 * - Automatically handles values containing special characters like commas and new lines
 * - Combines multiple datasets into a single CSV file, maintaining their respective metadata
 * - Each dataset's data and metadata will be appended sequentially in the final CSV
 */
export const generateCsvFileToSave = async <T>({
  datasets,
  headers,
  fileName = "data",
  description = "Csv file",
}: {
  fileName?: string;
  description?: string;
  headers: CsvHeader<T>[];
  datasets: CsvDataset<T>[];
}): Promise<void> => {
  try {
    const csvContent = combineDatasetsToCsv({ datasets, headers });
    await saveGeneratedCsv({ csvContent, fileName, description });
  } catch (error) {
    console.error(error);
    if (
      error instanceof FileSystemAccessError ||
      error instanceof CsvGenerationError
    ) {
      throw error;
    }
    throw new CsvGenerationError(
      "Unexpected error generating Csv to download",
      {
        cause: error,
      }
    );
  }
};

export type TransactionsCsvData = {
  id: string;
  project: string;
  symbol: string;
  accountId: string;
  neuronId?: string;
  to: string | undefined;
  from: string | undefined;
  type: string;
  amount: string;
  timestamp: string;
};

export const buildTransactionsDatasets = ({
  transactions,
  i18n,
  principal,
  neuronAccounts,
  swapCanisterAccounts,
}: {
  transactions: TransactionResults;
  i18n: I18n;
  principal: Principal;
  neuronAccounts: Set<string>;
  swapCanisterAccounts: Set<string>;
}): CsvDataset<TransactionsCsvData>[] => {
  return transactions.map(({ entity, transactions }) => {
    const accountId = entity.identifier;
    let neuronId: string;

    const amount = TokenAmountV2.fromUlps({
      amount: entity.balance,
      token: ICPToken,
    });

    const metadata = [
      {
        label: i18n.reporting.account_id,
        value: accountId,
      },
    ];

    if (entity.type === "account") {
      metadata.push({
        label: i18n.reporting.account_name,
        value: entity.originalData.name ?? "Main",
      });
    }

    if (entity.type === "neuron") {
      neuronId = wrapAsExcelStringFormula(entity.originalData.neuronId);
      metadata.push({
        label: i18n.reporting.neuron_id,
        value: neuronId,
      });
    }

    metadata.push({
      label: replacePlaceholders(i18n.reporting.balance, {
        $tokenSymbol: ICPToken.symbol,
      }),
      value: formatTokenV2({
        value: amount,
        detailed: true,
      }),
    });

    metadata.push(
      {
        label: i18n.reporting.controller_id,
        value: principal.toText() ?? i18n.core.not_applicable,
      },
      {
        label: i18n.reporting.number_of_transactions,
        value: transactions.length.toString(),
      },
      {
        label: i18n.reporting.date_label,
        value: nanoSecondsToDateTime(nowInBigIntNanoSeconds()),
      }
    );

    return {
      metadata,
      data: transactions.map((transaction) => {
        const {
          to,
          from,
          type,
          tokenAmount,
          timestampNanos,
          transactionDirection,
        } = mapIcpTransactionToReport({
          accountIdentifier: accountId,
          transaction,
          neuronAccounts,
          swapCanisterAccounts,
        });

        const sign = transactionDirection === "credit" ? "+" : "-";
        const amount = formatTokenV2({ value: tokenAmount, detailed: true });
        const timestamp = nonNullish(timestampNanos)
          ? nanoSecondsToDateTime(timestampNanos)
          : i18n.core.not_applicable;

        return {
          id: transaction.id.toString(),
          project: ICPToken.name,
          symbol: ICPToken.symbol,
          accountId,
          neuronId,
          to,
          from,
          type: transactionName({ type, i18n }),
          amount: `${sign}${amount}`,
          timestamp,
        };
      }),
    };
  });
};

export type NeuronsCsvData = {
  controllerId: string;
  project: string;
  symbol: string;
  neuronId: string;
  neuronAccountId: string;
  stake: string;
  availableMaturity: string;
  stakedMaturity: string;
  dissolveDelaySeconds: string;
  dissolveDate: string;
  creationDate: string;
  state: string;
};

export const buildNeuronsDatasets = ({
  neurons,
  i18n,
  nnsAccountPrincipal,
}: {
  neurons: NeuronInfo[];
  i18n: I18n;
  nnsAccountPrincipal: Principal;
}): CsvDataset<NeuronsCsvData>[] => {
  const metadataDate = nanoSecondsToDateTime(nowInBigIntNanoSeconds());
  const metadata = [
    {
      label: i18n.reporting.principal_account_id,
      value: nnsAccountPrincipal.toText(),
    },
    {
      label: i18n.reporting.date_label,
      value: metadataDate,
    },
  ];

  const data = neurons.map((neuron) => {
    const stake = TokenAmountV2.fromUlps({
      amount: neuronStake(neuron),
      token: ICPToken,
    });
    const availableMaturity = neuronAvailableMaturity(neuron);
    const stakedMaturity = neuronStakedMaturity(neuron);
    const dissolveDate =
      neuron.state === NeuronState.Dissolving
        ? getFutureDateFromDelayInSeconds(neuron.dissolveDelaySeconds)
        : null;
    const creationDate = secondsToDate(Number(neuron.createdTimestampSeconds));

    return {
      controllerId: neuron.fullNeuron?.controller?.toString() ?? "",
      project: stake.token.name,
      symbol: stake.token.symbol,
      neuronId: wrapAsExcelStringFormula(neuron.neuronId),
      neuronAccountId: neuron.fullNeuron?.accountIdentifier.toString() ?? "",
      stake: formatTokenV2({
        value: stake,
        detailed: true,
      }),
      availableMaturity: formatMaturity(availableMaturity),
      stakedMaturity: formatMaturity(stakedMaturity),
      dissolveDelaySeconds: secondsToDuration({
        seconds: neuron.dissolveDelaySeconds,
        i18n: i18n.time,
      }),
      dissolveDate: dissolveDate ?? i18n.core.not_applicable,
      creationDate,
      state: i18n.neuron_state[getStateInfo(neuron.state).textKey],
    };
  });

  return [{ metadata, data }];
};

export const convertPeriodToNanosecondRange = (
  period: ReportingPeriod
): TransactionsDateRange => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const toNanoseconds = (milliseconds: number): bigint =>
    BigInt(milliseconds) * BigInt(1_000_000);

  switch (period) {
    case "all":
      return {};

    case "last-year":
      return {
        from: toNanoseconds(new Date(currentYear - 1, 0, 1).getTime()),
        to: toNanoseconds(new Date(currentYear, 0, 1).getTime()),
      };

    case "year-to-date":
      return {
        from: toNanoseconds(new Date(currentYear, 0, 1).getTime()),
      };
  }
};
