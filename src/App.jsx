import { createBrowserRouter, RouterProvider } from "react-router-dom";  
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Home Layout
import HomeLayout from "./pages/HomeLayout";

// Import Admin Dashboard Components
import AdminDashboard from "./pages/admin/Dashboard";
import DashboardOverview from "./pages/admin/DashboardOverview";
import UserManagement from "./pages/admin/UserManagement";
import CourseManagement from "./pages/admin/CourseManagement";
import CategoryManagement from "./pages/admin/CategoryManagement";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import NotificationsPage from "./pages/admin/NotificationsPage";
import CourseDetail from "./pages/admin/CourseDetail";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LessonManagement from "./pages/admin/LessonManagement";
import QuestionManagement from "./pages/admin/QuestionManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";

const router = createBrowserRouter([
    {
        path: "/",
        element: <HomeLayout />
    },
    {
        path: "/login",
        element: <LoginPage />
    },
    {
        path: "/register",
        element: <RegisterPage />
    },
    {
        path: "/admin",
        element: (
            <ProtectedRoute>
                <AdminDashboard />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: (
                    <RoleBasedRoute allowedRoles={['admin']}>
                        <DashboardOverview />
                    </RoleBasedRoute>
                ),
            },
            {
                path: "users",
                element: (
                    <RoleBasedRoute allowedRoles={['admin']}>
                        <UserManagement />
                    </RoleBasedRoute>
                ),
            },
            {
                path: "courses",
                element: (
                    <RoleBasedRoute allowedRoles={['admin', 'teacher']}>
                        <CourseManagement />
                    </RoleBasedRoute>
                ),
            },
            {
                path: "categories",
                element: (
                    <RoleBasedRoute allowedRoles={['admin', 'teacher']}>
                        <CategoryManagement />
                    </RoleBasedRoute>
                ),
            },
            {
                path: "analytics",
                element: (
                    <RoleBasedRoute allowedRoles={['admin']}>
                        <AnalyticsPage />
                    </RoleBasedRoute>
                ),
            },
            {
                path: "notifications",
                element: (
                    <RoleBasedRoute allowedRoles={['admin']}>
                        <NotificationsPage />
                    </RoleBasedRoute>
                ),
            },
            {
                path:"lecture/:id/details",
                element: (
                    <RoleBasedRoute allowedRoles={['admin', 'teacher']}>
                        <LessonManagement/>
                    </RoleBasedRoute>
                ),
            },
            {
                path:"course/:id",
                element: (
                    <RoleBasedRoute allowedRoles={['admin', 'teacher']}>
                        <CourseDetail/>
                    </RoleBasedRoute>
                ),
            },
            {
                path:"quiz/:quizId/questions",
                element: (
                    <RoleBasedRoute allowedRoles={['admin', 'teacher']}>
                        <QuestionManagement/>
                    </RoleBasedRoute>
                ),
            }
        ],
    }
]);

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <RouterProvider router={router} />
                <ToastContainer position="top-right" autoClose={3000} />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
