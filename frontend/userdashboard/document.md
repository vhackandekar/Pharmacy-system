# AI Pharmacy - Futuristic Authentication Platform Documentation

This document describes the functionality and styling of the AI Pharmacy authentication system (Login & Registration).

## Pages & Routing

### 1. Navigation Flow
The application uses `react-router-dom` for client-side routing.
- **Login (`/`)**: Default entry point. Features browser autofill mitigation and role-based redirection.
- **Registration (`/register`)**: Accessible from Login. Redirects to OTP verification.
- **OTP Verification (`/verify-otp`)**: Secure step after registration.
- **Forgot Password (`/forgot-password`)**: Accessible from Login for password resets.
- **User Dashboard (`/dashboard`)**: Futuristic interface for healthcare professionals.
- **Admin Panel (`/admin-panel`)**: Advanced control system for administrators.

```javascript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </Routes>
</BrowserRouter>
```

## Core Components

### 1. Login Page (`Login.jsx`)
- **Features**: Email, Password, Role Selection.
- **Design**: Futuristic SaaS look, smaller glassmorphism card, neon purple accents.
- **Logic**: Uses `useNavigate` to redirect to registration.

### 2. Registration Page (`Register.jsx`)
- **Features**: Full Name, Email, Password, Confirm Password, Role Selection.
- **Design**: Strictly inline Tailwind CSS utility classes.
- **Logic**: Redirects back to Login after successful registration.

### 3. Forgot Password Page (`ForgotPassword.jsx`)
- **Features**: Email input, success message highlight, back-to-login navigation.

### 4. Dashboards
- **User Dashboard**: Displays health metrics, health tracker, and pharmacy transition blocks.
- **Admin Dashboard**: Features system stats, live logs, and a sidebar for OS navigation.

## Role-Based Redirection Logic
The login process evaluates the `role` state and navigates accordingly:
```javascript
if (role === 'Admin') {
  navigate('/admin-panel');
} else {
  navigate('/dashboard');
}
```

## Styling & Theme

### 1. Global Themes (`tailwind.config.js`)
Custom purple shades and animations are defined for consistency.
```javascript
colors: {
  'deep-black': '#0B0F19',
  'neon-purple': '#A855F7',
  'electric-purple': '#7C3AED',
},
```

### 2. Register Inline Styling Snippet
The Registration page uses direct hex codes and utility classes for a zero-CSS dependency feel.
```jsx
<div className="bg-[#141225] border border-purple-800 text-white rounded-lg px-4 py-3">
  {/* Input Field */}
</div>
```

## Technologies Used

- **React**: Functional components and hooks (`useState`, `useNavigate`).
- **Framer Motion**: For smooth fade-in transitions.
- **Lucide React**: For medical and security-themed icons.
- **Tailwind CSS**: For all layout and decorative styling.
