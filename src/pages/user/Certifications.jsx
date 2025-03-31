import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const Certifications = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Sample data - in a real app, this would come from API/backend
  const certificates = [
    {
      id: 1,
      title: "Introduction to React",
      status: "earned",
      issueDate: "April 15, 2023",
      expiryDate: "April 15, 2025",
      credentialID: "REACT-INT-78923",
      image: "react_cert.jpg"
    },
    {
      id: 2,
      title: "Advanced JavaScript",
      status: "in-progress",
      progress: 65,
      requirements: [
        { id: 1, description: "Complete all course modules", completed: true },
        { id: 2, description: "Score at least 80% on all quizzes", completed: false },
        { id: 3, description: "Submit final project", completed: false }
      ]
    },
    {
      id: 3,
      title: "UI/UX Design Fundamentals",
      status: "available",
      requiredCourses: ["Web Design Fundamentals", "User Interface Design"]
    }
  ];

  const [selectedCertificate, setSelectedCertificate] = useState(null);

  return (
    <div>
      {!selectedCertificate ? (
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Certifications</h1>
            <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
              View your earned certificates and track progress towards new certifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Earned Certificates */}
            {certificates.filter(cert => cert.status === "earned").map(certificate => (
              <div 
                key={certificate.id} 
                onClick={() => setSelectedCertificate(certificate)}
                className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer`}
              >
                <div className={`h-32 mb-4 flex items-center justify-center rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                  <span className="material-icons text-6xl text-green-500">workspace_premium</span>
                </div>
                <h3 className="font-semibold text-xl mb-2">{certificate.title}</h3>
                <div className={`inline-flex items-center px-3 py-1 rounded-full ${isDark ? "bg-green-900" : "bg-green-100"} text-green-600 text-sm mb-3`}>
                  <span className="material-icons text-xs mr-1">check_circle</span>
                  Earned
                </div>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Issued: {certificate.issueDate}
                </p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCertificate(certificate);
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
                >
                  View Certificate
                </button>
              </div>
            ))}

            {/* In-Progress Certificates */}
            {certificates.filter(cert => cert.status === "in-progress").map(certificate => (
              <div 
                key={certificate.id} 
                className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6`}
              >
                <div className={`h-32 mb-4 flex items-center justify-center rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                  <span className="material-icons text-6xl text-blue-500">pending_actions</span>
                </div>
                <h3 className="font-semibold text-xl mb-2">{certificate.title}</h3>
                <div className={`inline-flex items-center px-3 py-1 rounded-full ${isDark ? "bg-blue-900" : "bg-blue-100"} text-blue-600 text-sm mb-3`}>
                  <span className="material-icons text-xs mr-1">hourglass_top</span>
                  In Progress
                </div>
                <div className="mt-4 mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completion</span>
                    <span>{certificate.progress}%</span>
                  </div>
                  <div className={`h-2 w-full bg-gray-200 ${isDark && "bg-gray-700"} rounded-full overflow-hidden`}>
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${certificate.progress}%` }}
                    ></div>
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full">
                  View Requirements
                </button>
              </div>
            ))}

            {/* Available Certificates */}
            {certificates.filter(cert => cert.status === "available").map(certificate => (
              <div 
                key={certificate.id} 
                className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6`}
              >
                <div className={`h-32 mb-4 flex items-center justify-center rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                  <span className="material-icons text-6xl text-gray-400">card_membership</span>
                </div>
                <h3 className="font-semibold text-xl mb-2">{certificate.title}</h3>
                <div className={`inline-flex items-center px-3 py-1 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"} text-gray-500 text-sm mb-3`}>
                  <span className="material-icons text-xs mr-1">lock</span>
                  Available
                </div>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"} mb-2`}>
                  Required courses:
                </p>
                <ul className="text-sm mb-2 list-disc list-inside">
                  {certificate.requiredCourses.map((course, index) => (
                    <li key={index} className={isDark ? "text-gray-300" : "text-gray-600"}>
                      {course}
                    </li>
                  ))}
                </ul>
                <button className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 w-full">
                  Enroll
                </button>
              </div>
            ))}
          </div>

          {/* Certification Benefits Information */}
          <div className={`mt-8 p-6 rounded-lg ${isDark ? "bg-gray-800" : "bg-white"} shadow-md`}>
            <h2 className="text-xl font-semibold mb-4">Benefits of Certification</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex">
                <span className="material-icons text-blue-500 mr-3 text-3xl">verified</span>
                <div>
                  <h3 className="font-medium mb-1">Verified Skills</h3>
                  <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Demonstrate your expertise with industry-recognized credentials.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <span className="material-icons text-green-500 mr-3 text-3xl">work</span>
                <div>
                  <h3 className="font-medium mb-1">Career Advancement</h3>
                  <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Enhance your resume and increase job opportunities.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <span className="material-icons text-purple-500 mr-3 text-3xl">share</span>
                <div>
                  <h3 className="font-medium mb-1">Shareable Credentials</h3>
                  <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Share your achievements on LinkedIn and other platforms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <button 
            onClick={() => setSelectedCertificate(null)}
            className={`mb-6 flex items-center px-4 py-2 rounded-lg ${
              isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <span className="material-icons mr-1">arrow_back</span>
            Back to Certificates
          </button>
          
          <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-8 max-w-4xl mx-auto`}>
            <div className="text-center mb-8">
              <div className="inline-block p-4 rounded-full bg-green-100 mb-4">
                <span className="material-icons text-green-600 text-6xl">workspace_premium</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">Certificate of Completion</h1>
              <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                This certifies that
              </p>
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-1">John Doe</h2>
              <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                has successfully completed
              </p>
              <h3 className="text-2xl font-bold my-2 text-blue-600">{selectedCertificate.title}</h3>
              <p className={`${isDark ? "text-gray-300" : "text-gray-600"}`}>
                with all requirements on {selectedCertificate.issueDate}
              </p>
            </div>
            
            <div className={`border-t ${isDark ? "border-gray-700" : "border-gray-200"} pt-6 mb-6`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">CREDENTIAL ID</h4>
                  <p className="font-mono">{selectedCertificate.credentialID}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">VALID UNTIL</h4>
                  <p>{selectedCertificate.expiryDate}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                <span className="material-icons mr-2">file_download</span>
                Download PDF
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                <span className="material-icons mr-2">share</span>
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certifications; 