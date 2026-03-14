import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getBarcodeTypeLabel, getLabelPreset, type BarcodeLabel, type LabelSettings } from "@/lib/barcode";
import { cn } from "@/lib/utils";

type BarcodeLabelCardProps = {
  label: BarcodeLabel;
  settings: LabelSettings;
};

export function BarcodeLabelCard({ label, settings }: BarcodeLabelCardProps) {
  const preset = getLabelPreset(settings.preset);

  return (
    <Card className="label-card-preview h-full border-white/90 bg-white/94 shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-soft">
      <CardContent className={cn("flex h-full flex-col gap-4 pt-6", preset.previewMinHeight)}>
        <div className="flex items-center justify-between gap-3">
          <Badge variant="purple">{getBarcodeTypeLabel(label.barcodeType)}</Badge>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Label {label.labelIndex}
          </span>
        </div>
        <div className="space-y-1.5">
          {settings.showItemName && label.itemName ? (
            <p className="line-clamp-2 font-display text-lg font-semibold tracking-tight text-slate-950">
              {label.itemName}
            </p>
          ) : null}
          {settings.showSku && label.sku ? <p className="text-sm font-medium text-slate-500">{label.sku}</p> : null}
        </div>
        <div className={cn("flex items-center justify-center rounded-[1.2rem] border border-slate-100 bg-slate-50/75 px-3 py-4", preset.graphicMinHeight)}>
          <div
            className="w-full [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
            dangerouslySetInnerHTML={{ __html: label.svgMarkup }}
          />
        </div>
        {settings.showBarcodeValue ? (
          <div className="rounded-[1rem] border border-slate-100 bg-white/90 px-3 py-2 text-center text-xs font-medium text-slate-600 break-all">
            {label.barcodeValue}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}