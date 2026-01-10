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

const ABSENCE_REASONS = [
    "Medical/Health Issue",
    "Family Emergency",
    "Transportation Problem",
    "Technical Difficulties",
    "Competition/Event",
    "Personal Reason",
    "Other"
];

function MarkAttendanceContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const classId = searchParams.get("classId");
    const studentId = searchParams.get("studentId");

    const [status, setStatus] = useState<"loading" | "idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [classDetails, setClassDetails] = useState<any>(null);
    const [studentDetails, setStudentDetails] = useState<any>(null);
    const [showReasonForm, setShowReasonForm] = useState(false);
    const [selectedReason, setSelectedReason] = useState("");
    const [otherReason, setOtherReason] = useState("");

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

    const handleMarkAttendance = (attendanceStatus: "present" | "absent", reason?: string) => {
        if (!classDetails || !studentDetails) return;

        setStatus("loading");

        setTimeout(() => {
            try {
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
                    markedBy: "student",
                    reason: reason
                };

                mockAttendanceRecords.push(newRecord);

                setStatus("success");
                setMessage(attendanceStatus === "present"
                    ? "Attendance marked as PRESENT"
                    : `Marked as ABSENT - ${reason}`);
            } catch (err) {
                setStatus("error");
                setMessage("Failed to mark attendance");
            }
        }, 1000);
    };

    const handleAbsentClick = () => {
        setShowReasonForm(true);
    };

    const handleSubmitAbsence = () => {
        const finalReason = selectedReason === "Other" ? otherReason : selectedReason;
        if (!finalReason) {
            alert("Please select or enter a reason");
            return;
        }
        handleMarkAttendance("absent", finalReason);
    };

    if (!classId || !studentId) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <p className="text-red-600 font-medium">Invalid QR Code</p>
                    <p className="text-gray-500 text-sm mt-1">Missing class or student information</p>
                </div>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Success!</h1>
                <p className="text-gray-600 mb-8">{message}</p>
                <button
                    onClick={() => window.close()}
                    className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
                >
                    Close Window
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <Logo className="w-14 h-14 mx-auto mb-3" />
                    <h1 className="text-2xl font-bold text-gray-900">RollCall</h1>
                    <p className="text-gray-500 text-sm">Mark Your Attendance</p>
                </div>

                {classDetails && studentDetails ? (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Class Details Section */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                            <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">Class Details</p>
                            <h2 className="text-xl font-bold mb-2">{classDetails.subject}</h2>
                            <div className="flex items-center text-blue-100 text-sm space-x-4">
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {classDetails.startTime} - {classDetails.endTime}
                                </span>
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {classDetails.teacherName}
                                </span>
                            </div>
                        </div>

                        {/* Student Details */}
                        <div className="p-6 border-b border-gray-100">
                            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Student</p>
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                                    <span className="text-xl font-bold text-gray-600">{studentDetails.name[0]}</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{studentDetails.name}</p>
                                    <p className="text-gray-500 font-mono text-sm">{studentDetails.usn}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Section */}
                        <div className="p-6">
                            {!showReasonForm ? (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleMarkAttendance("present")}
                                        disabled={status === "loading"}
                                        className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {status === "loading" ? (
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                        ) : (
                                            <>
                                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Mark Present
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleAbsentClick}
                                        disabled={status === "loading"}
                                        className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium text-lg hover:border-red-300 hover:bg-red-50 focus:ring-4 focus:ring-red-100 transition-all disabled:opacity-50"
                                    >
                                        Can't Attend? Provide Reason
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="font-medium text-gray-900">Select reason for absence:</p>
                                    <select
                                        value={selectedReason}
                                        onChange={(e) => setSelectedReason(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">-- Select a reason --</option>
                                        {ABSENCE_REASONS.map((reason) => (
                                            <option key={reason} value={reason}>{reason}</option>
                                        ))}
                                    </select>

                                    {selectedReason === "Other" && (
                                        <textarea
                                            value={otherReason}
                                            onChange={(e) => setOtherReason(e.target.value)}
                                            placeholder="Please specify your reason..."
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            rows={3}
                                        />
                                    )}

                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => setShowReasonForm(false)}
                                            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleSubmitAbsence}
                                            disabled={status === "loading"}
                                            className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {status === "loading" ? "Submitting..." : "Submit Absence"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-500 mt-4">Loading class details...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MarkAttendancePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>}>
            <MarkAttendanceContent />
        </Suspense>
    );
}
