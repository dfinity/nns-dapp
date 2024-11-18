const convertToCSV = (data: Record<string, unknown>[]) => {
  const headers = Object.keys(data[0]);

  const csvRows = [headers.join(",")];

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      // Handle special cases (like strings with commas)
      return typeof value === "string" && value.includes(",")
        ? `"${value}"`
        : value;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
};

export const downloadCSV = async ({
  entity,
  fileName = "entity",
  description = " CSV file",
}: {
  entity: Record<string, unknown>[];
  fileName?: string;
  description?: string;
}): Promise<void> => {
  const csvContent = convertToCSV(entity);
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  // Use native file system API if available
  if (window.showSaveFilePicker) {
    const handle = await window.showSaveFilePicker({
      suggestedName: `${fileName}.csv`,
      types: [
        {
          description,
          accept: { "text/csv": [".csv"] },
        },
      ],
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
  } else {
    // Fallback for browsers without File System API
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "neurons.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
