import { createBrowserRouter, RouterProvider } from "react-router-dom";  
import { ThemeProvider } from "./context/ThemeContext";
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

// Import User Dashboard Components
import UserDashboard from "./pages/user/Dashboard";
import UserDashboardOverview from "./pages/user/DashboardOverview";
import LecturesAndMaterials from "./pages/user/LecturesAndMaterials";
import QuizzesAndAssessments from "./pages/user/QuizzesAndAssessments";
import QuizApp from "./pages/user/MakeQuizz";
import Certifications from "./pages/user/Certifications";
import DiscussionForum from "./pages/user/DiscussionForum";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LectureDetails from "./components/lectures/LectureDetails";
import LessonView from "./components/lectures/LessonView";
import LessonManagement from "./pages/admin/LessonManagement";
import QuestionManagement from "./pages/admin/QuestionManagement";

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
        element: <AdminDashboard />,
        children: [
            {
                index: true,
                element: <DashboardOverview />,
            },
            {
                path: "users",
                element: <UserManagement />,
            },
            {
                path: "courses",
                element: <CourseManagement />,
            },
            {
                path: "categories",
                element: <CategoryManagement />,
            },
            {
                path: "analytics",
                element: <AnalyticsPage />,
            },
            {
                path: "notifications",
                element: <NotificationsPage />,
            },
            {
                path:"lecture/:id/details",
                element: <LessonManagement/>
            },
            {
                path:"course/:id",
                element: <CourseDetail/>
            },
            {
                path:"quiz/:quizId/questions",
                element: <QuestionManagement/>
            }
        ],
    },
    {
        path: "/user",
        element: <UserDashboard />,
        children: [
            {
                index: true,
                element: <UserDashboardOverview />,
            },
            {
                path: "lectures",
                element: <LecturesAndMaterials />,
            },
            {
                path:"lecture/:id",
                element: <LectureDetails/>
            },
            {
                path:"learn/:course_id/lesson/:lesson_id",
                element: <LessonView/>
            },
            {
                path: "quizzes",
                element: <QuizzesAndAssessments />,
            },
            {
                path: "quiz/:courseId/:quizId/take",
                element: <QuizApp />,
            },
            {
                path: "certifications",
                element: <Certifications />,
            },
            {
                path: "forum",
                element: <DiscussionForum />,
            }
        ],
    }
]);

function App() {
    return (
        <ThemeProvider>
            <RouterProvider router={router} />
            <ToastContainer position="top-right" autoClose={3000} />
        </ThemeProvider>
    );
}

export default App;
