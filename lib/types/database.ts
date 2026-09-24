export type AppointmentStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";

export type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
};

export type Staff = {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Appointment = {
  id: string;
  customer_id: string;
  service_id: string;
  staff_id: string | null;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AppointmentWithRelations = Appointment & {
  customer: Customer;
  service: Service;
  staff: Staff | null;
};

export type BusinessHour = {
  id: string;
  day_of_week: number; // 0 (domingo) .. 6 (sábado)
  opening_time: string;
  closing_time: string;
};

export type BlockedSlot = {
  id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  created_at: string;
};

export type AvailableSlot = {
  slot_start: string;
  slot_end: string;
};

export type Database = {
  public: {
    Tables: {
      services: {
        Row: Service;
        Insert: Partial<Service> & Pick<Service, "name" | "price" | "duration_minutes">;
        Update: Partial<Service>;
        Relationships: [];
      };
      customers: {
        Row: Customer;
        Insert: Partial<Customer> & Pick<Customer, "name" | "email" | "phone">;
        Update: Partial<Customer>;
        Relationships: [];
      };
      appointments: {
        Row: Appointment;
        Insert: Partial<Appointment> &
          Pick<Appointment, "customer_id" | "service_id" | "date" | "start_time" | "end_time">;
        Update: Partial<Appointment>;
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id"];
          },
        ];
      };
      staff: {
        Row: Staff;
        Insert: Partial<Staff> & Pick<Staff, "name">;
        Update: Partial<Staff>;
        Relationships: [];
      };
      business_hours: {
        Row: BusinessHour;
        Insert: Partial<BusinessHour> &
          Pick<BusinessHour, "day_of_week" | "opening_time" | "closing_time">;
        Update: Partial<BusinessHour>;
        Relationships: [];
      };
      blocked_slots: {
        Row: BlockedSlot;
        Insert: Partial<BlockedSlot> & Pick<BlockedSlot, "date">;
        Update: Partial<BlockedSlot>;
        Relationships: [];
      };
      admins: {
        Row: { id: string; created_at: string };
        Insert: { id: string; created_at?: string };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_available_slots: {
        Args: { p_service_id: string; p_date: string };
        Returns: AvailableSlot[];
      };
      create_appointment: {
        Args: {
          p_service_id: string;
          p_date: string;
          p_start_time: string;
          p_customer_name: string;
          p_customer_email: string;
          p_customer_phone: string;
          p_notes?: string | null;
        };
        Returns: { appointment_id: string; status: AppointmentStatus }[];
      };
      get_appointment_for_cancellation: {
        Args: { p_appointment_id: string };
        Returns: {
          service_name: string;
          date: string;
          start_time: string;
          status: AppointmentStatus;
        }[];
      };
      cancel_appointment: {
        Args: { p_appointment_id: string };
        Returns: void;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
};
