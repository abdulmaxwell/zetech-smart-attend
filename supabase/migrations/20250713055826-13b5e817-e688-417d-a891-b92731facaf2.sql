-- Insert sample data for testing
-- Sample profiles (students and admin)
INSERT INTO public.profiles (user_id, first_name, last_name, email, role, admission_number, id_number, department, year_of_study) VALUES
  ('00000000-0000-0000-0000-000000000001', 'John', 'Doe', 'john.doe@student.zetech.ac.ke', 'student', 'ZU/2024/001', '12345678', 'Computer Science', 2),
  ('00000000-0000-0000-0000-000000000002', 'Jane', 'Smith', 'jane.smith@student.zetech.ac.ke', 'student', 'ZU/2024/002', '12345679', 'Computer Science', 2),
  ('00000000-0000-0000-0000-000000000003', 'Michael', 'Johnson', 'michael.johnson@student.zetech.ac.ke', 'student', 'ZU/2024/003', '12345680', 'Engineering', 3),
  ('00000000-0000-0000-0000-000000000004', 'Sarah', 'Wilson', 'sarah.wilson@student.zetech.ac.ke', 'student', 'ZU/2024/004', '12345681', 'Business', 1),
  ('00000000-0000-0000-0000-000000000005', 'Mark', 'Sweat', 'mark.sweat@zetech.ac.ke', 'admin', NULL, '98765432', 'Administration', NULL);

-- Sample classes
INSERT INTO public.classes (id, name, code, department, lecturer_id, academic_year, semester, schedule) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Programming Fundamentals', 'CS101', 'Computer Science', '00000000-0000-0000-0000-000000000005', '2024/2025', 'Semester 1', '{"monday": "09:00-11:00", "wednesday": "14:00-16:00"}'),
  ('22222222-2222-2222-2222-222222222222', 'Data Structures', 'CS201', 'Computer Science', '00000000-0000-0000-0000-000000000005', '2024/2025', 'Semester 1', '{"tuesday": "10:00-12:00", "thursday": "15:00-17:00"}'),
  ('33333333-3333-3333-3333-333333333333', 'Database Systems', 'CS301', 'Computer Science', '00000000-0000-0000-0000-000000000005', '2024/2025', 'Semester 1', '{"monday": "14:00-16:00", "friday": "09:00-11:00"}'),
  ('44444444-4444-4444-4444-444444444444', 'Engineering Mathematics', 'ENG101', 'Engineering', '00000000-0000-0000-0000-000000000005', '2024/2025', 'Semester 1', '{"monday": "08:00-10:00", "wednesday": "10:00-12:00"}'),
  ('55555555-5555-5555-5555-555555555555', 'Business Ethics', 'BUS101', 'Business', '00000000-0000-0000-0000-000000000005', '2024/2025', 'Semester 1', '{"tuesday": "14:00-16:00", "thursday": "08:00-10:00"}');

-- Sample student enrollments
INSERT INTO public.student_classes (student_id, class_id) VALUES
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111'),
  ('00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222'),
  ('00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333'),
  ('00000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111'),
  ('00000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222'),
  ('00000000-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444'),
  ('00000000-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555555');

-- Sample BLE beacons
INSERT INTO public.ble_beacons (uuid, class_id, location, signal_threshold, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 'Computer Lab 1', -70, 'Programming Fundamentals Lab'),
  ('550e8400-e29b-41d4-a716-446655440002', '22222222-2222-2222-2222-222222222222', 'Computer Lab 2', -70, 'Data Structures Lab'),
  ('550e8400-e29b-41d4-a716-446655440003', '33333333-3333-3333-3333-333333333333', 'Computer Lab 3', -70, 'Database Systems Lab'),
  ('550e8400-e29b-41d4-a716-446655440004', '44444444-4444-4444-4444-444444444444', 'Engineering Hall', -70, 'Mathematics Lecture Hall'),
  ('550e8400-e29b-41d4-a716-446655440005', '55555555-5555-5555-5555-555555555555', 'Business Block Room 201', -70, 'Business Ethics Classroom');

-- Sample attendance logs (past week)
INSERT INTO public.attendance_logs (student_id, class_id, timestamp, method, beacon_uuid, signal_strength) VALUES
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '6 days', 'ble', '550e8400-e29b-41d4-a716-446655440001', -65),
  ('00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '5 days', 'ble', '550e8400-e29b-41d4-a716-446655440002', -68),
  ('00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '4 days', 'ble', '550e8400-e29b-41d4-a716-446655440003', -70),
  ('00000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '6 days', 'ble', '550e8400-e29b-41d4-a716-446655440001', -72),
  ('00000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '5 days', 'manual', NULL, NULL),
  ('00000000-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '3 days', 'ble', '550e8400-e29b-41d4-a716-446655440004', -69),
  ('00000000-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '2 days', 'ble', '550e8400-e29b-41d4-a716-446655440005', -66);

-- Sample absence requests
INSERT INTO public.absence_requests (student_id, class_id, reason, urgency, status) VALUES
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'I was feeling unwell with flu symptoms and could not attend the programming class. I have been taking medication and resting as advised by the campus health center. I understand the importance of this class and will catch up on the missed content by reviewing the course materials and consulting with my classmates. I will ensure this does not happen again and will maintain good health habits. Please find attached my medical certificate from the campus clinic.', 'medium', 'pending'),
  ('00000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'I had a family emergency that required my immediate attention. My grandmother was admitted to the hospital and I needed to accompany my parents to provide support during this difficult time. This was an unexpected situation that I could not have foreseen or planned for. I understand the importance of attending all classes and this absence was unavoidable. I will make sure to get notes from classmates and schedule a meeting with the lecturer to discuss any missed content. I have attached the hospital admission documents as proof of the emergency situation.', 'high', 'approved'),
  ('00000000-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', 'I experienced transportation issues due to a public transport strike that occurred unexpectedly on the day of the class. All buses and matatus were not operating, and I had no alternative means of getting to campus on time. I tried to find alternative transportation including asking friends and family for assistance, but was unable to secure reliable transport. I understand this may not be considered a valid excuse, but the circumstances were beyond my control. I will ensure I have backup transportation plans in future to avoid such situations. I am committed to attending all future classes and will not let this happen again.', 'low', 'rejected');

-- Sample weekly reports
INSERT INTO public.weekly_reports (student_id, week_start_date, week_end_date, total_classes, attended_classes, attendance_percentage, ai_insights) VALUES
  ('00000000-0000-0000-0000-000000000001', DATE_TRUNC('week', NOW() - INTERVAL '1 week'), DATE_TRUNC('week', NOW() - INTERVAL '1 week') + INTERVAL '6 days', 9, 7, 77.78, 'Good attendance overall, but missed 2 classes. Focus on maintaining consistency.'),
  ('00000000-0000-0000-0000-000000000002', DATE_TRUNC('week', NOW() - INTERVAL '1 week'), DATE_TRUNC('week', NOW() - INTERVAL '1 week') + INTERVAL '6 days', 6, 5, 83.33, 'Excellent progress! Keep up the good work with attendance.'),
  ('00000000-0000-0000-0000-000000000003', DATE_TRUNC('week', NOW() - INTERVAL '1 week'), DATE_TRUNC('week', NOW() - INTERVAL '1 week') + INTERVAL '6 days', 3, 2, 66.67, 'Attendance below recommended level. Consider improving time management.'),
  ('00000000-0000-0000-0000-000000000004', DATE_TRUNC('week', NOW() - INTERVAL '1 week'), DATE_TRUNC('week', NOW() - INTERVAL '1 week') + INTERVAL '6 days', 2, 2, 100.00, 'Perfect attendance! Outstanding commitment to your studies.');