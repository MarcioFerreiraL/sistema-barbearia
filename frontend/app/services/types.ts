/**
 * Formatos devolvidos pela API (espelham os records de resposta do backend Spring Boot).
 * Datas são LocalDateTime sem fuso: "2026-10-21T15:00:00".
 */

export type Role = "CLIENT" | "BARBER" | "ADMIN";
export type AppointmentStatus = "SCHEDULED" | "CONFIRMED" | "RUNNING" | "COMPLETED" | "CANCELLED";

export interface Person {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  active: boolean;
}

export interface ServiceItem {
  id: number;
  name: string;
  description: string;
  price: number;
  durationInMinutes: number;
  active: boolean;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  barberId: string;
  barberName: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
}

export interface BusinessHours {
  dayOfWeek: number; // 1 = segunda … 7 = domingo
  dayName: string;
  open: boolean;
  openTime: string;
  closeTime: string;
}

export interface UserInfo {
  id: string;
  email: string;
  role: Role;
}

export interface PersonRequest {
  fullName: string;
  email: string;
  password?: string;
  phoneNumber: string;
}

export interface AppointmentRequest {
  customerId: string;
  barberId: string;
  serviceItemId: number;
  startTime: string;
}

export interface ServiceRequest {
  name: string;
  description: string;
  price: number;
  durationInMinutes: number;
}
