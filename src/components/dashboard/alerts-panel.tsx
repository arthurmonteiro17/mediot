import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateTime } from "@/lib/analytics";
import type { Alert } from "@/lib/types";
import { Bell, CircleAlert, Info, TriangleAlert } from "lucide-react";

function severityMeta(severity: Alert["severity"]) {
  switch (severity) {
    case "critical":
      return {
        label: "Crítico",
        className: "border-orange-200 bg-orange-50 text-orange-900",
        icon: CircleAlert,
      };
    case "warning":
      return {
        label: "Atenção",
        className: "border-amber-200 bg-amber-50 text-amber-900",
        icon: TriangleAlert,
      };
    default:
      return {
        label: "Info",
        className: "border-sky-200 bg-sky-50 text-sky-900",
        icon: Info,
      };
  }
}

export function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  return (
    <Card className="border-slate-200/80 bg-white/85 shadow-none backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-teal-700" />
          <CardTitle className="text-base font-semibold">Central de alertas</CardTitle>
        </div>
        <Badge variant="secondary" className="font-normal">
          {alerts.length} ativos
        </Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[320px] pr-3">
          <ul className="space-y-3">
            {alerts.map((alert) => {
              const meta = severityMeta(alert.severity);
              const Icon = meta.icon;
              return (
                <li
                  key={alert.id}
                  className={`rounded-xl border p-3.5 ${meta.className}`}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 font-medium">
                      <Icon className="size-4 shrink-0" />
                      <span>{alert.title}</span>
                    </div>
                    <span className="shrink-0 text-xs opacity-70">
                      {formatDateTime(alert.timestamp)}
                    </span>
                  </div>
                  <p className="pl-6 text-sm opacity-90">{alert.detail}</p>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
