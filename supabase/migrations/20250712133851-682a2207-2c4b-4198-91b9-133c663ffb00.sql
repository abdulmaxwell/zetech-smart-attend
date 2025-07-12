-- Create enum types
CREATE TYPE public.user_role AS ENUM ('student', 'lecturer', 'admin');
CREATE TYPE public.attendance_method AS ENUM ('ble', 'qr', 'manual');
CREATE TYPE public.absence_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.absence_urgency AS ENUM ('low', 'medium', 'high');

-- Create users/profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  role public.user_role NOT NULL DEFAULT 'student',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  admission_number TEXT UNIQUE,
  id_number TEXT UNIQUE,
  birth_certificate_number TEXT UNIQUE,
  parent_email TEXT,
  phone_number TEXT,
  department TEXT,
  year_of_study INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create classes table
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  lecturer_id UUID REFERENCES public.profiles(id),
  department TEXT NOT NULL,
  schedule JSONB, -- {day: 'monday', start: '09:00', end: '11:00', room: 'A101'}
  semester TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_classes junction table
CREATE TABLE public.student_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, class_id)
);

-- Create attendance_logs table
CREATE TABLE public.attendance_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  class_id UUID NOT NULL REFERENCES public.classes(id),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  method public.attendance_method NOT NULL DEFAULT 'ble',
  beacon_uuid TEXT,
  signal_strength INTEGER,
  marked_by UUID REFERENCES public.profiles(id), -- lecturer who marked manually
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create absence_requests table
CREATE TABLE public.absence_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  class_id UUID NOT NULL REFERENCES public.classes(id),
  reason TEXT NOT NULL CHECK (char_length(reason) >= 300),
  urgency public.absence_urgency NOT NULL DEFAULT 'low',
  status public.absence_status NOT NULL DEFAULT 'pending',
  supporting_documents TEXT[], -- file URLs
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ble_beacons table
CREATE TABLE public.ble_beacons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  uuid TEXT NOT NULL UNIQUE,
  class_id UUID NOT NULL REFERENCES public.classes(id),
  location TEXT NOT NULL,
  description TEXT,
  signal_threshold INTEGER NOT NULL DEFAULT -70, -- dBm
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weekly_reports table
CREATE TABLE public.weekly_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  total_classes INTEGER NOT NULL DEFAULT 0,
  attended_classes INTEGER NOT NULL DEFAULT 0,
  attendance_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  ai_insights TEXT,
  content JSONB, -- detailed report data
  email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, week_start_date)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absence_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ble_beacons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for classes
CREATE POLICY "Students can view enrolled classes" ON public.classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.student_classes 
      WHERE class_id = id AND student_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'lecturer')
    )
  );

-- Create RLS policies for attendance_logs
CREATE POLICY "Students can view their own attendance" ON public.attendance_logs
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'lecturer')
    )
  );

CREATE POLICY "Students can insert their own attendance" ON public.attendance_logs
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for absence_requests
CREATE POLICY "Students can manage their absence requests" ON public.absence_requests
  FOR ALL USING (
    student_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'lecturer')
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_absence_requests_updated_at
  BEFORE UPDATE ON public.absence_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ble_beacons_updated_at
  BEFORE UPDATE ON public.ble_beacons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_attendance_logs_student_timestamp ON public.attendance_logs(student_id, timestamp DESC);
CREATE INDEX idx_attendance_logs_class_timestamp ON public.attendance_logs(class_id, timestamp DESC);
CREATE INDEX idx_absence_requests_student_status ON public.absence_requests(student_id, status);
CREATE INDEX idx_student_classes_student_id ON public.student_classes(student_id);
CREATE INDEX idx_weekly_reports_student_week ON public.weekly_reports(student_id, week_start_date DESC);