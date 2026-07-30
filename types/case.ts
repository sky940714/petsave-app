import { CaseStatus } from '../constants/caseStatus';

export interface CasePhoto {
  id: number;
  category: 'scene' | 'processing' | 'triplicate_form';
  url: string;
  uploaded_at: string;
}

export interface Case {
  id: number;
  case_no: string;
  status: CaseStatus;
  reporter_name: string;
  reporter_org: string | null;
  reporter_phone: string;
  report_address: string;
  report_lat: number | null;
  report_lng: number | null;
  territory_id: number | null;
  report_reason: '犬隻' | '貓隻' | '其他動物' | '協尋' | '其他';
  animal_male_count: number;
  animal_female_count: number;
  animal_juvenile_count: number;
  animal_adult_count: number;
  assigned_vehicle_id: number | null;
  assigned_vehicle_no?: string | null;
  assigned_staff_id: number | null;
  assigned_staff_name?: string | null;
  received_at: string;
  dispatched_at: string | null;
  acknowledged_at: string | null;
  arrived_at: string | null;
  closed_at: string | null;
  close_type: 'standard' | 'exception' | null;
  exception_reason_id: number | null;
  resolution_notes: string | null;
  support_requested: boolean;
  checkin_lat: number | null;
  checkin_lng: number | null;
  checkin_address: string | null;
  checkin_at: string | null;
  photos?: CasePhoto[];
}

export interface Vehicle {
  id: number;
  vehicle_no: string;
  type: 'territory' | 'roaming';
  current_status: 'standby' | 'busy' | 'offline';
  territory_name: string | null;
  active_case_count: number;
  last_position_lat: number | null;
  last_position_lng: number | null;
  last_position_at: string | null;
}

export interface Territory {
  id: number;
  name: string;
  districts: string | null;
  notes: string | null;
}

export interface ExceptionReason {
  id: number;
  code: string;
  label: string;
}

export interface AttendanceRecord {
  id: number;
  user_id: number;
  type: 'in' | 'out';
  timestamp: string;
  lat: number | null;
  lng: number | null;
  address: string | null;
  photo_url: string;
}
