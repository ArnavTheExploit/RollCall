# 📋 RollCall

> **Smart QR-Based Attendance Management System**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://rollcall-dashboard.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

A modern, intuitive attendance management system that leverages QR code technology for seamless class attendance tracking. Teachers generate unique QR codes for each session, and students simply scan to mark their presence.

🔗 **Live Demo**: [rollcall-dashboard.vercel.app](https://rollcall-dashboard.vercel.app)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Real-time Dashboard** | Overview of students, teachers, active classes, and attendance statistics |
| 👨‍🏫 **Teacher Portal** | Create class sessions and generate unique, time-bound QR codes |
| 👨‍🎓 **Student Portal** | View enrolled classes, upcoming sessions, and attendance history |
| 📱 **QR Scanning** | Fast, camera-based QR scanning with validation |
| ⏰ **Auto-Expiration** | QR codes automatically expire after class end time |
| 🔒 **Enrollment Validation** | Only enrolled students can mark attendance |
| 📈 **Attendance Analytics** | Detailed records filterable by class, date, and status |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **QR Generation**: qrcode.react
- **QR Scanning**: html5-qrcode
- **Date Handling**: date-fns
- **Deployment**: Vercel

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ArnavTheExploit/RollCall.git
cd RollCall

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
RollCall/
├── app/
│   ├── page.tsx                 # Main dashboard
│   ├── teacher-dashboard/       # Teacher portal
│   ├── student/dashboard/       # Student portal
│   ├── scan/                    # QR scanner
│   ├── students/                # Students list
│   ├── teachers/                # Teachers list
│   └── attendance/              # Attendance records
├── components/
│   ├── Logo.tsx                 # Brand logo
│   └── Navigation.tsx           # Navigation bar
├── data/
│   └── mockData.ts              # Mock data & utilities
└── public/                      # Static assets
```

---

## 👥 User Roles

### 🎓 For Teachers

1. **Create Class Sessions**
   - Navigate to Teacher Dashboard
   - Set subject, date, time, and duration
   - Select enrolled students
   - QR code is automatically generated

2. **Manage Attendance**
   - Display QR code for students to scan
   - View real-time attendance records
   - Filter and export attendance data

### 📚 For Students

1. **Mark Attendance**
   - Go to Scan QR page
   - Grant camera permission
   - Scan the class QR code
   - Receive instant confirmation

2. **Track Progress**
   - View attendance percentage by subject
   - See upcoming and ongoing classes
   - Review attendance history

---

## 🔐 How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Teacher   │────▶│  QR Code     │────▶│   Student   │
│   creates   │     │  generated   │     │   scans     │
│   session   │     │  for class   │     │   QR code   │
└─────────────┘     └──────────────┘     └─────────────┘
                           │                     │
                           ▼                     ▼
                    ┌──────────────┐     ┌─────────────┐
                    │  Time-based  │     │  Validates  │
                    │  expiration  │     │  enrollment │
                    └──────────────┘     │  + records  │
                                         │  attendance │
                                         └─────────────┘
```

### Key Validations
- ✅ Student must be enrolled in the class
- ✅ QR code must be within valid time window
- ✅ No duplicate attendance for same session
- ✅ Automatic present/late status based on time

---

## 🌐 Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full support |
| Firefox | ✅ Full support |
| Safari | ✅ Full support |
| Edge | ✅ Full support |

> **Note**: Camera access requires HTTPS in production (localhost works for development)

---

## 🔮 Future Enhancements

- [ ] Backend API integration for persistent storage
- [ ] User authentication system
- [ ] Email notifications for attendance
- [ ] Mobile app (React Native)
- [ ] Export to Excel/PDF

---

## 📄 License

This project is created for educational and demonstration purposes.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/ArnavTheExploit">Arnav</a>
</p>
