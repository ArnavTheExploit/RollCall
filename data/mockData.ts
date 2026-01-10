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
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    usn: "1BY24CS001",
    course: "Computer Science",
    semester: 3,
  },
  {
    id: "2",
    name: "Vivaan Patel",
    email: "vivaan.patel@example.com",
    usn: "1BY24CS002",
    course: "Computer Science",
    semester: 3,
  },
  {
    id: "3",
    name: "Aditya Verma",
    email: "aditya.verma@example.com",
    usn: "1BY24CS003",
    course: "Computer Science",
    semester: 3,
  },
  {
    id: "4",
    name: "Diya Gupta",
    email: "diya.gupta@example.com",
    usn: "1BY24CS004",
    course: "Computer Science",
    semester: 3,
  },
  {
    id: "5",
    name: "Ishaan Kumar",
    email: "ishaan.kumar@example.com",
    usn: "1BY24CS005",
    course: "Computer Science",
    semester: 3,
  },
  {
    id: "6",
    name: "Ananya Reddy",
    email: "ananya.reddy@example.com",
    usn: "1BY24CS006",
    course: "Computer Science",
    semester: 3,
  },
  {
    id: "7",
    name: "Rohan Singh",
    email: "rohan.singh@example.com",
    usn: "1BY24CS007",
    course: "Computer Science",
    semester: 3,
  },
  {
    id: "8",
    name: "Kavya Iyer",
    email: "kavya.iyer@example.com",
    usn: "1BY24CS008",
    course: "Computer Science",
    semester: 3,
  },
];

export const mockTeachers: Teacher[] = [
  {
    id: "T1",
    name: "Dr. Anjali Mehta",
    email: "anjali.mehta@university.edu",
    department: "Computer Science",
  },
  {
    id: "T2",
    name: "Prof. Rajesh Iyer",
    email: "rajesh.iyer@university.edu",
    department: "Mathematics",
  },
  {
    id: "T3",
    name: "Dr. Priya Sharma",
    email: "priya.sharma@university.edu",
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

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

// Helper to create a date with specific time for expiration calculation
const getEndTime = (date: Date, startTime: string, duration: number) => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const endDate = new Date(date);
  endDate.setHours(hours, minutes, 0, 0);
  endDate.setMinutes(endDate.getMinutes() + duration);
  return endDate;
};

// Create mock classes with active and expired sessions
export const mockClasses: Class[] = [
  // Ongoing class today - Data Structures and Algorithms (morning)
  {
    id: "C1",
    name: "Data Structures and Algorithms",
    subject: "Data Structures and Algorithms",
    teacherId: "T1",
    teacherName: "Dr. Anjali Mehta",
    course: "Computer Science",
    semester: 3,
    date: formatDate(today),
    startTime: "09:00",
    endTime: "10:30",
    duration: 90,
    studentIds: ["1", "2", "3", "4", "5", "6", "7", "8"], // All CS students
    qrCode: `CLASS-C1-${formatDate(today)}-09:00`,
    createdAt: createDateWithTime(today, 8, 50).toISOString(),
    expiresAt: getEndTime(today, "09:00", 90).toISOString(),
    isActive: true,
  },
  // Ongoing class today - Operating Systems (late morning)
  {
    id: "C2",
    name: "Operating Systems",
    subject: "Operating Systems",
    teacherId: "T1",
    teacherName: "Dr. Anjali Mehta",
    course: "Computer Science",
    semester: 3,
    date: formatDate(today),
    startTime: "11:00",
    endTime: "12:30",
    duration: 90,
    studentIds: ["1", "2", "3", "4", "5", "6", "7", "8"],
    qrCode: `CLASS-C2-${formatDate(today)}-11:00`,
    createdAt: createDateWithTime(today, 10, 50).toISOString(),
    expiresAt: getEndTime(today, "11:00", 90).toISOString(),
    isActive: true,
  },
  // Ongoing class today - Computer Networks (afternoon)
  {
    id: "C6",
    name: "Computer Networks",
    subject: "Computer Networks",
    teacherId: "T1",
    teacherName: "Dr. Anjali Mehta",
    course: "Computer Science",
    semester: 3,
    date: formatDate(today),
    startTime: "13:00",
    endTime: "14:30",
    duration: 90,
    studentIds: ["1", "2", "3", "4", "5", "6", "7", "8"],
    qrCode: `CLASS-C6-${formatDate(today)}-13:00`,
    createdAt: createDateWithTime(today, 12, 50).toISOString(),
    expiresAt: getEndTime(today, "13:00", 90).toISOString(),
    isActive: true,
  },
  // Active class today - Cloud Computing (evening)
  {
    id: "C11",
    name: "Cloud Computing",
    subject: "Cloud Computing",
    teacherId: "T1",
    teacherName: "Dr. Anjali Mehta",
    course: "Computer Science",
    semester: 3,
    date: formatDate(today),
    startTime: "18:30",
    endTime: "20:00",
    duration: 90,
    studentIds: ["1", "2", "3", "4", "5", "6", "7", "8"],
    qrCode: `CLASS-C11-${formatDate(today)}-18:30`,
    createdAt: createDateWithTime(today, 18, 20).toISOString(),
    expiresAt: getEndTime(today, "18:30", 90).toISOString(),
    isActive: true,
  },
  // Active class today - Artificial Intelligence (evening)
  {
    id: "C12",
    name: "Artificial Intelligence",
    subject: "Artificial Intelligence",
    teacherId: "T1",
    teacherName: "Dr. Anjali Mehta",
    course: "Computer Science",
    semester: 3,
    date: formatDate(today),
    startTime: "19:00",
    endTime: "20:30",
    duration: 90,
    studentIds: ["1", "2", "3", "4", "5", "6", "7", "8"],
    qrCode: `CLASS-C12-${formatDate(today)}-19:00`,
    createdAt: createDateWithTime(today, 18, 50).toISOString(),
    expiresAt: getEndTime(today, "19:00", 90).toISOString(),
    isActive: true,
  },
  // Active class today - Web Development (evening)
  {
    id: "C13",
    name: "Web Development",
    subject: "Web Development",
    teacherId: "T1",
    teacherName: "Dr. Anjali Mehta",
    course: "Computer Science",
    semester: 3,
    date: formatDate(today),
    startTime: "19:15",
    endTime: "20:45",
    duration: 90,
    studentIds: ["1", "2", "3", "4", "5", "6", "7", "8"],
    qrCode: `CLASS-C13-${formatDate(today)}-19:15`,
    createdAt: createDateWithTime(today, 19, 5).toISOString(),
    expiresAt: getEndTime(today, "19:15", 90).toISOString(),
    isActive: true,
  },
  // Upcoming class today - Database Management Systems (afternoon)
  {
    id: "C3",
    name: "Database Management Systems",
    subject: "Database Management Systems",
    teacherId: "T1",
    teacherName: "Dr. Anjali Mehta",
    course: "Computer Science",
    semester: 3,
    date: formatDate(today),
    startTime: "15:00",
    endTime: "16:30",
    duration: 90,
    studentIds: ["1", "2", "3", "4", "5", "6", "7", "8"],
    qrCode: `CLASS-C3-${formatDate(today)}-15:00`,
    createdAt: createDateWithTime(today, 14, 50).toISOString(),
    expiresAt: getEndTime(today, "15:00", 90).toISOString(),
    isActive: false, // Not started yet
  },
  // Upcoming class today - Software Engineering (evening)
  {
    id: "C7",
    name: "Software Engineering",
    subject: "Software Engineering",
    teacherId: "T1",
    teacherName: "Dr. Anjali Mehta",
    course: "Computer Science",
    semester: 3,
    date: formatDate(today),
    startTime: "16:00",
    endTime: "17:30",
    duration: 90,
    studentIds: ["1", "2", "3", "4", "5", "6", "7", "8"],
    qrCode: `CLASS-C7-${formatDate(today)}-16:00`,
    createdAt: createDateWithTime(today, 15, 50).toISOString(),
    expiresAt: getEndTime(today, "16:00", 90).toISOString(),
    isActive: false, // Not started yet
  },
  // Upcoming class tomorrow - Data Structures and Algorithms
  {
    id: "C8",
    name: "Data Structures and Algorithms",
    subject: "Data Structures and Algorithms",
    teacherId: "T1",
    teacherName: "Dr. Anjali Mehta",
    course: "Computer Science",
    semester: 3,
    date: formatDate(tomorrow),
    startTime: "09:00",
    endTime: "10:30",
    duration: 90,
    studentIds: ["1", "2", "3", "4", "5", "6", "7", "8"],
    qrCode: `CLASS-C8-${formatDate(tomorrow)}-09:00`,
    createdAt: createDateWithTime(tomorrow, 8, 50).toISOString(),
    expiresAt: getEndTime(tomorrow, "09:00", 90).toISOString(),
    isActive: false, // Upcoming
  },
  // Upcoming class tomorrow - Operating Systems
  {
    id: "C9",
    name: "Operating Systems",
    subject: "Operating Systems",
    teacherId: "T1",
    teacherName: "Dr. Anjali Mehta",
    course: "Computer Science",
    semester: 3,
    date: formatDate(tomorrow),
    startTime: "11:00",
    endTime: "12:30",
    duration: 90,
    studentIds: ["1", "2", "3", "4", "5", "6", "7", "8"],
    qrCode: `CLASS-C9-${formatDate(tomorrow)}-11:00`,
    createdAt: createDateWithTime(tomorrow, 10, 50).toISOString(),
    expiresAt: getEndTime(tomorrow, "11:00", 90).toISOString(),
    isActive: false, // Upcoming
  },
  // Upcoming class day after tomorrow - Machine Learning
  {
    id: "C10",
    name: "Machine Learning",
    subject: "Machine Learning",
    teacherId: "T1",
    teacherName: "Dr. Anjali Mehta",
    course: "Computer Science",
    semester: 3,
    date: formatDate(dayAfterTomorrow),
    startTime: "09:00",
    endTime: "10:30",
    duration: 90,
    studentIds: ["1", "2", "3", "4", "5", "6", "7", "8"],
    qrCode: `CLASS-C10-${formatDate(dayAfterTomorrow)}-09:00`,
    createdAt: createDateWithTime(dayAfterTomorrow, 8, 50).toISOString(),
    expiresAt: getEndTime(dayAfterTomorrow, "09:00", 90).toISOString(),
    isActive: false, // Upcoming
  },
  // Expired class (Yesterday - Data Structures)
  {
    id: "C4",
    name: "Data Structures and Algorithms",
    subject: "Data Structures and Algorithms",
    teacherId: "T1",
    teacherName: "Dr. Anjali Mehta",
    course: "Computer Science",
    semester: 3,
    date: formatDate(yesterday),
    startTime: "09:00",
    endTime: "10:30",
    duration: 90,
    studentIds: ["1", "2", "3", "4", "5", "6", "7", "8"],
    qrCode: `CLASS-C4-${formatDate(yesterday)}-09:00`,
    createdAt: createDateWithTime(yesterday, 8, 50).toISOString(),
    expiresAt: getEndTime(yesterday, "09:00", 90).toISOString(),
    isActive: false, // Expired
  },
  // Expired class (Yesterday - Operating Systems)
  {
    id: "C5",
    name: "Operating Systems",
    subject: "Operating Systems",
    teacherId: "T1",
    teacherName: "Dr. Anjali Mehta",
    course: "Computer Science",
    semester: 3,
    date: formatDate(yesterday),
    startTime: "11:00",
    endTime: "12:30",
    duration: 90,
    studentIds: ["1", "2", "3", "4", "5", "6", "7", "8"],
    qrCode: `CLASS-C5-${formatDate(yesterday)}-11:00`,
    createdAt: createDateWithTime(yesterday, 10, 50).toISOString(),
    expiresAt: getEndTime(yesterday, "11:00", 90).toISOString(),
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
    studentName: "Aarav Sharma",
    studentUSN: "1BY24CS001",
    date: formatDate(today),
    time: "09:05",
    status: "present",
    teacherId: "T1",
    teacherName: "Dr. Anjali Mehta",
    markedBy: "1",
  },
  {
    id: "A2",
    classId: "C1",
    className: "Data Structures and Algorithms",
    subject: "Data Structures and Algorithms",
    studentId: "2",
    studentName: "Vivaan Patel",
    studentUSN: "1BY24CS002",
    date: formatDate(today),
    time: "09:15",
    status: "present",
    teacherId: "T1",
    teacherName: "Dr. Anjali Mehta",
    markedBy: "2",
  },
  {
    id: "A3",
    classId: "C1",
    className: "Data Structures and Algorithms",
    subject: "Data Structures and Algorithms",
    studentId: "5",
    studentName: "Ishaan Kumar",
    studentUSN: "1BY24CS005",
    date: formatDate(today),
    time: "09:18",
    status: "present",
    teacherId: "T1",
    teacherName: "Dr. Anjali Mehta",
    markedBy: "5",
  },
  // Yesterday's records for Class C4 (Data Structures)
  {
    id: "A4",
    classId: "C4",
    className: "Data Structures and Algorithms",
    subject: "Data Structures and Algorithms",
    studentId: "1",
    studentName: "Aarav Sharma",
    studentUSN: "1BY24CS001",
    date: formatDate(yesterday),
    time: "09:10",
    status: "present",
    teacherId: "T1",
    teacherName: "Dr. Anjali Mehta",
    markedBy: "1",
  },
  {
    id: "A5",
    classId: "C4",
    className: "Data Structures and Algorithms",
    subject: "Data Structures and Algorithms",
    studentId: "2",
    studentName: "Vivaan Patel",
    studentUSN: "1BY24CS002",
    date: formatDate(yesterday),
    time: "09:12",
    status: "present",
    teacherId: "T1",
    teacherName: "Dr. Anjali Mehta",
    markedBy: "2",
  },
  {
    id: "A6",
    classId: "C4",
    className: "Data Structures and Algorithms",
    subject: "Data Structures and Algorithms",
    studentId: "8",
    studentName: "Kavya Iyer",
    studentUSN: "1BY24CS008",
    date: formatDate(yesterday),
    time: "09:25",
    status: "late",
    teacherId: "T1",
    teacherName: "Dr. Anjali Mehta",
    markedBy: "8",
  },
  // Yesterday's records for Class C5 (Operating Systems)
  {
    id: "A7",
    classId: "C5",
    className: "Operating Systems",
    subject: "Operating Systems",
    studentId: "3",
    studentName: "Aditya Verma",
    studentUSN: "1BY24CS003",
    date: formatDate(yesterday),
    time: "11:05",
    status: "late",
    teacherId: "T1",
    teacherName: "Dr. Anjali Mehta",
    markedBy: "3",
  },
  {
    id: "A8",
    classId: "C5",
    className: "Operating Systems",
    subject: "Operating Systems",
    studentId: "6",
    studentName: "Ananya Reddy",
    studentUSN: "1BY24CS006",
    date: formatDate(yesterday),
    time: "11:00",
    status: "present",
    teacherId: "T1",
    teacherName: "Dr. Anjali Mehta",
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

// Helper function to get ongoing classes (currently happening)
export function getOngoingClasses(): Class[] {
  const now = new Date();
  return mockClasses.filter((cls) => {
    // Check if class is currently happening based on time
    const classDate = new Date(cls.date + "T00:00:00");
    const todayDate = new Date(formatDate(now) + "T00:00:00");

    // Only check classes for today or future dates
    if (classDate.getTime() < todayDate.getTime()) return false;

    // For today's classes, check if current time is between start and end
    if (formatDate(classDate) === formatDate(now)) {
      const startTime = new Date(cls.date + "T" + cls.startTime);
      const endTime = new Date(cls.expiresAt);
      return now >= startTime && now <= endTime;
    }

    return false;
  });
}

// Helper function to get upcoming classes
export function getUpcomingClasses(): Class[] {
  const now = new Date();
  return mockClasses.filter((cls) => {
    const classDate = new Date(cls.date + "T00:00:00");
    const todayDate = new Date(formatDate(now) + "T00:00:00");

    // For today's classes, check if start time is in the future
    if (formatDate(classDate) === formatDate(now)) {
      const startTime = new Date(cls.date + "T" + cls.startTime);
      return startTime > now;
    }

    // For future dates, check if date is in the future
    return classDate.getTime() > todayDate.getTime();
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

// Helper function to get attendance records for a specific student
export function getAttendanceForStudent(studentId: string): AttendanceRecord[] {
  return mockAttendanceRecords.filter((record) => record.studentId === studentId);
}

// Helper function to get attendance records for a student by subject
export function getStudentAttendanceBySubject(studentId: string, subject: string): AttendanceRecord[] {
  return mockAttendanceRecords.filter((record) => record.studentId === studentId && record.subject === subject);
}

// Helper function to get recent attendance records for a student
export function getRecentAttendanceForStudent(studentId: string, limit: number = 10): AttendanceRecord[] {
  const records = getAttendanceForStudent(studentId);
  return records
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, limit);
}

// Helper function to get attendance statistics for a student
export function getStudentAttendanceStats(studentId: string): {
  total: number;
  present: number;
  absent: number;
  late: number;
  overallPercentage: number;
  bySubject: { subject: string; total: number; present: number; percentage: number }[];
} {
  const records = getAttendanceForStudent(studentId);
  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const late = records.filter((r) => r.status === "late").length;
  const overallPercentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  // Group by subject
  const subjectMap = new Map<string, { total: number; present: number }>();
  records.forEach((record) => {
    if (!subjectMap.has(record.subject)) {
      subjectMap.set(record.subject, { total: 0, present: 0 });
    }
    const stats = subjectMap.get(record.subject)!;
    stats.total++;
    if (record.status === "present" || record.status === "late") {
      stats.present++;
    }
  });

  const bySubject = Array.from(subjectMap.entries()).map(([subject, stats]) => ({
    subject,
    total: stats.total,
    present: stats.present,
    percentage: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
  }));

  return {
    total,
    present,
    absent,
    late,
    overallPercentage,
    bySubject,
  };
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
