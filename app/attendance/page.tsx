"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import { mockAttendanceRecords, mockClasses, mockStudents, mockTeachers } from "@/data/mockData";
import { format, parseISO } from "date-fns";

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredRecords = mockAttendanceRecords.filter((record) => {
    const dateMatch = record.date === selectedDate || selectedDate === "";
    const classMatch = selectedClass === "all" || record.classId === selectedClass;
    const statusMatch = selectedStatus === "all" || record.status === selectedStatus;
    return dateMatch && classMatch && statusMatch;
  });

  // Get unique dates for filter
  const uniqueDates = Array.from(new Set(mockAttendanceRecords.map((r) => r.date))).sort().reverse();

  // Get unique classes for filter
  const uniqueClassIds = Array.from(new Set(mockAttendanceRecords.map((r) => r.classId)));

  // Get statistics for selected date and class
  const dateRecords = mockAttendanceRecords.filter((r) => {
    const dateMatch = r.date === selectedDate || selectedDate === "";
    const classMatch = selectedClass === "all" || r.classId === selectedClass;
    return dateMatch && classMatch;
  });

  const presentCount = dateRecords.filter((r) => r.status === "present").length;
  const lateCount = dateRecords.filter((r) => r.status === "late").length;
  const absentCount = dateRecords.length > 0 ? dateRecords.filter((r) => r.status === "absent").length : 0;

  // Group records by class
  const recordsByClass = filteredRecords.reduce((acc, record) => {
    if (!acc[record.classId]) {
      acc[record.classId] = [];
    }
    acc[record.classId].push(record);
    return acc;
  }, {} as Record<string, typeof mockAttendanceRecords>);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Attendance Records</h1>
          <p className="mt-2 text-gray-600">View and filter attendance records by class and date</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Filters</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <select
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Dates</option>
                  {uniqueDates.map((date) => (
                    <option key={date} value={date}>
                      {format(parseISO(date + "T00:00:00"), "MMM dd, yyyy")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-2">
                  Class
                </label>
                <select
                  id="class"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Classes</option>
                  {uniqueClassIds.map((classId) => {
                    const classData = mockClasses.find((c) => c.id === classId);
                    return classData ? (
                      <option key={classId} value={classId}>
                        {classData.name}
                      </option>
                    ) : null;
                  })}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-600">{presentCount}</div>
                <div className="text-sm text-green-700 mt-1">Present</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-3xl font-bold text-yellow-600">{lateCount}</div>
                <div className="text-sm text-yellow-700 mt-1">Late</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-3xl font-bold text-red-600">{absentCount}</div>
                <div className="text-sm text-red-700 mt-1">Absent</div>
              </div>
            </div>
          </div>

          {/* Summary Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Records:</span>
                <span className="font-medium text-gray-900">{filteredRecords.length}</span>
              </div>
              {selectedDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900">
                    {format(parseISO(selectedDate + "T00:00:00"), "MMM dd, yyyy")}
                  </span>
                </div>
              )}
              {selectedClass !== "all" && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Class:</span>
                  <span className="font-medium text-gray-900">
                    {mockClasses.find((c) => c.id === selectedClass)?.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attendance Records by Class */}
        <div className="space-y-6">
          {Object.keys(recordsByClass).map((classId) => {
            const classData = mockClasses.find((c) => c.id === classId);
            const classRecords = recordsByClass[classId];

            return (
              <div key={classId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {classData?.name || "Unknown Class"}
                      </h2>
                      {classData && (
                        <p className="text-sm text-gray-600 mt-1">
                          {format(parseISO(classData.date + "T00:00:00"), "MMM dd, yyyy")} • {classData.startTime} - {classData.endTime} • {classData.teacherName}
                        </p>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                      {classRecords.length} student{classRecords.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {classRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {record.studentName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {record.studentUSN}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.time}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                record.status === "present"
                                  ? "bg-green-100 text-green-800"
                                  : record.status === "late"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {filteredRecords.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No attendance records found for the selected filters.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
