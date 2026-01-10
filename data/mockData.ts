export interface Student {
  id: string;
  name: string;
  email: string;
  usn: string; // Format: 1BY24CSXXX
  course: string;
  semester?: number;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
}

export interface Class {
  id: string;
  name: string;
  subject: string; // Subject name (e.g., "Data Structures", "Database Systems")
  teacherId: string;
  teacherName: string;
  course: string;
  semester?: number;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  studentIds: string[]; // List of enrolled student IDs
  qrCode: string; // Class session QR code
  createdAt: string; // When QR was generated
  expiresAt: string; // When QR expires (endTime of class)
  isActive: boolean; // Whether the QR is currently active
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  className: string;
  subject: string; // Subject name
  studentId: string;
  studentName: string;
  studentUSN: string;
  date: string;
  time: string;
  status: "present" | "absent" | "late";
  teacherId: string;
  teacherName: string;
  markedBy?: string; // Who marked the attendance (student ID if self-marked, teacher ID if manually marked)
  reason?: string; // Reason for absence (health, competition, system failure, etc.)
  editedBy?: string; // Teacher ID if manually edited
  editedAt?: string; // When attendance was manually edited
}

export const mockStudents: Student[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    usn: "1BY24CS001",
    course: "Computer Science",
    semester: 3,
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob.smith@example.com",
    usn: "1BY24CS002",
    course: "Computer Science",
    semester: 3,
  },
  {
    id: "3",
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    usn: "1BY24CS003",
    course: "Computer Science",
    semester: 3,
  },
  {
    id: "4",
    name: "Diana Prince",
    email: "diana.prince@example.com",
    usn: "1BY24CS004",
    course: "Computer Science",
    semester: 3,
  },
  {
    id: "5",
    name: "Edward Norton",
    email: "edward.norton@example.com",
    usn: "1BY24CS005",
    course: "Computer Science",
    semester: 3,
  },
  {
    id: "6",
    name: "Fiona Green",
    email: "fiona.green@example.com",
    usn: "1BY24CS006",
    course: "Computer Science",
    semester: 3,
  },
  {
    id: "7",
    name: "George Wilson",
    email: "george.wilson@example.com",
    usn: "1BY24CS007",
    course: "Computer Science",
    semester: 3,
  },
  {
    id: "8",
    name: "Hannah Taylor",
    email: "hannah.taylor@example.com",
    usn: "1BY24CS008",
    course: "Computer Science",
    semester: 3,
  },
];

export const mockTeachers: Teacher[] = [
  {
    id: "T1",
    name: "Dr. Sarah Williams",
    email: "sarah.williams@university.edu",
    department: "Computer Science",
  },
  {
    id: "T2",
    name: "Prof. Michael Chen",
    email: "michael.chen@university.edu",
    department: "Mathematics",
  },
  {
    id: "T3",
    name: "Dr. Emily Davis",
    email: "emily.davis@university.edu",
    department: "Physics",
  },
];

// Helper functions
const formatDate = (date: Date) => date.toISOString().split("T")[0];
const formatTime = (date: Date) => date.toTimeString().split(" ")[0].substring(0, 5);

const today = new Date();

// Helper to create date with specific time
const createDateWithTime = (date: Date, hours: number, minutes: number) => {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
};

const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

// Create mock classes with active and expired sessions
export const mockClasses: Class[] = [
  // Active class today (Computer Science - Dr. Sarah Williams)
  {
    id: "C1",
    name: "Data Structures and Algorithms",
    subject: "Data Structures and Algorithms",
    teacherId: "T1",
    teacherName: "Dr. Sarah Williams",
    course: "Computer Science",
    semester: 3,
    date: formatDate(today),
    startTime: "09:00",
    endTime: "10:30",
    duration: 90,
    studentIds: ["1", "2", "3", "4", "5", "6", "7", "8"], // All CS students
    qrCode: `CLASS-C1-${formatDate(today)}-09:00`,
    createdAt: createDateWithTime(today, 8, 50).toISOString(),
    expiresAt: createDateWithTime(today, 10, 30).toISOString(),
    isActive: true,
  },
  // Active class today - Operating Systems
  {
    id: "C2",
    name: "Operating Systems",
    subject: "Operating Systems",
    teacherId: "T1",
    teacherName: "Dr. Sarah Williams",
    course: "Computer Science",
    semester: 3,
    date: formatDate(today),
    startTime: "11:00",
    endTime: "12:30",
    duration: 90,
    studentIds: ["1", "2", "3", "4", "5", "6", "7", "8"],
    qrCode: `CLASS-C2-${formatDate(today)}-11:00`,
    createdAt: createDateWithTime(today, 10, 50).toISOString(),
    expiresAt: createDateWithTime(today, 12, 30).toISOString(),
    isActive: true,
  },
  // Upcoming class today - Database Management Systems
  {
    id: "C3",
    name: "Database Management Systems",
    subject: "Database Management Systems",
    teacherId: "T1",
    teacherName: "Dr. Sarah Williams",
    course: "Computer Science",
    semester: 3,
    date: formatDate(today),
    startTime: "14:00",
    endTime: "15:30",
    duration: 90,
    studentIds: ["1", "2", "3", "4", "5", "6", "7", "8"],
    qrCode: `CLASS-C3-${formatDate(today)}-14:00`,
    createdAt: createDateWithTime(today, 13, 50).toISOString(),
    expiresAt: createDateWithTime(today, 15, 30).toISOString(),
    isActive: false, // Not started yet
  },
  // Expired class (Yesterday - Data Structures)
  {
    id: "C4",
    name: "Data Structures and Algorithms",
    subject: "Data Structures and Algorithms",
    teacherId: "T1",
    teacherName: "Dr. Sarah Williams",
    course: "Computer Science",
    semester: 3,
    date: formatDate(yesterday),
    startTime: "09:00",
    endTime: "10:30",
    duration: 90,
    studentIds: ["1", "2", "3", "4", "5", "6", "7", "8"],
    qrCode: `CLASS-C4-${formatDate(yesterday)}-09:00`,
    createdAt: createDateWithTime(yesterday, 8, 50).toISOString(),
    expiresAt: createDateWithTime(yesterday, 10, 30).toISOString(),
    isActive: false, // Expired
  },
  // Expired class (Yesterday - Operating Systems)
  {
    id: "C5",
    name: "Operating Systems",
    subject: "Operating Systems",
    teacherId: "T1",
    teacherName: "Dr. Sarah Williams",
    course: "Computer Science",
    semester: 3,
    date: formatDate(yesterday),
    startTime: "11:00",
    endTime: "12:30",
    duration: 90,
    studentIds: ["1", "2", "3", "4", "5", "6", "7", "8"],
    qrCode: `CLASS-C5-${formatDate(yesterday)}-11:00`,
    createdAt: createDateWithTime(yesterday, 10, 50).toISOString(),
    expiresAt: createDateWithTime(yesterday, 12, 30).toISOString(),
    isActive: false, // Expired
  },
];

// Generate attendance records linked to classes
export const mockAttendanceRecords: AttendanceRecord[] = [
  // Today's records for Class C1 (Data Structures)
  {
    id: "A1",
    classId: "C1",
    className: "Data Structures and Algorithms",
    subject: "Data Structures and Algorithms",
    studentId: "1",
    studentName: "Alice Johnson",
    studentUSN: "1BY24CS001",
    date: formatDate(today),
    time: "09:05",
    status: "present",
    teacherId: "T1",
    teacherName: "Dr. Sarah Williams",
    markedBy: "1",
  },
  {
    id: "A2",
    classId: "C1",
    className: "Data Structures and Algorithms",
    subject: "Data Structures and Algorithms",
    studentId: "2",
    studentName: "Bob Smith",
    studentUSN: "1BY24CS002",
    date: formatDate(today),
    time: "09:15",
    status: "present",
    teacherId: "T1",
    teacherName: "Dr. Sarah Williams",
    markedBy: "2",
  },
  {
    id: "A3",
    classId: "C1",
    className: "Data Structures and Algorithms",
    subject: "Data Structures and Algorithms",
    studentId: "5",
    studentName: "Edward Norton",
    studentUSN: "1BY24CS005",
    date: formatDate(today),
    time: "09:18",
    status: "present",
    teacherId: "T1",
    teacherName: "Dr. Sarah Williams",
    markedBy: "5",
  },
  // Yesterday's records for Class C4 (Data Structures)
  {
    id: "A4",
    classId: "C4",
    className: "Data Structures and Algorithms",
    subject: "Data Structures and Algorithms",
    studentId: "1",
    studentName: "Alice Johnson",
    studentUSN: "1BY24CS001",
    date: formatDate(yesterday),
    time: "09:10",
    status: "present",
    teacherId: "T1",
    teacherName: "Dr. Sarah Williams",
    markedBy: "1",
  },
  {
    id: "A5",
    classId: "C4",
    className: "Data Structures and Algorithms",
    subject: "Data Structures and Algorithms",
    studentId: "2",
    studentName: "Bob Smith",
    studentUSN: "1BY24CS002",
    date: formatDate(yesterday),
    time: "09:12",
    status: "present",
    teacherId: "T1",
    teacherName: "Dr. Sarah Williams",
    markedBy: "2",
  },
  {
    id: "A6",
    classId: "C4",
    className: "Data Structures and Algorithms",
    subject: "Data Structures and Algorithms",
    studentId: "8",
    studentName: "Hannah Taylor",
    studentUSN: "1BY24CS008",
    date: formatDate(yesterday),
    time: "09:25",
    status: "late",
    teacherId: "T1",
    teacherName: "Dr. Sarah Williams",
    markedBy: "8",
  },
  // Yesterday's records for Class C5 (Operating Systems)
  {
    id: "A7",
    classId: "C5",
    className: "Operating Systems",
    subject: "Operating Systems",
    studentId: "3",
    studentName: "Charlie Brown",
    studentUSN: "1BY24CS003",
    date: formatDate(yesterday),
    time: "11:05",
    status: "late",
    teacherId: "T1",
    teacherName: "Dr. Sarah Williams",
    markedBy: "3",
  },
  {
    id: "A8",
    classId: "C5",
    className: "Operating Systems",
    subject: "Operating Systems",
    studentId: "6",
    studentName: "Fiona Green",
    studentUSN: "1BY24CS006",
    date: formatDate(yesterday),
    time: "11:00",
    status: "present",
    teacherId: "T1",
    teacherName: "Dr. Sarah Williams",
    markedBy: "6",
  },
];

// Helper function to check if a class QR code is valid
export function isClassQRCodeValid(classData: Class): boolean {
  if (!classData.isActive) return false;
  
  const now = new Date();
  const expiresAt = new Date(classData.expiresAt);
  
  // Check if current time is before expiration
  return now <= expiresAt;
}

// Helper function to get active classes
export function getActiveClasses(): Class[] {
  return mockClasses.filter((cls) => isClassQRCodeValid(cls));
}

// Helper function to find class by QR code
export function findClassByQRCode(qrCode: string): Class | undefined {
  return mockClasses.find((cls) => cls.qrCode === qrCode);
}

// Helper function to get classes for a teacher
export function getClassesForTeacher(teacherId: string): Class[] {
  return mockClasses.filter((cls) => cls.teacherId === teacherId);
}

// Helper function to get classes for a student
export function getClassesForStudent(studentId: string): Class[] {
  return mockClasses.filter((cls) => cls.studentIds.includes(studentId));
}

// Helper function to get ongoing classes (active and currently happening)
export function getOngoingClasses(): Class[] {
  const now = new Date();
  return mockClasses.filter((cls) => {
    if (!cls.isActive) return false;
    const startTime = new Date(cls.date + "T" + cls.startTime);
    const endTime = new Date(cls.expiresAt);
    return now >= startTime && now <= endTime;
  });
}

// Helper function to get upcoming classes
export function getUpcomingClasses(): Class[] {
  const now = new Date();
  return mockClasses.filter((cls) => {
    const startTime = new Date(cls.date + "T" + cls.startTime);
    return startTime > now;
  });
}

// Helper function to get attendance percentage by subject for a student
export function getAttendancePercentageBySubject(studentId: string): { subject: string; percentage: number; present: number; total: number }[] {
  const studentRecords = mockAttendanceRecords.filter((record) => record.studentId === studentId);
  const subjectMap = new Map<string, { present: number; total: number }>();

  // Count attendance for each subject
  studentRecords.forEach((record) => {
    if (!subjectMap.has(record.subject)) {
      subjectMap.set(record.subject, { present: 0, total: 0 });
    }
    const counts = subjectMap.get(record.subject)!;
    counts.total++;
    if (record.status === "present" || record.status === "late") {
      counts.present++;
    }
  });

  // Get all unique subjects from classes
  const allSubjects = Array.from(new Set(mockClasses.map((cls) => cls.subject)));
  
  // Calculate percentage for each subject
  return allSubjects.map((subject) => {
    const counts = subjectMap.get(subject) || { present: 0, total: 0 };
    const percentage = counts.total > 0 ? Math.round((counts.present / counts.total) * 100) : 0;
    return {
      subject,
      percentage,
      present: counts.present,
      total: counts.total,
    };
  }).filter((item) => item.total > 0); // Only return subjects with attendance records
}

// Helper function to check if student is enrolled in class
export function isStudentEnrolledInClass(studentId: string, classId: string): boolean {
  const classData = mockClasses.find((cls) => cls.id === classId);
  return classData ? classData.studentIds.includes(studentId) : false;
}

// Helper function to get attendance records for a specific class
export function getAttendanceForClass(classId: string): AttendanceRecord[] {
  return mockAttendanceRecords.filter((record) => record.classId === classId);
}

// Helper function to get attendance records for a subject (all sessions)
export function getAttendanceForSubject(subject: string): AttendanceRecord[] {
  return mockAttendanceRecords.filter((record) => record.subject === subject);
}

// Helper function to get attendance records by date range
export function getAttendanceByDateRange(startDate: string, endDate: string): AttendanceRecord[] {
  return mockAttendanceRecords.filter((record) => {
    return record.date >= startDate && record.date <= endDate;
  });
}

// Helper function to get all unique dates with attendance for a subject
export function getAttendanceDatesForSubject(subject: string): string[] {
  const records = getAttendanceForSubject(subject);
  const dates = Array.from(new Set(records.map((r) => r.date))).sort().reverse();
  return dates;
}

// Attendance reasons
export const ATTENDANCE_REASONS = [
  "Health Issue",
  "Competition",
  "System Failure",
  "Personal Emergency",
  "Authorized Leave",
  "Other (specify)",
] as const;

export type AttendanceReason = typeof ATTENDANCE_REASONS[number];
