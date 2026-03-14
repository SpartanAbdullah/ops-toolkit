export type SupportedBarcodeType = "code128" | "ean13" | "upca" | "qrcode";
export type LabelSizePreset = "compact" | "standard" | "wide";

export type LabelSettings = {
  preset: LabelSizePreset;
  showItemName: boolean;
  showSku: boolean;
  showBarcodeValue: boolean;
};

export type BarcodeDraft = {
  itemName: string;
  sku: string;
  barcodeValue: string;
  barcodeType: SupportedBarcodeType;
  quantity: number;
  source: "manual" | "csv";
  rowNumber?: number;
};

export type BarcodeLabel = BarcodeDraft & {
  id: string;
  labelIndex: number;
  svgMarkup: string;
};

export type CsvRowWarning = {
  rowNumber: number;
  message: string;
  sku?: string;
  itemName?: string;
};

export const expectedCsvColumns = [
  "item_name",
  "sku",
  "barcode_value",
  "barcode_type",
  "quantity",
] as const;

export const barcodeTypeOptions: Array<{
  value: SupportedBarcodeType;
  label: string;
  description: string;
}> = [
  {
    value: "code128",
    label: "Code128",
    description: "Flexible internal barcode for SKUs, bins, and warehouse labels.",
  },
  {
    value: "ean13",
    label: "EAN-13",
    description: "Retail-focused 13-digit barcode commonly used for packaged products.",
  },
  {
    value: "upca",
    label: "UPC-A",
    description: "12-digit product barcode commonly used in retail and ecommerce.",
  },
  {
    value: "qrcode",
    label: "QR Code",
    description: "Flexible 2D code for URLs, internal references, and richer text values.",
  },
];

export const labelPresetOptions: Array<{
  value: LabelSizePreset;
  label: string;
  description: string;
  previewMinHeight: string;
  graphicMinHeight: string;
  printWidthMm: number;
  printHeightMm: number;
}> = [
  {
    value: "compact",
    label: "Compact",
    description: "Best for shelf, bin, and small internal labels.",
    previewMinHeight: "min-h-[180px]",
    graphicMinHeight: "min-h-[76px]",
    printWidthMm: 48,
    printHeightMm: 30,
  },
  {
    value: "standard",
    label: "Standard",
    description: "Balanced size for most stock, retail, and ops workflows.",
    previewMinHeight: "min-h-[208px]",
    graphicMinHeight: "min-h-[88px]",
    printWidthMm: 62,
    printHeightMm: 38,
  },
  {
    value: "wide",
    label: "Wide",
    description: "More breathing room for product names and scannability.",
    previewMinHeight: "min-h-[232px]",
    graphicMinHeight: "min-h-[104px]",
    printWidthMm: 80,
    printHeightMm: 48,
  },
];

export const defaultLabelSettings: LabelSettings = {
  preset: "standard",
  showItemName: true,
  showSku: true,
  showBarcodeValue: true,
};

export const sampleBarcodeCsv = [
  "item_name,sku,barcode_value,barcode_type,quantity",
  "Sample Product,SKU-001,SKU-001,Code128,3",
  "Retail Item,1234567890123,1234567890123,EAN-13,2",
  "Store Item,012345678905,012345678905,UPC-A,2",
  "Landing Page QR,QR-LINK,https://example.com/product/sku-001,QR Code,1",
].join("\n");

export function getBarcodeTypeLabel(type: SupportedBarcodeType) {
  return barcodeTypeOptions.find((option) => option.value === type)?.label ?? type;
}

export function getLabelPreset(value: LabelSizePreset) {
  return labelPresetOptions.find((option) => option.value === value) ?? labelPresetOptions[1];
}

export function normalizeBarcodeType(value: string): SupportedBarcodeType | null {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");

  switch (normalized) {
    case "code128":
      return "code128";
    case "ean13":
      return "ean13";
    case "upca":
    case "upc":
      return "upca";
    case "qrcode":
    case "qr":
      return "qrcode";
    default:
      return null;
  }
}

export function validateBarcodeValue(type: SupportedBarcodeType, value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "Barcode value is required.";
  }

  if (type === "ean13" && !/^\d{13}$/.test(trimmedValue)) {
    return "EAN-13 values must be exactly 13 digits.";
  }

  if (type === "upca" && !/^\d{12}$/.test(trimmedValue)) {
    return "UPC-A values must be exactly 12 digits.";
  }

  return null;
}

export function parsePositiveInteger(value: string | number) {
  const parsedValue = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
}

export function parseCsvRow(
  row: Record<string, unknown>,
  rowNumber: number,
): { draft?: BarcodeDraft; warning?: CsvRowWarning } {
  const itemName = String(row.item_name ?? "").trim();
  const sku = String(row.sku ?? "").trim();
  const barcodeValue = String(row.barcode_value ?? "").trim();
  const rawBarcodeType = String(row.barcode_type ?? "").trim();
  const quantity = parsePositiveInteger(String(row.quantity ?? "").trim());
  const barcodeType = normalizeBarcodeType(rawBarcodeType);
  const issues: string[] = [];

  if (!sku) {
    issues.push("sku is required");
  }

  if (!barcodeType) {
    issues.push("barcode_type must be Code128, EAN-13, UPC-A, or QR Code");
  }

  if (!barcodeValue) {
    issues.push("barcode_value is required");
  } else if (barcodeType) {
    const barcodeValueError = validateBarcodeValue(barcodeType, barcodeValue);
    if (barcodeValueError) {
      issues.push(barcodeValueError);
    }
  }

  if (quantity === null) {
    issues.push("quantity must be a positive integer");
  }

  if (issues.length) {
    return {
      warning: {
        rowNumber,
        message: issues.join(". "),
        itemName,
        sku,
      },
    };
  }

  if (barcodeType === null || quantity === null) {
    return {
      warning: {
        rowNumber,
        message: "The row could not be converted into a valid barcode draft.",
        itemName,
        sku,
      },
    };
  }

  return {
    draft: {
      itemName,
      sku,
      barcodeValue,
      barcodeType,
      quantity,
      source: "csv",
      rowNumber,
    },
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildLabelSheetHtml(labels: BarcodeLabel[], settings: LabelSettings, documentTitle: string) {
  const preset = getLabelPreset(settings.preset);
  const cardsMarkup = labels
    .map((label) => {
      const itemNameMarkup = settings.showItemName && label.itemName
        ? `<div class="item-name">${escapeHtml(label.itemName)}</div>`
        : "";
      const skuMarkup = settings.showSku && label.sku
        ? `<div class="sku">${escapeHtml(label.sku)}</div>`
        : "";
      const valueMarkup = settings.showBarcodeValue
        ? `<div class="barcode-value">${escapeHtml(label.barcodeValue)}</div>`
        : "";

      return `
        <article class="label-card">
          <div class="label-meta">
            ${itemNameMarkup}
            ${skuMarkup}
          </div>
          <div class="barcode-wrap">${label.svgMarkup}</div>
          ${valueMarkup}
          <div class="label-footer">
            <span>${escapeHtml(getBarcodeTypeLabel(label.barcodeType))}</span>
            <span>Label ${label.labelIndex}</span>
          </div>
        </article>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(documentTitle)}</title>
        <style>
          :root {
            color-scheme: light;
            font-family: Arial, sans-serif;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 24px;
            background: #ffffff;
            color: #0f172a;
          }

          .sheet-header {
            margin-bottom: 18px;
          }

          .sheet-title {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
          }

          .sheet-subtitle {
            margin: 6px 0 0;
            font-size: 12px;
            color: #475569;
          }

          .label-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(${preset.printWidthMm}mm, 1fr));
            gap: 10px;
          }

          .label-card {
            min-height: ${preset.printHeightMm}mm;
            border: 1px solid #dbe4ee;
            border-radius: 12px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            break-inside: avoid;
          }

          .item-name {
            font-size: 12px;
            font-weight: 700;
            line-height: 1.3;
            margin-bottom: 4px;
          }

          .sku {
            font-size: 11px;
            font-weight: 600;
            line-height: 1.35;
            color: #475569;
            margin-bottom: 6px;
          }

          .barcode-wrap {
            display: flex;
            min-height: 24mm;
            align-items: center;
            justify-content: center;
            margin: 4px 0;
          }

          .barcode-wrap svg {
            width: 100%;
            height: auto;
          }

          .barcode-value {
            margin-top: 6px;
            font-size: 11px;
            text-align: center;
            color: #475569;
            word-break: break-word;
          }

          .label-footer {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            margin-top: 8px;
            font-size: 10px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }

          @page {
            margin: 10mm;
          }

          @media print {
            body {
              padding: 0;
            }

            .sheet-header {
              margin-bottom: 10px;
            }
          }
        </style>
      </head>
      <body>
        <header class="sheet-header">
          <h1 class="sheet-title">${escapeHtml(documentTitle)}</h1>
          <p class="sheet-subtitle">Generated from Ops Toolkit</p>
        </header>
        <section class="label-grid">${cardsMarkup}</section>
      </body>
    </html>
  `;
}
