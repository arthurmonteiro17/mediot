"use client";

import { MediotProvider } from "@/lib/store";
import { AppShell } from "@/components/app-shell";
import type { HospitalInfo, Movement, Product, Staff } from "@/lib/types";

export type BootstrapPayload = {
  hospital: HospitalInfo;
  staff: Staff[];
  products: Product[];
  movements: Movement[];
};

export function Providers({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: BootstrapPayload | null;
}) {
  return (
    <MediotProvider initialData={initialData}>
      <AppShell>{children}</AppShell>
    </MediotProvider>
  );
}
