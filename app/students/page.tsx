"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import { mockStudents, getClassesForStudent, isClassQRCodeValid } from "@/data/mockData";
import { format, parseISO } from "date-fns";
import { QRCodeSVG } from "qrcode.react";

export default function StudentsPage() {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("1");

  const selectedStudent = mockStudents.find((s) => s.id === selectedStudentId);
  const studentClasses = selectedStudent ? getClassesForStudent(selectedStudentId) : [];
  const activeClasses = studentClasses.filter((cls) => isClassQRCodeValid(cls));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="mt-2 text-gray-600">View student information and their active classes</p>
        </div>

        {/* Student Selector */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <label className="block text-sm font-medium text-blue-900 mb-2">Select Student:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-blue-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {mockStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.rollNumber}) - {student.course}
              </option>
            ))}
          </select>
        </div>

        {/* Student Info Card */}
        {selectedStudent && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.name}</h2>
                <p className="text-gray-600 mt-1">
                  {selectedStudent.rollNumber} • {selectedStudent.course}
                </p>
                <p className="text-sm text-gray-500 mt-1">{selectedStudent.email}</p>
              </div>
            </div>

            {/* Active Classes for this student */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Classes</h3>
              {activeClasses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeClasses.map((classItem) => (
                    <div
                      key={classItem.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{classItem.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{classItem.teacherName}</p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          Active
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1 mb-3">
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
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 font-mono break-all mb-2">{classItem.qrCode}</p>
                        <QRCodeSVG value={classItem.qrCode} size={120} className="mx-auto border border-gray-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No active classes found for this student.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Students Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Students</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockStudents.map((student) => (
                  <tr
                    key={student.id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedStudentId === student.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedStudentId(student.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.rollNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.course}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">View Classes</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
