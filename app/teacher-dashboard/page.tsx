"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import {
  mockTeachers,
  mockStudents,
  mockClasses,
  mockAttendanceRecords,
  getClassesForTeacher,
  getAttendanceForSubject,
  getAttendanceForClass,
  getAttendanceDatesForSubject,
  getAttendanceByDateRange,
  ATTENDANCE_REASONS,
  AttendanceRecord,
  Class,
} from "@/data/mockData";
import { QRCodeSVG } from "qrcode.react";
import { format, parseISO } from "date-fns";
import * as XLSX from "xlsx";

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<Class | null>(null);
  const [viewMode, setViewMode] = useState<"classes" | "attendance" | "create">("classes");
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editReason, setEditReason] = useState("");
  const [editReasonOther, setEditReasonOther] = useState("");
  const [editStatus, setEditStatus] = useState<"present" | "absent" | "late">("present");
  const [exportStartDate, setExportStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [exportEndDate, setExportEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrClass, setQrClass] = useState<Class | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTeacherId = localStorage.getItem("teacherId");
      if (!storedTeacherId) {
        router.push("/login/teacher");
        return;
      }
      const foundTeacher = mockTeachers.find((t) => t.id === storedTeacherId);
      setTeacher(foundTeacher || null);
    }
  }, [router]);

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const teacherClasses = getClassesForTeacher(teacher.id);
  const uniqueSubjects = Array.from(new Set(teacherClasses.map((cls) => cls.subject))).sort();

  // Get attendance for selected subject
  const subjectAttendance = selectedSubject ? getAttendanceForSubject(selectedSubject) : [];
  const attendanceDates = selectedSubject ? getAttendanceDatesForSubject(selectedSubject) : [];

  // Get students for selected subject
  const subjectStudents =
    selectedSubject && teacherClasses.length > 0
      ? mockStudents.filter((s) => {
        const firstClass = teacherClasses.find((c) => c.subject === selectedSubject);
        return firstClass?.studentIds.includes(s.id);
      })
      : [];

  const handleSubjectClick = (subject: string) => {
    setSelectedSubject(subject);
    setViewMode("attendance");
    setSelectedSession(null);
  };

  const handleBackToClasses = () => {
    setSelectedSubject(null);
    setViewMode("classes");
    setSelectedSession(null);
    setEditingRecord(null);
  };

  const handleEditAttendance = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setEditStatus(record.status);
    setEditReason(record.reason || "");
    setEditReasonOther("");
  };

  const handleSaveAttendance = () => {
    if (!editingRecord) return;

    // In a real app, this would update the database
    const finalReason = editReason === "Other (specify)" ? editReasonOther : editReason;

    alert(
      `Attendance updated for ${editingRecord.studentName}:\nStatus: ${editStatus}\nReason: ${finalReason || "N/A"}`
    );

    // Close modal
    setEditingRecord(null);
    setEditReason("");
    setEditReasonOther("");
  };

  const handleExportExcel = () => {
    if (!selectedSubject) return;

    const records = getAttendanceByDateRange(exportStartDate, exportEndDate).filter(
      (r) => r.subject === selectedSubject
    );

    // Group by date and prepare data
    const dateMap = new Map<string, AttendanceRecord[]>();
    records.forEach((record) => {
      if (!dateMap.has(record.date)) {
        dateMap.set(record.date, []);
      }
      dateMap.get(record.date)!.push(record);
    });

    // Create workbook
    const wb = XLSX.utils.book_new();

    // For each date, create a sheet
    Array.from(dateMap.keys())
      .sort()
      .reverse()
      .forEach((date) => {
        const dateRecords = dateMap.get(date)!;
        const classData = mockClasses.find((c) => c.id === dateRecords[0]?.classId);

        // Prepare data for Excel
        const excelData = [
          [
            "Serial No.",
            "USN",
            "Student Name",
            "Status",
            "Time",
            "Reason",
            "Marked By",
            "Edited By",
            "Edited At",
          ],
        ];

        // Get all enrolled students and their attendance
        const enrolledStudents = subjectStudents;
        enrolledStudents.forEach((student, index) => {
          const record = dateRecords.find((r) => r.studentId === student.id);
          excelData.push([
            (index + 1).toString(),
            student.usn,
            student.name,
            record?.status.toUpperCase() || "ABSENT",
            record?.time || "-",
            record?.reason || "-",
            record?.markedBy || "-",
            record?.editedBy || "-",
            record?.editedAt || "-",
          ]);
        });

        // Add class info at the top
        const sheetData = [
          [`Subject: ${selectedSubject}`, "", "", "", "", "", "", "", ""],
          [`Teacher: ${teacher.name}`, "", "", "", "", "", "", "", ""],
          [`Date: ${format(parseISO(date + "T00:00:00"), "MMM dd, yyyy")}`, "", "", "", "", "", "", "", ""],
          [`Time: ${classData?.startTime || ""} - ${classData?.endTime || ""}`, "", "", "", "", "", "", "", ""],
          [],
          ...excelData,
        ];

        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        const sheetName = format(parseISO(date + "T00:00:00"), "MMM-dd");
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });

    // Generate single sheet with all dates if multiple dates selected
    if (dateMap.size > 1) {
      const allData = [
        ["Date", "Serial No.", "USN", "Student Name", "Status", "Time", "Reason", "Marked By", "Edited By"],
      ];

      Array.from(dateMap.keys())
        .sort()
        .reverse()
        .forEach((date) => {
          const dateRecords = dateMap.get(date)!;
          const enrolledStudents = subjectStudents;

          enrolledStudents.forEach((student, index) => {
            const record = dateRecords.find((r) => r.studentId === student.id);
            allData.push([
              format(parseISO(date + "T00:00:00"), "MMM dd, yyyy"),
              (index + 1).toString(),
              student.usn,
              student.name,
              record?.status.toUpperCase() || "ABSENT",
              record?.time || "-",
              record?.reason || "-",
              record?.markedBy || "-",
              record?.editedBy || "-",
            ]);
          });
        });

      const ws = XLSX.utils.aoa_to_sheet(allData);
      XLSX.utils.book_append_sheet(wb, ws, "All Dates");
    }

    // Download file
    const fileName = `${selectedSubject}_Attendance_${exportStartDate}_to_${exportEndDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
    setShowExportModal(false);
  };

  const handleSessionClick = (session: Class) => {
    setSelectedSession(session);
    setViewMode("attendance");
    setSelectedSubject(session.subject);
  };

  const handleCreateSession = () => {
    // In a real app, this would create a new class session
    alert("Class session created successfully! It will appear in students' dashboards.");
    setShowCreateForm(false);
    setViewMode("classes");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Logo className="w-10 h-10" />
              <span className="text-2xl font-semibold text-gray-800">RollCall</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{teacher.name}</span>
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("teacherId");
                    localStorage.removeItem("userType");
                  }
                  router.push("/");
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === "classes" ? (
          // List of all classes (subjects)
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="mt-2 text-gray-600">Welcome, {teacher.name}</p>
              <p className="mt-1 text-sm text-gray-500">Select a class to view attendance and manage sessions</p>
            </div>

            {uniqueSubjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uniqueSubjects.map((subject) => {
                  const subjectClasses = teacherClasses.filter((cls) => cls.subject === subject);
                  const activeCount = subjectClasses.filter(
                    (cls) => cls.isActive && new Date() <= new Date(cls.expiresAt)
                  ).length;
                  const totalSessions = subjectClasses.length;

                  return (
                    <div
                      key={subject}
                      onClick={() => handleSubjectClick(subject)}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{subject}</h3>
                          <p className="text-sm text-gray-600">{teacher.department}</p>
                        </div>
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>Total Sessions:</span>
                          <span className="font-medium text-gray-900">{totalSessions}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Active Sessions:</span>
                          <span className="font-medium text-green-600">{activeCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Enrolled Students:</span>
                          <span className="font-medium text-gray-900">
                            {subjectClasses[0]?.studentIds.length || 0}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex space-x-2">
                          <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium">
                            View Attendance
                          </button>
                          {activeCount > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const activeClass = subjectClasses.find(
                                  (cls) => cls.isActive && new Date() <= new Date(cls.expiresAt)
                                );
                                if (activeClass) {
                                  setQrClass(activeClass);
                                  setShowQRModal(true);
                                }
                              }}
                              className="px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center"
                              title="Show QR Code"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-500 mb-4">No classes found. Contact administrator to add classes.</p>
              </div>
            )}

            <div className="mt-8">
              <button
                onClick={() => {
                  setViewMode("create");
                  setShowCreateForm(true);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                + Create New Class Session
              </button>
            </div>
          </>
        ) : viewMode === "attendance" && selectedSubject ? (
          // Attendance view for selected subject
          <AttendanceView
            subject={selectedSubject}
            students={subjectStudents}
            attendance={subjectAttendance}
            dates={attendanceDates}
            teacher={teacher}
            onBack={handleBackToClasses}
            onEdit={handleEditAttendance}
            onExport={() => setShowExportModal(true)}
            onSessionClick={handleSessionClick}
            sessions={teacherClasses.filter((c) => c.subject === selectedSubject)}
          />
        ) : viewMode === "create" ? (
          // Create class session form
          <CreateSessionForm
            teacher={teacher}
            students={mockStudents.filter((s) => s.course === teacher.department)}
            onBack={() => {
              setViewMode("classes");
              setShowCreateForm(false);
            }}
            onSubmit={handleCreateSession}
          />
        ) : null}

        {/* Edit Attendance Modal */}
        {editingRecord && (
          <EditAttendanceModal
            record={editingRecord}
            status={editStatus}
            reason={editReason}
            reasonOther={editReasonOther}
            onStatusChange={setEditStatus}
            onReasonChange={setEditReason}
            onReasonOtherChange={setEditReasonOther}
            onSave={handleSaveAttendance}
            onClose={() => {
              setEditingRecord(null);
              setEditReason("");
              setEditReasonOther("");
            }}
          />
        )}

        {/* Export Modal */}
        {showExportModal && selectedSubject && (
          <ExportModal
            subject={selectedSubject}
            startDate={exportStartDate}
            endDate={exportEndDate}
            onStartDateChange={setExportStartDate}
            onEndDateChange={setExportEndDate}
            onExport={handleExportExcel}
            onClose={() => setShowExportModal(false)}
            availableDates={attendanceDates}
          />
        )}

        {/* QR Code Modal */}
        {showQRModal && qrClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-8 text-center">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Class QR Code</h2>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">{qrClass.subject}</h3>
                <p className="text-gray-600">
                  {format(parseISO(qrClass.date + "T" + qrClass.startTime), "HH:mm")} - {format(parseISO(qrClass.date + "T" + qrClass.endTime), "HH:mm")}
                </p>
              </div>

              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <QRCodeSVG value={qrClass.qrCode} size={250} />
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                Ask students to scan this QR code using the RollCall app to mark their attendance.
              </p>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowQRModal(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Attendance View Component
function AttendanceView({
  subject,
  students,
  attendance,
  dates,
  teacher,
  onBack,
  onEdit,
  onExport,
  onSessionClick,
  sessions,
}: {
  subject: string;
  students: any[];
  attendance: AttendanceRecord[];
  dates: string[];
  teacher: any;
  onBack: () => void;
  onEdit: (record: AttendanceRecord) => void;
  onExport: () => void;
  onSessionClick: (session: Class) => void;
  sessions: Class[];
}) {
  const [selectedDate, setSelectedDate] = useState<string | "all">("all");
  const [selectedSessionId, setSelectedSessionId] = useState<string | "all">("all");

  // Filter attendance based on selected date and session
  const filteredAttendance =
    selectedDate === "all"
      ? attendance
      : attendance.filter((r) => r.date === selectedDate);

  const displayAttendance =
    selectedSessionId === "all"
      ? filteredAttendance
      : filteredAttendance.filter((r) => r.classId === selectedSessionId);

  // Get attendance for a specific session/date combination
  const getAttendanceForDate = (date: string, sessionId?: string) => {
    return attendance.filter((r) => {
      if (sessionId) return r.date === date && r.classId === sessionId;
      return r.date === date;
    });
  };

  return (
    <>
      <div className="mb-8">
        <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Classes
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{subject}</h1>
            <p className="mt-2 text-gray-600">Attendance Management</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </button>
            <button
              onClick={() => {
                // Navigate to create session
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Create Session
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Dates</option>
              {dates.map((date) => (
                <option key={date} value={date}>
                  {format(parseISO(date + "T00:00:00"), "MMM dd, yyyy")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Session</label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Sessions</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {format(parseISO(session.date + "T00:00:00"), "MMM dd")} - {session.startTime}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Student Attendance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serial No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  USN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayAttendance.length > 0 ? (
                displayAttendance.map((record, index) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {record.studentUSN}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.studentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {format(parseISO(record.date + "T00:00:00"), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === "present"
                            ? "bg-green-100 text-green-800"
                            : record.status === "late"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                      >
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {record.reason || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onEdit(record)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    No attendance records found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Also show students who haven't marked attendance */}
      {selectedDate !== "all" && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All Enrolled Students</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serial No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    USN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student, index) => {
                  const studentRecord = displayAttendance.find((r) => r.studentId === student.id);
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {student.usn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {studentRecord ? (
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${studentRecord.status === "present"
                                ? "bg-green-100 text-green-800"
                                : studentRecord.status === "late"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                          >
                            {studentRecord.status.toUpperCase()}
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            ABSENT
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {studentRecord ? (
                          <button
                            onClick={() => onEdit(studentRecord)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              // Create a new record for absent student
                              const newRecord: AttendanceRecord = {
                                id: `temp-${student.id}-${selectedDate}`,
                                classId: selectedSessionId !== "all" ? selectedSessionId : sessions[0]?.id || "",
                                className: subject,
                                subject: subject,
                                studentId: student.id,
                                studentName: student.name,
                                studentUSN: student.usn,
                                date: selectedDate !== "all" ? selectedDate : format(new Date(), "yyyy-MM-dd"),
                                time: format(new Date(), "HH:mm"),
                                status: "absent",
                                teacherId: teacher.id,
                                teacherName: teacher.name,
                              };
                              onEdit(newRecord);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            Mark Attendance
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

// Edit Attendance Modal Component
function EditAttendanceModal({
  record,
  status,
  reason,
  reasonOther,
  onStatusChange,
  onReasonChange,
  onReasonOtherChange,
  onSave,
  onClose,
}: {
  record: AttendanceRecord;
  status: "present" | "absent" | "late";
  reason: string;
  reasonOther: string;
  onStatusChange: (status: "present" | "absent" | "late") => void;
  onReasonChange: (reason: string) => void;
  onReasonOtherChange: (reason: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Edit Attendance</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
            <p className="text-sm text-gray-900">{record.studentName} ({record.studentUSN})</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <p className="text-sm text-gray-900">
              {format(parseISO(record.date + "T00:00:00"), "MMM dd, yyyy")}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value as "present" | "absent" | "late")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          {(status === "absent" || status === "late") && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason (if applicable)</label>
                <select
                  value={reason}
                  onChange={(e) => onReasonChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No reason</option>
                  {ATTENDANCE_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {reason === "Other (specify)" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specify Reason</label>
                  <textarea
                    value={reasonOther}
                    onChange={(e) => onReasonOtherChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter reason..."
                  />
                </div>
              )}
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export Modal Component
function ExportModal({
  subject,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onExport,
  onClose,
  availableDates,
}: {
  subject: string;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onExport: () => void;
  onClose: () => void;
  availableDates: string[];
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Export Attendance Sheet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <p className="text-sm text-gray-900">{subject}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {availableDates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Dates</label>
              <p className="text-xs text-gray-500">
                {availableDates.map((d) => format(parseISO(d + "T00:00:00"), "MMM dd, yyyy")).join(", ")}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onExport}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Create Session Form Component
function CreateSessionForm({
  teacher,
  students,
  onBack,
  onSubmit,
}: {
  teacher: any;
  students: any[];
  onBack: () => void;
  onSubmit: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(90);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  return (
    <>
      <div className="mb-8">
        <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Classes
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Class Session</h1>
        <p className="mt-2 text-gray-600">Create a new class session that will appear in students' dashboards</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject/Class Name *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Data Structures and Algorithms"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes) *</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              min="15"
              step="15"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Enrolled Students *</label>
            <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
              {students.map((student) => (
                <label key={student.id} className="flex items-center space-x-2 py-2">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleStudentToggle(student.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900">
                    {student.name} ({student.usn})
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">{selectedStudents.length} student(s) selected</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!subject || selectedStudents.length === 0) {
                alert("Please fill in all required fields and select at least one student.");
                return;
              }
              onSubmit();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Session
          </button>
        </div>
      </div>
    </>
  );
}
