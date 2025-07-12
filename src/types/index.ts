
export interface User {
  id: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin';
  admission_number?: string;
  id_number?: string;
  birth_cert_number?: string;
  first_name: string;
  last_name: string;
  parent_email?: string;
  created_at: string;
  last_login?: string;
}

export interface Class {
  id: string;
  name: string;
  code: string;
  lecturer_id: string;
  schedule: string;
  location: string;
  created_at: string;
}

export interface AttendanceLog {
  id: string;
  student_id: string;
  class_id: string;
  timestamp: string;
  method: 'ble' | 'qr' | 'manual';
  beacon_uuid?: string;
  signal_strength?: number;
  status: 'present' | 'late' | 'absent';
}

export interface AbsenceRequest {
  id: string;
  student_id: string;
  class_id: string;
  reason: string;
  supporting_docs?: string[];
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
  admin_comment?: string;
  created_at: string;
  updated_at: string;
}

export interface BLEBeacon {
  id: string;
  uuid: string;
  class_id: string;
  location: string;
  signal_threshold: number;
  is_active: boolean;
  created_at: string;
}

export interface WeeklyReport {
  id: string;
  student_id: string;
  week_number: number;
  year: number;
  attendance_percentage: number;
  classes_attended: number;
  classes_missed: number;
  ai_insights: string;
  created_at: string;
}
