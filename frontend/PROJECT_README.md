# 🔐 Password Manager Frontend

A beautiful, modern, and secure password manager frontend built with React, TypeScript, and TailwindCSS.

![Password Manager](https://img.shields.io/badge/Status-Production%20Ready-success)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![Vite](https://img.shields.io/badge/Vite-7.3-646cff)

## ✨ Features

### 🔒 Security First
- **End-to-End Encryption**: All passwords are encrypted before storage
- **JWT Authentication**: Secure token-based authentication
- **Auto-Logout**: Automatic session timeout after inactivity
- **Password Visibility Control**: Reveal passwords with auto-hide timer (30 seconds)
- **Secure Clipboard**: Copy passwords with automatic clearing

### 🎨 Modern UI/UX
- **Beautiful Design**: Clean, modern interface with TailwindCSS v4
- **Responsive**: Fully responsive design for desktop, tablet, and mobile
- **Dark Theme Ready**: Color scheme optimized for future dark mode
- **Smooth Animations**: Polished micro-interactions and transitions
- **Accessible**: Keyboard navigation and ARIA labels

### 🚀 Powerful Features
- **Password Generator**: Generate strong passwords with customizable options
  - Length: 8-128 characters
  - Options: Symbols, numbers, uppercase, lowercase
  - Real-time strength indicator
- **Password Strength Analysis**: Visual indicators for password security
- **Advanced Search**: Search by website name or email/username
- **Pagination**: Handle large password vaults efficiently
- **CRUD Operations**: Create, read, update, and delete password entries
- **Clipboard Integration**: One-click copy for usernames and passwords

### ⌨️ Keyboard Shortcuts
- `Ctrl/Cmd + K` - Focus search bar
- `Ctrl/Cmd + N` - Create new password entry
- `Escape` - Close modals and dialogs

## 🛠️ Tech Stack

### Core
- **React 19** - Latest React with improved performance
- **TypeScript** - Type-safe development
- **Vite 7** - Lightning-fast build tool

### UI & Styling
- **TailwindCSS v4** - Utility-first CSS framework
- **Shadcn UI** - Beautiful, accessible component library
- **Lucide React** - Modern icon library
- **Sonner** - Toast notifications

### State Management & Data Fetching
- **React Query (TanStack Query)** - Server state management
- **Zustand** - Lightweight client state management
- **Axios** - HTTP client with interceptors

### Form Handling & Validation
- **React Hook Form** - Performant form library
- **Zod** - TypeScript-first schema validation

### Utilities
- **date-fns** - Date formatting and manipulation
- **clsx** - Conditional className utility

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Backend API running on `http://localhost:8000`

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1/password-manager
```

4. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── api/                    # API client and endpoints
│   ├── client.ts          # Axios instance with JWT interceptors
│   ├── auth.ts            # Authentication API calls
│   └── entries.ts         # Password entries API calls
├── components/
│   ├── auth/              # Authentication components
│   │   └── ProtectedRoute.tsx
│   ├── entries/           # Password entry components
│   │   ├── CreateEntryModal.tsx
│   │   ├── EditEntryModal.tsx
│   │   ├── RevealPasswordModal.tsx
│   │   └── DeleteConfirmDialog.tsx
│   ├── layout/            # Layout components
│   │   ├── DashboardLayout.tsx
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   ├── shared/            # Shared/reusable components
│   │   ├── SearchBar.tsx
│   │   ├── Pagination.tsx
│   │   ├── PasswordStrengthIndicator.tsx
│   │   └── PasswordGenerator.tsx
│   └── ui/                # Shadcn UI components
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Authentication hooks
│   ├── useEntries.ts      # Password entries hooks
│   └── useDebounce.ts     # Debounce utility hook
├── lib/                   # Utility libraries
│   ├── utils.ts           # General utilities
│   ├── clipboard.ts       # Clipboard utilities
│   └── queryClient.ts     # React Query configuration
├── pages/                 # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── DashboardPage.tsx
├── schemas/               # Zod validation schemas
│   ├── auth.schema.ts
│   └── entry.schema.ts
├── stores/                # Zustand stores
│   └── authStore.ts       # Authentication state
├── types/                 # TypeScript type definitions
│   └── index.ts
├── App.tsx                # Main app component with routing
└── main.tsx               # Entry point
```

## 🔑 Key Components

### Authentication
- **Login/Register Pages**: Beautiful forms with validation and error handling
- **Protected Routes**: Automatic redirect to login for unauthenticated users
- **Token Management**: Automatic token refresh and secure storage

### Dashboard
- **Responsive Layout**: Collapsible sidebar for mobile
- **Search Bar**: Debounced search with type selection (website/email)
- **Password Table**: Sortable, paginated table with all entry details
- **Modals**: Create, edit, reveal, and delete password entries

### Password Management
- **Create/Edit Entry**: Full form validation with password strength indicator
- **Password Generator**: Built-in generator with customizable options
- **Reveal Password**: Secure reveal with auto-hide timer
- **Delete Confirmation**: Prevent accidental deletions

## 🎯 Features Breakdown

### Password Strength Indicator
- Visual progress bar (5 levels)
- Color-coded: Red → Orange → Yellow → Lime → Green
- Requirements checklist:
  - ✓ At least 8 characters
  - ✓ Contains uppercase letter
  - ✓ Contains lowercase letter
  - ✓ Contains number
  - ✓ Contains special character

### Password Generator
- Length slider: 8-128 characters
- Toggleable character types:
  - Symbols (!@#$%^&*)
  - Numbers (0-9)
  - Uppercase letters (A-Z)
  - Lowercase letters (a-z)
- Real-time strength display
- One-click copy and use

### Search & Filter
- Debounced search (500ms delay)
- Search types:
  - By website name/URL
  - By email/username
- Clear search button
- Result count display

### Pagination
- Customizable page size (10, 25, 50, 100)
- First/Previous/Next/Last navigation
- Page number display
- Total entries count

## 🔐 Security Features

1. **JWT Token Management**
   - Automatic token attachment to requests
   - Token refresh on expiration
   - Secure storage in localStorage

2. **Password Security**
   - Never logged or stored in plain text
   - Reveal with auto-hide (30 seconds)
   - Secure clipboard with toast feedback

3. **Auto-Logout**
   - Session timeout after inactivity
   - Redirect to login on 401 errors

4. **Form Validation**
   - Client-side validation with Zod
   - Server-side error handling
   - User-friendly error messages

## 📱 Responsive Design

- **Desktop**: Full sidebar + table layout
- **Tablet**: Collapsible sidebar
- **Mobile**: Hamburger menu, card-based layout

## 🎨 Color Scheme

- **Primary (Blue)**: Trust and security
- **Accent (Purple)**: Premium feel
- **Success (Green)**: Strong passwords
- **Danger (Red)**: Delete actions
- **Warning (Yellow/Orange)**: Weak passwords

## 🚀 Performance Optimizations

- **Code Splitting**: Lazy-loaded routes and components
- **Debounced Search**: Reduced API calls (500ms delay)
- **React Query Caching**: Efficient data fetching and caching
- **Memoization**: Optimized re-renders with React.memo
- **Virtual Scrolling**: Ready for large password lists

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api/v1/password-manager` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Shadcn UI** - For the beautiful component library
- **TailwindCSS** - For the utility-first CSS framework
- **React Query** - For excellent server state management
- **Lucide React** - For the modern icon library

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ using React, TypeScript, and TailwindCSS**
