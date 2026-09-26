"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  CreateProductInput,
  HospitalInfo,
  Movement,
  Product,
  RegisterMovementInput,
  Staff,
} from "@/lib/types";
import type { BootstrapPayload } from "@/components/providers";

/** Intervalo de atualização automática do estoque/movimentações (ms). */
const BOOTSTRAP_POLL_MS = 1000;

type MediotStore = {
  ready: boolean;
  loading: boolean;
  error: string | null;
  hospital: HospitalInfo;
  staff: Staff[];
  products: Product[];
  movements: Movement[];
  refresh: () => Promise<void>;
  registerMovement: (
    input: RegisterMovementInput,
  ) => Promise<{ ok: true; movement: Movement } | { ok: false; error: string }>;
  createProduct: (
    input: CreateProductInput,
  ) => Promise<{ ok: true; product: Product } | { ok: false; error: string }>;
};

const fallbackHospital: HospitalInfo = {
  name: "Hospital São Lucas",
  sector: "Almoxarifado Central",
  lastSync: new Date().toISOString(),
};

const MediotContext = createContext<MediotStore | null>(null);

async function fetchBootstrap() {
  const response = await fetch("/api/bootstrap", { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Não foi possível carregar o sistema.");
  }
  return data as BootstrapPayload;
}

export function MediotProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: BootstrapPayload | null;
}) {
  const [ready, setReady] = useState(Boolean(initialData));
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(
    initialData ? null : "Não foi possível carregar o banco na inicialização.",
  );
  const [hospital, setHospital] = useState<HospitalInfo>(
    initialData?.hospital ?? fallbackHospital,
  );
  const [staff, setStaff] = useState<Staff[]>(initialData?.staff ?? []);
  const [products, setProducts] = useState<Product[]>(
    initialData?.products ?? [],
  );
  const [movements, setMovements] = useState<Movement[]>(
    initialData?.movements ?? [],
  );
  /** Evita sobrepor requisições de bootstrap (poll + refresh manual). */
  const bootstrapInFlightRef = useRef(false);

  const applyBootstrap = useCallback((data: BootstrapPayload) => {
    setHospital(data.hospital);
    setStaff(data.staff);
    setProducts(data.products);
    setMovements(data.movements);
    setError(null);
    setReady(true);
  }, []);

  const refresh = useCallback(async () => {
    if (bootstrapInFlightRef.current) return;
    bootstrapInFlightRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBootstrap();
      applyBootstrap(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Falha ao carregar dados do banco.",
      );
    } finally {
      setLoading(false);
      bootstrapInFlightRef.current = false;
    }
  }, [applyBootstrap]);

  // Atualiza estoque, movimentações e empréstimos a cada 1s sem reload da página.
  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      if (cancelled || bootstrapInFlightRef.current) return;
      bootstrapInFlightRef.current = true;
      try {
        const data = await fetchBootstrap();
        if (!cancelled) applyBootstrap(data);
      } catch {
        // Mantém a última UI boa em falhas transitórias de rede.
      } finally {
        bootstrapInFlightRef.current = false;
      }
    };

    const id = window.setInterval(() => {
      void poll();
    }, BOOTSTRAP_POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [applyBootstrap]);

  const createProduct = useCallback(async (input: CreateProductInput) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await response.json();
      if (!response.ok) {
        return { ok: false as const, error: data.error ?? "Erro ao cadastrar." };
      }

      setProducts((current) =>
        [...current, data.product].sort((a, b) => a.name.localeCompare(b.name)),
      );
      if (data.lastSync) {
        setHospital((current) => ({ ...current, lastSync: data.lastSync }));
      }
      return { ok: true as const, product: data.product as Product };
    } catch {
      return {
        ok: false as const,
        error: "Falha de rede ao cadastrar o produto.",
      };
    }
  }, []);

  const registerMovement = useCallback(async (input: RegisterMovementInput) => {
    try {
      const response = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await response.json();
      if (!response.ok) {
        return {
          ok: false as const,
          error: data.error ?? "Erro ao registrar movimentação.",
        };
      }

      setMovements((current) => [data.movement as Movement, ...current]);
      setProducts((current) =>
        current.map((product) =>
          product.id === data.product.id ? (data.product as Product) : product,
        ),
      );
      if (data.lastSync) {
        setHospital((current) => ({ ...current, lastSync: data.lastSync }));
      }
      return { ok: true as const, movement: data.movement as Movement };
    } catch {
      return {
        ok: false as const,
        error: "Falha de rede ao registrar a movimentação.",
      };
    }
  }, []);

  const value = useMemo<MediotStore>(
    () => ({
      ready,
      loading,
      error,
      hospital,
      staff,
      products,
      movements,
      refresh,
      registerMovement,
      createProduct,
    }),
    [
      createProduct,
      error,
      hospital,
      loading,
      movements,
      products,
      ready,
      refresh,
      registerMovement,
      staff,
    ],
  );

  return (
    <MediotContext.Provider value={value}>{children}</MediotContext.Provider>
  );
}

export function useMediot() {
  const ctx = useContext(MediotContext);
  if (!ctx) {
    throw new Error("useMediot deve ser usado dentro de MediotProvider.");
  }
  return ctx;
}

export type { CreateProductInput, RegisterMovementInput };
