/**
 * Ponto único de acesso aos dados. Com NEXT_PUBLIC_DEMO=1 no build, as chamadas vão para
 * o backend de demonstração no navegador (services/demo); sem ela, para a API Spring Boot.
 */
import * as http from "./http";
import { createDemoApi, DEMO_USERS, type DemoApi } from "./demo/api";

export const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";
export { DEMO_USERS };

let instancia: DemoApi | null = null;

function armazenamento(): Storage {
  try {
    const s = window.localStorage;
    s.getItem("teste");
    return s;
  } catch {
    // Navegadores sem localStorage (algumas WebViews): a demo vive só nesta aba.
    const m = new Map<string, string>();
    return {
      get length() { return m.size; },
      clear: () => m.clear(),
      getItem: (k) => m.get(k) ?? null,
      key: (i) => [...m.keys()][i] ?? null,
      removeItem: (k) => void m.delete(k),
      setItem: (k, v) => void m.set(k, String(v)),
    };
  }
}

function demo(): DemoApi {
  instancia ??= createDemoApi({ storage: armazenamento(), now: () => new Date() });
  return instancia;
}

type Http = typeof http;

function escolher<K extends keyof Http>(nome: K): Http[K] {
  return ((...args: unknown[]) =>
    DEMO
      ? (demo()[nome as keyof DemoApi] as (...a: unknown[]) => unknown)(...args)
      : (http[nome] as (...a: unknown[]) => unknown)(...args)) as Http[K];
}

/** Volta a demo aos dados de exemplo. Sem efeito fora do modo demo. */
export function resetDemo() {
  if (DEMO) demo().resetDemo();
}

export const login = escolher("login");
export const logout = escolher("logout");
export const getMe = escolher("getMe");
export const registerCustomer = escolher("registerCustomer");
export const getServices = escolher("getServices");
export const getBarbers = escolher("getBarbers");
export const getCustomers = escolher("getCustomers");
export const getCustomerById = escolher("getCustomerById");
export const getAppointments = escolher("getAppointments");
export const createAppointment = escolher("createAppointment");
export const cancelAppointment = escolher("cancelAppointment");
export const completeAppointment = escolher("completeAppointment");
export const createService = escolher("createService");
export const updateService = escolher("updateService");
export const toggleServiceStatus = escolher("toggleServiceStatus");
export const deleteService = escolher("deleteService");
export const createBarber = escolher("createBarber");
export const updateBarber = escolher("updateBarber");
export const toggleBarberStatus = escolher("toggleBarberStatus");
export const deleteBarber = escolher("deleteBarber");
export const updateCustomer = escolher("updateCustomer");
export const getAdmins = escolher("getAdmins");
export const updateAdmin = escolher("updateAdmin");
export const setupAdmin = escolher("setupAdmin");
export const getBusinessHours = escolher("getBusinessHours");
export const updateBusinessHours = escolher("updateBusinessHours");
