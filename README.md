# RollCall - QR Based Attendance System

A simple and formal frontend-only attendance management system built with Next.js, React, and Tailwind CSS. RollCall uses class-based QR codes where teachers generate QR codes for their classes, and students scan these QR codes to mark their attendance.

## Features

- 📊 **Dashboard**: Overview of students, teachers, active classes, and attendance statistics
- 👨‍🏫 **Teacher Dashboard**: Create class sessions and generate unique QR codes for each class
- 📱 **QR Code Scanning**: Students scan class QR codes to mark attendance (QR codes expire after class time)
- 👥 **Student Management**: View student information and their active classes
- 📝 **Attendance Records**: View and filter attendance records by class, date, and status
- ⏰ **Time-Based Expiration**: QR codes automatically expire after class end time
- 🎨 **Modern UI**: Clean, light-themed interface with responsive design

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **QR Code Generation**: qrcode.react
- **QR Code Scanning**: html5-qrcode
- **Date Utilities**: date-fns
- **Runtime**: Node.js

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository or navigate to the project directory:
```bash
cd RollCall
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
RollCall/
├── app/
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Dashboard/Home page
│   ├── globals.css            # Global styles
│   ├── scan/                  # QR scanner page (for students)
│   ├── teacher-dashboard/     # Teacher dashboard for managing classes
│   ├── students/              # Students list page
│   ├── teachers/              # Teachers list page
│   └── attendance/            # Attendance records page
├── components/
│   ├── Logo.tsx               # Logo component (SVG)
│   └── Navigation.tsx         # Navigation bar component
├── data/
│   └── mockData.ts            # Mock data for students, teachers, classes, and attendance
└── public/                    # Static assets (if any)
```

## Mock Data

The application includes pre-populated mock data:

- **8 Students** enrolled in various courses
- **3 Teachers** across different departments (Computer Science, Mathematics, Physics)
- **5 Classes** with active and expired sessions
- **Attendance Records** linked to specific classes

## Pages

### Dashboard (`/`)
- Overview statistics (total students, teachers, active classes, present/late today)
- Active classes for today
- Quick action buttons (Scan QR, Teacher Dashboard, View Attendance)
- Recent attendance records grouped by class

### Teacher Dashboard (`/teacher-dashboard`)
- Create new class sessions with date, time, duration, and enrolled students
- View all classes (active and expired)
- Generate and display QR codes for each class
- QR codes automatically expire after class end time
- View enrolled students for each class

### Scan QR Code (`/scan`)
- Real-time QR code scanner using device camera
- Students scan **class QR codes** (not individual student codes)
- Validates that student is enrolled in the class
- Checks if QR code is still active (not expired)
- Prevents duplicate attendance marking for same class
- Test buttons for simulating class QR code scans
- Success confirmation after scanning
- Auto-reset after 3 seconds for continuous scanning

### Students (`/students`)
- Select a student to view their information
- View active classes that the student is enrolled in
- Display QR codes for active classes
- Table view of all students with their details

### Teachers (`/teachers`)
- Grid view of teachers with department information
- Table view with teacher contact details

### Attendance (`/attendance`)
- Filterable attendance records by class, date, and status
- Statistics for selected filters
- Attendance grouped by class
- Detailed attendance history showing which class each attendance record belongs to

## Usage

### For Teachers:

1. **Creating Classes and Generating QR Codes**:
   - Navigate to "Teacher Dashboard"
   - Click "Create New Class"
   - Fill in class details (name, date, time, duration, enrolled students)
   - Generate QR code for the class
   - QR code will be active from class start time until end time
   - Each class session gets a unique QR code

2. **Viewing Class Attendance**:
   - Go to "Attendance" page
   - Filter by class, date, and/or status
   - View which students marked attendance for each class

### For Students:

1. **Marking Attendance**:
   - Navigate to "Scan QR Code" page
   - Grant camera permissions when prompted
   - Point camera at the **class QR code** displayed by the teacher
   - System validates:
     - You are enrolled in the class
     - QR code is still active (not expired)
     - You haven't already marked attendance for this class
   - Attendance is automatically recorded upon successful scan
   - Or click on test class QR codes for simulation

2. **Viewing Your Classes**:
   - Visit "Students" page
   - Select your name from the dropdown
   - View active classes you're enrolled in
   - See QR codes for active classes

3. **Viewing Attendance History**:
   - Go to "Attendance" page
   - Filter by class and/or date
   - View your attendance records for different classes

## Browser Compatibility

- Modern browsers with camera access support (Chrome, Firefox, Safari, Edge)
- HTTPS required for camera access in production (or localhost for development)

## Key Features Explained

### Class-Based QR System

- **QR codes are generated per class session**, not per student
- Each class has a unique QR code that includes class ID, date, and time
- QR codes automatically **expire after the class end time**
- Students must be **enrolled in the class** to mark attendance
- Each student can mark attendance **only once per class session**

### QR Code Expiration

- QR codes are active from class start time until end time
- After the class ends, the QR code expires and cannot be used
- Teachers must generate a new QR code for each new class session
- Expired QR codes are clearly marked in the teacher dashboard

### Attendance Flow

1. Teacher creates a class session → QR code is generated
2. Teacher displays QR code to students (on screen or printed)
3. Students scan the QR code during class time
4. System validates: enrollment, expiration, duplicate check
5. Attendance is recorded with timestamp and status (present/late)
6. Attendance appears in both teacher dashboard and attendance records

## Development Notes

- This is a frontend-only application with mock data
- No backend API integration is included
- QR codes are generated client-side
- Class data and attendance records are stored in memory (resets on page refresh)
- In production, you would need:
  - Backend API for persistent storage
  - Authentication system for teachers and students
  - Real-time QR code validation
  - Database for classes, students, and attendance records

## License

This project is created for educational/demonstration purposes.

