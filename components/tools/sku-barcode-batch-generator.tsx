"use client";

import { useId, useState } from "react";
import JsBarcode from "jsbarcode";
import Papa from "papaparse";
import QRCode from "qrcode";
import { Download, FileSpreadsheet, FileWarning, Info, PackageCheck, Printer, QrCode, ScanLine, Settings2, UploadCloud } from "lucide-react";

import { BarcodeLabelCard } from "@/components/tools/barcode-label-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { IconTile } from "@/components/ui/icon-tile";
import { Input } from "@/components/ui/input";
import {
  barcodeTypeOptions,
  buildLabelSheetHtml,
  defaultLabelSettings,
  expectedCsvColumns,
  getBarcodeTypeLabel,
  getLabelPreset,
  labelPresetOptions,
  normalizeBarcodeType,
  parseCsvRow,
  parsePositiveInteger,
  sampleBarcodeCsv,
  validateBarcodeValue,
  type BarcodeDraft,
  type BarcodeLabel,
  type CsvRowWarning,
  type LabelSettings,
  type SupportedBarcodeType,
} from "@/lib/barcode";
import { cn } from "@/lib/utils";

type GeneratorTab = "manual" | "csv";

type ManualFormState = {
  itemName: string;
  sku: string;
  barcodeValue: string;
  barcodeType: SupportedBarcodeType;
  quantity: string;
};

const initialManualForm: ManualFormState = {
  itemName: "",
  sku: "",
  barcodeValue: "",
  barcodeType: "code128",
  quantity: "1",
};

const barcodeFormatMap: Record<Exclude<SupportedBarcodeType, "qrcode">, string> = {
  code128: "CODE128",
  ean13: "EAN13",
  upca: "UPC",
};

async function createBarcodeMarkup(type: SupportedBarcodeType, value: string) {
  if (type === "qrcode") {
    return QRCode.toString(value, {
      type: "svg",
      margin: 1,
      width: 160,
      errorCorrectionLevel: "M",
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });
  }

  const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  JsBarcode(svgNode, value, {
    background: "transparent",
    displayValue: false,
    format: barcodeFormatMap[type],
    height: type === "code128" ? 54 : 58,
    lineColor: "#0f172a",
    margin: 0,
    width: type === "code128" ? 1.8 : 1.9,
  });
  svgNode.setAttribute("width", "100%");
  svgNode.setAttribute("preserveAspectRatio", "xMidYMid meet");

  return svgNode.outerHTML;
}

async function buildLabels(drafts: BarcodeDraft[]) {
  const expandedDrafts = drafts.flatMap((draft) =>
    Array.from({ length: draft.quantity }, () => ({
      ...draft,
    })),
  );
  const seed = `${Date.now()}`;

  return Promise.all(
    expandedDrafts.map(async (draft, index) => ({
      ...draft,
      id: `${seed}-${index}-${draft.sku || draft.barcodeValue}`,
      labelIndex: index + 1,
      svgMarkup: await createBarcodeMarkup(draft.barcodeType, draft.barcodeValue),
    })),
  );
}

function downloadFile(filename: string, contents: string, mimeType: string) {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function SkuBarcodeBatchGenerator() {
  const fileInputId = useId();
  const sampleCsvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(sampleBarcodeCsv)}`;

  const [activeTab, setActiveTab] = useState<GeneratorTab>("manual");
  const [manualForm, setManualForm] = useState<ManualFormState>(initialManualForm);
  const [manualErrors, setManualErrors] = useState<Partial<Record<keyof ManualFormState, string>>>({});
  const [labelSettings, setLabelSettings] = useState<LabelSettings>(defaultLabelSettings);
  const [generatedLabels, setGeneratedLabels] = useState<BarcodeLabel[]>([]);
  const [csvWarnings, setCsvWarnings] = useState<CsvRowWarning[]>([]);
  const [csvSummary, setCsvSummary] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [generatorError, setGeneratorError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [lastGeneratedTitle, setLastGeneratedTitle] = useState("SKU Barcode Labels");

  function updateManualField<K extends keyof ManualFormState>(field: K, value: ManualFormState[K]) {
    setManualForm((current) => ({ ...current, [field]: value }));
    setManualErrors((current) => ({ ...current, [field]: undefined }));
    setGeneratorError(null);
  }

  function validateManualForm() {
    const nextErrors: Partial<Record<keyof ManualFormState, string>> = {};
    const quantity = parsePositiveInteger(manualForm.quantity);

    if (!manualForm.sku.trim()) {
      nextErrors.sku = "Enter a SKU or label text.";
    }

    const barcodeValueError = validateBarcodeValue(manualForm.barcodeType, manualForm.barcodeValue);
    if (barcodeValueError) {
      nextErrors.barcodeValue = barcodeValueError;
    }

    if (quantity === null) {
      nextErrors.quantity = "Quantity must be a positive whole number.";
    }

    let draft: BarcodeDraft | undefined;

    if (Object.keys(nextErrors).length === 0 && quantity !== null) {
      draft = {
        itemName: manualForm.itemName.trim(),
        sku: manualForm.sku.trim(),
        barcodeValue: manualForm.barcodeValue.trim(),
        barcodeType: manualForm.barcodeType,
        quantity,
        source: "manual",
      };
    }

    return {
      nextErrors,
      draft,
    };
  }

  async function applyDrafts(drafts: BarcodeDraft[], summary: string, title: string) {
    setIsGenerating(true);
    setGeneratorError(null);

    try {
      const labels = await buildLabels(drafts);
      setGeneratedLabels(labels);
      setLastGeneratedTitle(title);
      setCsvSummary(summary);
    } catch {
      setGeneratorError("The labels could not be generated. Please review the values and try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleManualSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { nextErrors, draft } = validateManualForm();

    if (!draft) {
      setManualErrors(nextErrors);
      setGeneratedLabels([]);
      return;
    }

    setManualErrors({});
    setCsvWarnings([]);
    setFileError(null);
    await applyDrafts([draft], `${draft.quantity} label${draft.quantity === 1 ? "" : "s"} generated from manual entry.`, `${draft.sku} label sheet`);
  }

  async function processCsvFile(file: File) {
    setIsGenerating(true);
    setActiveTab("csv");
    setFileError(null);
    setGeneratorError(null);
    setCsvWarnings([]);

    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: async (results) => {
        const fields = (results.meta.fields ?? []).map((field) => field.trim());
        const missingColumns = expectedCsvColumns.filter((column) => !fields.includes(column));

        if (missingColumns.length > 0) {
          setFileError(`Missing required columns: ${missingColumns.join(", ")}. Use the sample template to match the expected structure.`);
          setIsGenerating(false);
          return;
        }

        const validDrafts: BarcodeDraft[] = [];
        const nextWarnings: CsvRowWarning[] = [];

        results.data.forEach((row, index) => {
          const { draft, warning } = parseCsvRow(row, index + 2);
          if (draft) {
            validDrafts.push(draft);
          } else if (warning) {
            nextWarnings.push(warning);
          }
        });

        setCsvWarnings(nextWarnings);

        if (!validDrafts.length) {
          setFileError(nextWarnings.length ? "No valid rows were found in the uploaded CSV file." : "The uploaded CSV file did not contain any rows.");
          setGeneratedLabels([]);
          setCsvSummary(null);
          setIsGenerating(false);
          return;
        }

        await applyDrafts(
          validDrafts,
          `${validDrafts.reduce((total, draft) => total + draft.quantity, 0)} label${
            validDrafts.reduce((total, draft) => total + draft.quantity, 0) === 1 ? "" : "s"
          } generated from ${validDrafts.length} valid CSV row${validDrafts.length === 1 ? "" : "s"}.${
            nextWarnings.length ? ` ${nextWarnings.length} row${nextWarnings.length === 1 ? " needs" : "s need"} attention.` : ""
          }`,
          `${file.name.replace(/\.csv$/i, "") || "barcode"} label sheet`,
        );
      },
      error: () => {
        setFileError("The CSV file could not be read. Please try a clean CSV file with the expected columns.");
        setIsGenerating(false);
      },
    });
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    void processCsvFile(file);
    event.target.value = "";
  }

  function handleFileDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) {
      return;
    }
    void processCsvFile(file);
  }

  function handlePrint() {
    if (!generatedLabels.length) {
      return;
    }

    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1200,height=900");
    if (!printWindow) {
      setGeneratorError("A print window could not be opened. Please allow pop-ups and try again.");
      return;
    }

    const documentTitle = `${lastGeneratedTitle} | Ops Toolkit`;
    printWindow.document.open();
    printWindow.document.write(buildLabelSheetHtml(generatedLabels, labelSettings, documentTitle));
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => {
      printWindow.print();
    }, 350);
  }

  function handleDownloadSheet() {
    if (!generatedLabels.length) {
      return;
    }

    const filename = `${lastGeneratedTitle.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "barcode-labels"}.html`;
    downloadFile(filename, buildLabelSheetHtml(generatedLabels, labelSettings, lastGeneratedTitle), "text/html;charset=utf-8");
  }

  function clearResults() {
    setGeneratedLabels([]);
    setCsvWarnings([]);
    setCsvSummary(null);
    setFileError(null);
    setGeneratorError(null);
  }

  const activePreset = getLabelPreset(labelSettings.preset);

  return (
    <div className="space-y-8">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_360px]">
        <Card className="print:hidden">
          <CardHeader className="border-b border-slate-100 pb-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <IconTile icon={ScanLine} tone="purple" size="lg" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Generator workspace</p>
                    <CardTitle className="text-[1.85rem] leading-tight">Create barcode labels without spreadsheet gymnastics</CardTitle>
                  </div>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-slate-600">
                  Generate barcode labels for products, SKUs, and internal inventory quickly. Switch between manual entry and CSV upload without leaving the same clean workflow.
                </p>
              </div>
              <div className="inline-flex rounded-[1.15rem] border border-slate-200 bg-slate-50/90 p-1.5 shadow-sm">
                {[
                  { id: "manual", label: "Manual Entry" },
                  { id: "csv", label: "CSV Batch Upload" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as GeneratorTab)}
                    className={cn(
                      "rounded-[0.95rem] px-4 py-2.5 text-sm font-semibold transition",
                      activeTab === tab.id ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:text-slate-900",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-7">
            {activeTab === "manual" ? (
              <form className="space-y-6" onSubmit={handleManualSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField label="Item name" htmlFor="itemName" hint="Optional display name for the label.">
                    <Input
                      id="itemName"
                      value={manualForm.itemName}
                      onChange={(event) => updateManualField("itemName", event.target.value)}
                      placeholder="e.g. Small Widget"
                    />
                  </FormField>
                  <FormField label="SKU / label text" htmlFor="sku" hint="Shown on the printed label." error={manualErrors.sku}>
                    <Input
                      id="sku"
                      value={manualForm.sku}
                      onChange={(event) => updateManualField("sku", event.target.value)}
                      placeholder="e.g. SKU-001"
                    />
                  </FormField>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField label="Barcode value" htmlFor="barcodeValue" hint="This is the value encoded into the barcode." error={manualErrors.barcodeValue}>
                    <Input
                      id="barcodeValue"
                      value={manualForm.barcodeValue}
                      onChange={(event) => updateManualField("barcodeValue", event.target.value)}
                      placeholder="e.g. 1234567890123"
                    />
                  </FormField>
                  <FormField label="Barcode type" htmlFor="barcodeType" hint="Choose the barcode symbology to generate.">
                    <select
                      id="barcodeType"
                      className="flex h-12 w-full rounded-[1.15rem] border border-slate-200/80 bg-white/95 px-4 py-3 text-sm text-slate-950 shadow-sm transition-all duration-200 focus-visible:border-sky-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
                      value={manualForm.barcodeType}
                      onChange={(event) => updateManualField("barcodeType", event.target.value as SupportedBarcodeType)}
                    >
                      {barcodeTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
                <div className="grid gap-5 md:grid-cols-[minmax(0,220px)_1fr] md:items-end">
                  <FormField label="Quantity of labels" htmlFor="quantity" hint="Generate one or more identical labels." error={manualErrors.quantity}>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      step="1"
                      value={manualForm.quantity}
                      onChange={(event) => updateManualField("quantity", event.target.value)}
                      placeholder="e.g. 6"
                    />
                  </FormField>
                  <div className="rounded-[1.3rem] border border-slate-100 bg-slate-50/80 p-4 text-sm leading-6 text-slate-600">
                    <p className="font-semibold text-slate-900">Selected type: {getBarcodeTypeLabel(manualForm.barcodeType)}</p>
                    <p className="mt-1">
                      {barcodeTypeOptions.find((option) => option.value === manualForm.barcodeType)?.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Button type="submit" size="lg" disabled={isGenerating}>
                    {isGenerating ? "Generating labels..." : "Generate labels"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      setManualForm(initialManualForm);
                      setManualErrors({});
                    }}
                  >
                    Reset fields
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Upload a CSV batch and generate all valid labels at once</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Required columns: {expectedCsvColumns.join(", ")}. Barcode types can be written as Code128, EAN-13, UPC-A, or QR Code.
                    </p>
                  </div>
                  <Button asChild variant="secondary">
                    <a download="ops-toolkit-barcode-sample.csv" href={sampleCsvHref}>
                      <Download className="h-4 w-4" />
                      Download sample CSV
                    </a>
                  </Button>
                </div>
                <label
                  htmlFor={fileInputId}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleFileDrop}
                  className={cn(
                    "flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[1.6rem] border border-dashed px-6 py-8 text-center transition",
                    isDragOver ? "border-sky-300 bg-sky-50/80" : "border-slate-200 bg-slate-50/70 hover:border-sky-200 hover:bg-white",
                  )}
                >
                  <input id={fileInputId} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileSelect} />
                  <IconTile icon={UploadCloud} tone="blue" size="lg" />
                  <p className="mt-5 font-display text-2xl font-semibold text-slate-950">Drop a CSV here or choose a file</p>
                  <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">
                    Generate barcode labels in batches from operational spreadsheets or exports. The generator will keep valid rows and show clear warnings for rows that need attention.
                  </p>
                  <span className="mt-5 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                    Choose CSV file
                  </span>
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-slate-100 bg-slate-50/80 p-4 text-sm leading-6 text-slate-600">
                    <p className="font-semibold text-slate-900">Expected columns</p>
                    <p className="mt-2">item_name, sku, barcode_value, barcode_type, quantity</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-100 bg-slate-50/80 p-4 text-sm leading-6 text-slate-600">
                    <p className="font-semibold text-slate-900">Row validation</p>
                    <p className="mt-2">EAN-13 must be 13 digits, UPC-A must be 12 digits, quantity must be a positive integer.</p>
                  </div>
                </div>
                {fileError ? (
                  <div className="rounded-[1.35rem] border border-rose-200 bg-rose-50/80 p-4 text-sm leading-6 text-rose-700">
                    <div className="flex items-start gap-3">
                      <FileWarning className="mt-0.5 h-5 w-5 shrink-0" />
                      <p>{fileError}</p>
                    </div>
                  </div>
                ) : null}
                {csvWarnings.length ? (
                  <div className="rounded-[1.45rem] border border-amber-200 bg-amber-50/80 p-5">
                    <div className="flex items-center gap-3">
                      <IconTile icon={FileSpreadsheet} tone="amber" size="sm" />
                      <div>
                        <p className="font-semibold text-amber-900">Rows that need attention</p>
                        <p className="text-sm text-amber-800">Valid rows can still be generated while these rows are skipped.</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {csvWarnings.map((warning) => (
                        <div key={`${warning.rowNumber}-${warning.sku ?? warning.itemName ?? warning.message}`} className="rounded-[1rem] border border-white/80 bg-white/90 px-4 py-3 text-sm leading-6 text-slate-700">
                          <p className="font-semibold text-slate-900">Row {warning.rowNumber}</p>
                          <p>{warning.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="print:hidden">
          <CardHeader className="border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <IconTile icon={Settings2} tone="purple" size="lg" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Display settings</p>
                <CardTitle className="text-2xl">Adjust the label layout</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">Label size preset</p>
              <div className="space-y-3">
                {labelPresetOptions.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setLabelSettings((current) => ({ ...current, preset: preset.value }))}
                    className={cn(
                      "w-full rounded-[1.2rem] border px-4 py-4 text-left transition",
                      labelSettings.preset === preset.value
                        ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">{preset.label}</p>
                        <p className={cn("mt-1 text-sm leading-6", labelSettings.preset === preset.value ? "text-white/80" : "text-slate-600")}>{preset.description}</p>
                      </div>
                      {labelSettings.preset === preset.value ? <PackageCheck className="h-5 w-5" /> : null}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">Show on label</p>
              <div className="grid gap-3">
                {[
                  { key: "showItemName", label: "Item name" },
                  { key: "showSku", label: "SKU / label text" },
                  { key: "showBarcodeValue", label: "Barcode value" },
                ].map((option) => (
                  <label key={option.key} className="flex items-center justify-between gap-4 rounded-[1.15rem] border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700">
                    <span>{option.label}</span>
                    <input
                      type="checkbox"
                      checked={labelSettings[option.key as keyof LabelSettings] as boolean}
                      onChange={(event) =>
                        setLabelSettings((current) => ({
                          ...current,
                          [option.key]: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-sky-300"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="rounded-[1.25rem] border border-slate-100 bg-slate-50/80 p-4 text-sm leading-6 text-slate-600">
              <p className="font-semibold text-slate-900">Active preview preset</p>
              <p className="mt-2">{activePreset.label}: {activePreset.description}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card id="barcode-results">
        <CardHeader className="border-b border-slate-100 pb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <IconTile icon={QrCode} tone="green" size="lg" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Results and preview</p>
                  <CardTitle className="text-[1.85rem] leading-tight">Review barcode labels before printing</CardTitle>
                </div>
              </div>
              <p className="max-w-3xl text-sm leading-7 text-slate-600">
                Preview the generated labels, confirm the displayed text, and then print or download the sheet in a clean format for operational use.
              </p>
              {csvSummary ? <p className="text-sm font-medium text-slate-700">{csvSummary}</p> : null}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap print:hidden">
              <Button type="button" variant="secondary" onClick={handlePrint} disabled={!generatedLabels.length}>
                <Printer className="h-4 w-4" />
                Print labels
              </Button>
              <Button type="button" variant="secondary" onClick={handleDownloadSheet} disabled={!generatedLabels.length}>
                <Download className="h-4 w-4" />
                Download sheet
              </Button>
              <Button type="button" variant="outline" onClick={clearResults} disabled={!generatedLabels.length}>
                Clear results
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-7">
          {generatorError ? (
            <div className="mb-6 rounded-[1.35rem] border border-rose-200 bg-rose-50/80 p-4 text-sm leading-6 text-rose-700 print:hidden">
              {generatorError}
            </div>
          ) : null}
          {generatedLabels.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 print:grid-cols-2">
              {generatedLabels.map((label) => (
                <BarcodeLabelCard key={label.id} label={label} settings={labelSettings} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[1.7rem] border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
              <IconTile icon={Info} tone="blue" size="lg" />
              <p className="mt-5 font-display text-3xl font-semibold text-slate-950">No labels generated yet</p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Use manual entry for quick one-off labels or upload a CSV batch to generate printable barcode cards for products, bins, shelves, or internal inventory.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  "Manual one-off labels",
                  "CSV batch generation",
                  "Printable and downloadable sheet",
                ].map((item) => (
                  <div key={item} className="rounded-[1rem] border border-slate-100 bg-white/90 px-4 py-3 text-sm font-medium text-slate-600 shadow-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}