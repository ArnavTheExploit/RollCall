"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import {
  mockStudents,
  mockClasses,
  getAttendancePercentageBySubject,
  getOngoingClasses,
  getUpcomingClasses,
  getClassesForStudent,
  getStudentAttendanceStats,
  getRecentAttendanceForStudent,
  getAttendanceForStudent,
  mockAttendanceRecords,
} from "@/data/mockData";
import { format, parseISO } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { findClassByQRCode, isClassQRCodeValid } from "@/data/mockData";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [student, setStudent] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [scannedClass, setScannedClass] = useState<any>(null);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("all");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("all");

  useEffect(() => {
    // Get student ID from localStorage
    if (typeof window !== "undefined") {
      const storedStudentId = localStorage.getItem("studentId");
      if (!storedStudentId) {
        router.push("/login/student");
        return;
      }
      setStudentId(storedStudentId);
      const foundStudent = mockStudents.find((s) => s.id === storedStudentId);
      setStudent(foundStudent || null);
    }
  }, [router]);

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const attendanceData = getAttendancePercentageBySubject(student.id);
  const attendanceStats = getStudentAttendanceStats(student.id);
  const recentAttendance = getRecentAttendanceForStudent(student.id, 10);
  const allAttendance = getAttendanceForStudent(student.id);
  const ongoingClasses = getOngoingClasses().filter((cls) => cls.studentIds.includes(student.id));
  const upcomingClasses = getUpcomingClasses().filter((cls) => cls.studentIds.includes(student.id));

  // Get unique subjects for filter
  const uniqueSubjects = Array.from(new Set(allAttendance.map((r) => r.subject))).sort();
  const uniqueDates = Array.from(new Set(allAttendance.map((r) => r.date))).sort().reverse();

  // Filter attendance based on selected filters
  const filteredAttendance = allAttendance.filter((record) => {
    const subjectMatch = selectedSubjectFilter === "all" || record.subject === selectedSubjectFilter;
    const dateMatch = selectedDateFilter === "all" || record.date === selectedDateFilter;
    return subjectMatch && dateMatch;
  });

  const handleClassClick = (classItem: any) => {
    // Check if class is active
    const now = new Date();
    const startTime = new Date(classItem.date + "T" + classItem.startTime);
    const endTime = new Date(classItem.expiresAt);

    if (now >= startTime && now <= endTime) {
      setSelectedClass(classItem);
      setShowQRModal(true);
    } else if (now < startTime) {
      alert(`This class hasn't started yet. It will start at ${classItem.startTime}`);
    } else {
      alert("This class has ended. QR code has expired.");
    }
  };

  const handleQRScan = (qrCode: string) => {
    const classData = findClassByQRCode(qrCode);
    if (!classData) {
      alert("Invalid QR code. Please scan a valid class QR code.");
      return;
    }

    if (!isClassQRCodeValid(classData)) {
      alert(`This QR code has expired. Class ended at ${format(parseISO(classData.expiresAt), "HH:mm")}.`);
      return;
    }

    // Check if student is enrolled
    if (!classData.studentIds.includes(student.id)) {
      alert("You are not enrolled in this class.");
      return;
    }

    // Get all students for this class
    const classStudents = mockStudents
      .filter((s) => classData.studentIds.includes(s.id))
      .map((s, index) => ({
        serialNo: index + 1,
        id: s.id,
        name: s.name,
        usn: s.usn,
        status: null as "present" | "absent" | null,
      }));

    setScannedClass(classData);
    setAttendanceList(classStudents);
    setShowQRModal(false);
    setShowAttendanceModal(true);
  };

  const handleMarkAttendance = (studentIdToMark: string, status: "present" | "absent") => {
    setAttendanceList((prev) =>
      prev.map((item) => (item.id === studentIdToMark ? { ...item, status } : item))
    );
  };

  const handleSubmitAttendance = () => {
    const markedCount = attendanceList.filter((item) => item.status !== null).length;
    if (markedCount === 0) {
      alert("Please mark at least one student's attendance.");
      return;
    }

    alert(`Attendance marked successfully! ${markedCount} student(s) marked.`);
    setShowAttendanceModal(false);
    setScannedClass(null);
    setAttendanceList([]);
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
              <span className="text-sm text-gray-600">
                {student.name} ({student.usn})
              </span>
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("studentId");
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {student.name}!</p>
        </div>

        {/* Overall Attendance Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Attendance</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{attendanceStats.overallPercentage}%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{attendanceStats.present}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{attendanceStats.absent}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Late</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{attendanceStats.late}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Percentage by Subject - Vertical Bar Graph */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Attendance Percentage by Subject</h2>
          {attendanceData.length > 0 ? (
            <div className="w-full overflow-x-auto">
              {/* Graph Container */}
              <div className="h-64 flex items-end space-x-8 min-w-max px-4 pt-10 pb-2">
                {attendanceData.map((item) => (
                  <div key={item.subject} className="flex flex-col items-center group relative">

                    {/* Tooltip on Hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 pointer-events-none">
                      {item.percentage}% ({item.present}/{item.total} classes)
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>

                    {/* Percentage Label on Top of Bar */}
                    <span className="text-xs font-semibold text-gray-600 mb-1">{item.percentage}%</span>

                    {/* The Bar */}
                    <div
                      className={`w-12 rounded-t-md transition-all duration-500 ease-out relative ${item.percentage >= 75
                        ? "bg-green-500 hover:bg-green-600"
                        : item.percentage >= 60
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-red-500 hover:bg-red-600"
                        }`}
                      style={{ height: `${Math.max(item.percentage, 5) * 2}px`, maxHeight: '200px' }} // Scaling height
                    >
                    </div>

                    {/* Subject Label */}
                    <div className="mt-3 w-16 text-center">
                      <p className="text-xs font-medium text-gray-700 truncate w-full" title={item.subject}>
                        {item.subject.split(' ').map(word => word[0]).join('')} {/* Initials for compactness if needed, or truncate */}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate w-full group-hover:overflow-visible group-hover:whitespace-normal group-hover:absolute group-hover:bg-white group-hover:z-20 group-hover:shadow-md group-hover:p-1 group-hover:rounded group-hover:w-32 group-hover:-ml-8 group-hover:text-center">
                        {item.subject}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {/* X-Axis Line */}
              <div className="h-px bg-gray-300 w-full min-w-max mt-2"></div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No attendance records yet.</p>
          )}
        </div>

        {/* Detailed Attendance History */}
        {allAttendance.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Attendance History</h2>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Subject</label>
                <select
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Subjects</option>
                  {uniqueSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
                <select
                  value={selectedDateFilter}
                  onChange={(e) => setSelectedDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Dates</option>
                  {uniqueDates.map((date) => (
                    <option key={date} value={date}>
                      {format(parseISO(date + "T00:00:00"), "MMM dd, yyyy")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teacher
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAttendance.length > 0 ? (
                    filteredAttendance
                      .sort((a, b) => {
                        const dateA = new Date(`${a.date}T${a.time}`);
                        const dateB = new Date(`${b.date}T${b.time}`);
                        return dateB.getTime() - dateA.getTime();
                      })
                      .map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(parseISO(record.date + "T00:00:00"), "MMM dd, yyyy")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {record.subject}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.time}</td>
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.teacherName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {record.reason || "-"}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                        No attendance records found for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Statistics Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{filteredAttendance.length}</p>
                  <p className="text-xs text-gray-600 mt-1">Total Records</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredAttendance.filter((r) => r.status === "present").length}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Present</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {filteredAttendance.filter((r) => r.status === "absent").length}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Absent</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {filteredAttendance.filter((r) => r.status === "late").length}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Late</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Attendance */}
        {recentAttendance.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Attendance</h2>
            <div className="space-y-3">
              {recentAttendance.slice(0, 5).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-3 h-3 rounded-full ${record.status === "present"
                        ? "bg-green-500"
                        : record.status === "late"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                        }`}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{record.subject}</p>
                      <p className="text-xs text-gray-500">
                        {format(parseISO(record.date + "T00:00:00"), "MMM dd, yyyy")} at {record.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${record.status === "present"
                        ? "bg-green-100 text-green-800"
                        : record.status === "late"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {record.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">{record.teacherName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ongoing Classes */}
        {ongoingClasses.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ongoing Classes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ongoingClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleClassClick(classItem)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{classItem.subject}</h3>
                      <p className="text-sm text-gray-600 mt-1">{classItem.teacherName}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      Ongoing
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {classItem.startTime} - {classItem.endTime}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Tap to view QR code</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Classes */}
        {upcomingClasses.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Classes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{classItem.subject}</h3>
                      <p className="text-sm text-gray-600 mt-1">{classItem.teacherName}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      Upcoming
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {format(parseISO(classItem.date + "T00:00:00"), "MMM dd, yyyy")}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {classItem.startTime} - {classItem.endTime}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {ongoingClasses.length === 0 && upcomingClasses.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No ongoing or upcoming classes at the moment.</p>
          </div>
        )}
      </main>

      {/* QR Modal */}
      {showQRModal && selectedClass && (
        <QRModal
          classItem={selectedClass}
          studentId={studentId || ""}
          onScan={handleQRScan}
          onClose={() => {
            setShowQRModal(false);
            setSelectedClass(null);
          }}
        />
      )}

      {/* Attendance List Modal */}
      {showAttendanceModal && scannedClass && (
        <AttendanceListModal
          classItem={scannedClass}
          attendanceList={attendanceList}
          onMarkAttendance={handleMarkAttendance}
          onSubmit={handleSubmitAttendance}
          onClose={() => {
            setShowAttendanceModal(false);
            setScannedClass(null);
            setAttendanceList([]);
          }}
        />
      )}
    </div>
  );
}

// QR Modal Component - Displays QR Code for Teacher to Scan
// QR Modal Component - Displays QR Code for Teacher to Scan
function QRModal({ classItem, studentId, onScan, onClose }: { classItem: any; studentId: string; onScan: (qrCode: string) => void; onClose: () => void }) {
  // Generate personalized QR Code Value
  // Format: "ATTENDANCE:ClassID:StudentID:Date:Time"
  const timestamp = new Date().toISOString();
  // Using a simpler string format that's easy to scan/parse or just a JSON string
  const qrValue = JSON.stringify({
    type: "student_attendance",
    classId: classItem.id,
    studentId: studentId,
    timestamp: timestamp,
    // Add validUntil to ensure it's related to the class session
    validUntil: classItem.expiresAt
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Mark Attendance</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center">
          <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 shadow-sm mb-6">
            <QRCodeSVG
              value={qrValue}
              size={200}
              level={"H"}
              includeMargin={true}
            />
          </div>

          <div className="text-center space-y-2">
            <h4 className="font-medium text-gray-900">{classItem.subject}</h4>
            <p className="text-sm text-gray-500">
              {classItem.startTime} - {classItem.endTime}
            </p>
            <p className="text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full inline-block mt-2">
              Present this QR to your teacher
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
          <button
            onClick={onClose}
            className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Attendance List Modal Component
function AttendanceListModal({
  classItem,
  attendanceList,
  onMarkAttendance,
  onSubmit,
  onClose,
}: {
  classItem: any;
  attendanceList: any[];
  onMarkAttendance: (studentId: string, status: "present" | "absent") => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Mark Attendance</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Class Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">{classItem.subject}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">Teacher:</span> {classItem.teacherName}
            </div>
            <div>
              <span className="font-medium">Time:</span> {classItem.startTime} - {classItem.endTime}
            </div>
            <div className="col-span-2">
              <span className="font-medium">Class Attendance:</span> {format(parseISO(classItem.date + "T00:00:00"), "MMM dd, yyyy")}
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serial No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    USN
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mark Attendance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceList.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.serialNo}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{student.usn}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onMarkAttendance(student.id, "present")}
                          className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${student.status === "present"
                            ? "bg-green-600 text-white"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => onMarkAttendance(student.id, "absent")}
                          className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${student.status === "absent"
                            ? "bg-red-600 text-white"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                            }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit Attendance
          </button>
        </div>
      </div>
    </div>
  );
}

