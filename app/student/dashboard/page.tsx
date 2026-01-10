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
  const ongoingClasses = getOngoingClasses().filter((cls) => cls.studentIds.includes(student.id));
  const upcomingClasses = getUpcomingClasses().filter((cls) => cls.studentIds.includes(student.id));

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

        {/* Attendance Percentage by Subject */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Attendance Percentage by Subject</h2>
          {attendanceData.length > 0 ? (
            <div className="space-y-6">
              {attendanceData.map((item) => (
                <div key={item.subject}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.subject}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {item.percentage}% ({item.present}/{item.total})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div
                      className={`h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white ${
                        item.percentage >= 75
                          ? "bg-green-500"
                          : item.percentage >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    >
                      {item.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No attendance records yet.</p>
          )}
        </div>

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
                    <p className="text-xs text-gray-500 mt-2">Click to scan QR code</p>
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

// QR Modal Component
function QRModal({ classItem, onScan, onClose }: { classItem: any; onScan: (qrCode: string) => void; onClose: () => void }) {
  const [scanning, setScanning] = useState(true);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !scanning) return;

    const startScanner = () => {
      try {
        const html5QrcodeScanner = new Html5QrcodeScanner(
          "qr-reader-modal",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          false
        );

        html5QrcodeScanner.render(
          (decodedText: string) => {
            onScan(decodedText);
            if (scannerRef.current) {
              scannerRef.current.clear().catch(() => {});
            }
            setScanning(false);
          },
          () => {}
        );

        scannerRef.current = html5QrcodeScanner;
        setScanner(html5QrcodeScanner);
      } catch (error) {
        console.error("Error starting scanner:", error);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [scanning, onScan]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Scan Class QR Code</h2>
          <button
            onClick={() => {
              if (scannerRef.current) {
                scannerRef.current.clear().catch(() => {});
              }
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mb-4">
          <div id="qr-reader-modal" className="mb-4"></div>
          <p className="text-sm text-gray-600 text-center">Position QR code within the frame</p>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Class Information:</p>
          <p className="text-sm text-gray-600">Subject: {classItem.subject}</p>
          <p className="text-sm text-gray-600">Teacher: {classItem.teacherName}</p>
          <p className="text-sm text-gray-600">Time: {classItem.startTime} - {classItem.endTime}</p>
        </div>
        <div className="mt-4 flex justify-center">
          <QRCodeSVG value={classItem.qrCode} size={150} className="border border-gray-200 rounded p-2" />
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
                          className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                            student.status === "present"
                              ? "bg-green-600 text-white"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => onMarkAttendance(student.id, "absent")}
                          className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                            student.status === "absent"
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

