import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import LandingPage from "../pages/LandingPage";
import Login from "../services/Login";
import Signup from "../services/Signup";
import ForgotPassword from "../services/ForgotPassword";
import CheckEmail from "../services/CheckEmail";
import ResetPassword from "../services/ResetPassword";
import Logout from "../services/Logout";
import UserProfile from "../pages/UserProfile";
import EnrollClass from "../pages/EnrollClass";
import Classes from "../pages/Classes";
import ClassDetail from "../pages/ClassDetail";
import StudentManagement from "../pages/StudentManagement";
import Upload from "../pages/Upload";
import Schedule from "../pages/Schedule";
import TeacherAssignment from "../pages/TeacherAssignment";
import StudentAssignment from "../pages/StudentAssignment";
import SubmissionList from "../pages/SubmissionList";
import ProtectedRoute from "../utils/ProtectedRoutes";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="*" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/check-email" element={<CheckEmail />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/logout" element={<Logout />} />

                {/* Protected routes */}
                <Route path="/dashboard" element={
                    <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute><UserProfile /></ProtectedRoute>
                } />
                <Route path="/student/join-class" element={
                    <ProtectedRoute><EnrollClass /></ProtectedRoute>
                } />
                <Route path="/classes" element={
                    <ProtectedRoute><Classes /></ProtectedRoute>
                } />
                <Route path="/class/:classId" element={
                    <ProtectedRoute><ClassDetail /></ProtectedRoute>
                } />
                <Route path="/teacher/students" element={
                    <ProtectedRoute><StudentManagement /></ProtectedRoute>
                } />
                <Route path="/upload" element={
                    <ProtectedRoute><Upload /></ProtectedRoute>
                } />
                <Route path="/schedule" element={
                    <ProtectedRoute><Schedule /></ProtectedRoute>
                } />
                <Route path="/teacher/assignments" element={
                    <ProtectedRoute><TeacherAssignment /></ProtectedRoute>
                } />
                <Route path="/student/assignments" element={
                    <ProtectedRoute><StudentAssignment /></ProtectedRoute>
                } />
                <Route path="/teacher/grade" element={
                    <ProtectedRoute><SubmissionList /></ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
