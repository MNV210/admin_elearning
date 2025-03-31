import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Card, Typography, Button, Breadcrumb } from 'antd';
import { ArrowLeftOutlined, BookOutlined, FormOutlined } from '@ant-design/icons';
import LessonManagement from './LessonManagement';
import ExamManagement from './ExamManagement';
import { courseService } from '../../services';

const { Title } = Typography;
const { TabPane } = Tabs;

const CourseDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState('1');

  // Lấy thông tin khóa học
  useEffect(() => {
    const fetchCourseInfo = async () => {
      setLoading(true);
      try {
        const response = await courseService.getCourseById(params.id);
        if (response && response.data) {
          setCourseTitle(response.data.name || `Khóa học #${params.id}`);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin khóa học:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseInfo();
  }, [params.id]);

  // Quay lại trang danh sách khóa học
  const handleGoBack = () => {
    navigate('/admin/courses');
  };

  // Thay đổi tab
  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  return (
    <div className="course-detail-container">
      <Card 
        bordered={false}
        style={{ 
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          marginBottom: '20px'
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <a onClick={handleGoBack}>Quản lý khóa học</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Chi tiết khóa học</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <Title level={2} style={{ margin: 0 }}>
            {courseTitle || `Đang tải...`}
          </Title>
          <Button 
            type="default" 
            icon={<ArrowLeftOutlined />} 
            onClick={handleGoBack}
          >
            Quay lại
          </Button>
        </div>

        <Tabs 
          activeKey={activeKey} 
          onChange={handleTabChange}
          type="card"
          size="large"
          tabPosition="top"
          style={{ marginTop: '16px' }}
        >
          <TabPane 
            tab={
              <span>
                <BookOutlined />
                Quản lý bài học
              </span>
            } 
            key="1"
          >
            <LessonManagement />
          </TabPane>
          <TabPane 
            tab={
              <span>
                <FormOutlined />
                Quản lý bài kiểm tra
              </span>
            } 
            key="2"
          >
            <ExamManagement />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default CourseDetail; 