"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    mockClasses,
    mockStudents,
    mockAttendanceRecords,
    AttendanceRecord
} from "@/data/mockData";
import { format } from "date-fns";
import Logo from "@/components/Logo";

function MarkAttendanceContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const classId = searchParams.get("classId");
    const studentId = searchParams.get("studentId");

    const [status, setStatus] = useState<"loading" | "idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [classDetails, setClassDetails] = useState<any>(null);
    const [studentDetails, setStudentDetails] = useState<any>(null);

    useEffect(() => {
        if (classId && studentId) {
            const cls = mockClasses.find((c) => c.id === classId);
            const stu = mockStudents.find((s) => s.id === studentId);

            setClassDetails(cls || null);
            setStudentDetails(stu || null);

            if (!cls || !stu) {
                setStatus("error");
                setMessage("Invalid Class or Student ID");
            }
        }
    }, [classId, studentId]);

    const handleMarkAttendance = (attendanceStatus: "present" | "absent") => {
        if (!classDetails || !studentDetails) return;

        setStatus("loading");

        // Simulate API delay
        setTimeout(() => {
            try {
                // Create new record
                const newRecord: AttendanceRecord = {
                    id: `att-${Date.now()}`,
                    classId: classDetails.id,
                    className: classDetails.name,
                    subject: classDetails.subject,
                    studentId: studentDetails.id,
                    studentName: studentDetails.name,
                    studentUSN: studentDetails.usn,
                    teacherId: classDetails.teacherId,
                    teacherName: classDetails.teacherName,
                    date: new Date().toISOString().split('T')[0],
                    time: format(new Date(), "HH:mm"),
                    status: attendanceStatus,
                    markedBy: "student"
                };

                // Add to mock data (in-memory)
                mockAttendanceRecords.push(newRecord);

                setStatus("success");
                setMessage(`Successfully marked as ${attendanceStatus.toUpperCase()}`);
            } catch (err) {
                setStatus("error");
                setMessage("Failed to mark attendance");
            }
        }, 1000);
    };

    if (!classId || !studentId) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <p className="text-red-600">Missing parameters</p>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Success!</h1>
                <p className="text-gray-600 mb-8">{message}</p>
                <button
                    onClick={() => window.close()}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                >
                    Close Window
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <Logo className="w-12 h-12" />
                    </div>

                    <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">Mark Attendance</h2>

                    {classDetails && studentDetails ? (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h3 className="text-sm font-medium text-blue-800 uppercase tracking-wide mb-2">Class Details</h3>
                                <p className="text-lg font-semibold text-gray-900">{classDetails.subject}</p>
                                <p className="text-gray-600">{classDetails.teacherName}</p>
                                <p className="text-sm text-gray-500 mt-1">{classDetails.startTime} - {classDetails.endTime}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h3 className="text-sm font-medium text-gray-800 uppercase tracking-wide mb-2">Student</h3>
                                <p className="text-lg font-semibold text-gray-900">{studentDetails.name}</p>
                                <p className="font-mono text-gray-600">{studentDetails.usn}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <button
                                    onClick={() => handleMarkAttendance("present")}
                                    disabled={status === "loading"}
                                    className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg shadow-sm hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-50"
                                >
                                    Present
                                </button>
                                <button
                                    onClick={() => handleMarkAttendance("absent")}
                                    disabled={status === "loading"}
                                    className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg shadow-sm hover:bg-red-700 focus:ring-4 focus:ring-red-200 transition-all disabled:opacity-50"
                                >
                                    Absent
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function MarkAttendancePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MarkAttendanceContent />
        </Suspense>
    );
}
