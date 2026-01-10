"use client";

import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import { Html5QrcodeScanner } from "html5-qrcode";
import { mockStudents, findClassByQRCode, isClassQRCodeValid, mockAttendanceRecords, mockClasses } from "@/data/mockData";
import { format, parseISO } from "date-fns";

export default function ScanPage() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [attendanceRecorded, setAttendanceRecorded] = useState(false);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [studentId, setStudentId] = useState<string>("1"); // In real app, from auth

  useEffect(() => {
    if (typeof window === "undefined") return;

    const recordAttendance = (classData: any, student: any, startScannerCallback: () => void) => {
      // Check if student is enrolled in this class
      if (!classData.studentIds.includes(student.id)) {
        alert(`You are not enrolled in ${classData.name}. Only enrolled students can mark attendance.`);
        startScannerCallback();
        return;
      }

      // Check if already marked attendance for this class today
      const existingRecord = mockAttendanceRecords.find(
        (record) =>
          record.classId === classData.id &&
          record.studentId === student.id &&
          record.date === format(new Date(), "yyyy-MM-dd")
      );

      if (existingRecord) {
        alert(`You have already marked attendance for ${classData.name} today.`);
        startScannerCallback();
        return;
      }

      // Simulate recording attendance
      const now = new Date();
      const time = format(now, "HH:mm");
      const classStartTime = new Date(classData.date + "T" + classData.startTime);

      // Determine if late (after 15 minutes from start time)
      const lateThreshold = new Date(classStartTime.getTime() + 15 * 60000);
      const isLate = now > lateThreshold;
      const status = isLate ? "late" : "present";

      console.log(`Attendance recorded for ${student.name} in ${classData.name} at ${time} - Status: ${status}`);
      setAttendanceRecorded(true);

      // Auto-reset after 3 seconds
      setTimeout(() => {
        setAttendanceRecorded(false);
        setScannedResult(null);
        setClassInfo(null);
        startScannerCallback();
      }, 3000);
    };

    const handleScanSuccess = (decodedText: string, startScannerCallback: () => void) => {
      setScannedResult(decodedText);

      // Find class by QR code
      const classData = findClassByQRCode(decodedText);

      if (classData) {
        // Check if QR code is still valid
        if (!isClassQRCodeValid(classData)) {
          alert(`This QR code has expired. Class ended at ${format(parseISO(classData.expiresAt), "HH:mm")}.`);
          startScannerCallback();
          return;
        }

        setClassInfo(classData);

        // Get current student (in real app, from authentication)
        const student = mockStudents.find((s) => s.id === studentId);
        if (student) {
          // Stop scanner
          if (scannerRef.current) {
            scannerRef.current.clear().catch(() => { });
            scannerRef.current = null;
          }

          recordAttendance(classData, student, startScannerCallback);
        }
      } else {
        alert("Invalid QR code. Please scan a valid class QR code.");
        startScannerCallback();
      }
    };

    const startScanner = () => {
      try {
        // Clear existing scanner if any
        if (scannerRef.current) {
          scannerRef.current.clear().catch(() => { });
        }

        const html5QrcodeScanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          false
        );

        html5QrcodeScanner.render(
          (decodedText) => {
            handleScanSuccess(decodedText, startScanner);
          },
          () => {
            // Ignore error messages for continuous scanning
          }
        );

        scannerRef.current = html5QrcodeScanner;
      } catch (error) {
        console.error("Error starting scanner:", error);
      }
    };

    // Start scanner on mount
    if (!attendanceRecorded) {
      startScanner();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => { });
        scannerRef.current = null;
      }
    };
  }, [attendanceRecorded, studentId]);

  const handleManualTest = (qrCode: string) => {
    const classData = findClassByQRCode(qrCode);
    if (classData) {
      if (!isClassQRCodeValid(classData)) {
        alert(`This QR code has expired. Class ended at ${format(parseISO(classData.expiresAt), "HH:mm")}.`);
        return;
      }

      setClassInfo(classData);
      setScannedResult(qrCode);

      const student = mockStudents.find((s) => s.id === studentId);
      if (student) {
        if (!classData.studentIds.includes(student.id)) {
          alert(`You are not enrolled in ${classData.name}.`);
          return;
        }

        if (scannerRef.current) {
          scannerRef.current.clear().catch(() => { });
          scannerRef.current = null;
        }

        setAttendanceRecorded(true);

        // Auto-reset after 3 seconds
        setTimeout(() => {
          setAttendanceRecorded(false);
          setScannedResult(null);
          setClassInfo(null);
          // Restart will happen via useEffect
        }, 3000);
      }
    } else {
      alert("Invalid QR code.");
    }
  };

  // Get active classes for testing
  const activeClassesForStudent = mockStudents
    .filter((s) => s.id === studentId)
    .flatMap((student) => {
      return mockClasses.filter((cls) => cls.studentIds.includes(student.id) && isClassQRCodeValid(cls));
    });

  const currentStudent = mockStudents.find((s) => s.id === studentId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Scan Class QR Code</h1>
          <p className="mt-2 text-gray-600">
            Scan your class QR code to mark attendance (Currently logged in as: {currentStudent?.name || "Student"})
          </p>
        </div>

        {/* Student Selector */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <label className="block text-sm font-medium text-blue-900 mb-2">Select Student (for testing):</label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-blue-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {mockStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.usn}) - {student.course}
              </option>
            ))}
          </select>
        </div>

        {attendanceRecorded && classInfo ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Attendance Recorded!</h2>
              <p className="text-lg text-gray-600 mb-2">
                <span className="font-semibold">{currentStudent?.name}</span> - {currentStudent?.usn}
              </p>
              <p className="text-lg text-gray-900 mb-2">
                Class: <span className="font-semibold">{classInfo.name}</span>
              </p>
              <p className="text-sm text-gray-500">
                Time: {format(new Date(), "HH:mm")} | Date: {format(new Date(), "MMM dd, yyyy")}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div id="qr-reader" className="mb-4"></div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Position class QR code within the frame</p>
            </div>
          </div>
        )}

        {activeClassesForStudent.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Test with Active Class QR Codes</h3>
            <p className="text-sm text-blue-700 mb-4">Click on a class to simulate scanning:</p>
            <div className="space-y-2">
              {activeClassesForStudent.map((classItem) => (
                <button
                  key={classItem.id}
                  onClick={() => handleManualTest(classItem.qrCode)}
                  className="w-full text-left bg-white hover:bg-blue-50 border border-blue-200 rounded-md p-4 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium text-gray-900">{classItem.name}</span>
                      <span className="text-gray-600 ml-2">({classItem.course})</span>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(parseISO(classItem.date + "T00:00:00"), "MMM dd")} • {classItem.startTime} - {classItem.endTime}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-2 break-all">{classItem.qrCode}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Ensure camera permissions are granted</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Hold the class QR code steady within the scanner frame</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>You must be enrolled in the class to mark attendance</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>QR codes expire after the class end time</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>You can only mark attendance once per class session</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
