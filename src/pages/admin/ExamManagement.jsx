import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Table, Typography, Input, Space, Card, Button, Tag, Tooltip, 
  Modal, Form, Select, Upload, message, InputNumber
} from 'antd';
import { 
  SearchOutlined, FileTextOutlined, EditOutlined, DeleteOutlined, 
  PlusOutlined, UploadOutlined, FormOutlined, QuestionCircleOutlined
} from '@ant-design/icons';

import { courseService, quizService } from '../../services';
// import lessonService from '../../services/lessonService';
import { useNavigate } from 'react-router-dom';
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const ExamManagement = () => {
    const [exams, setExams] = useState([]);
    const [filteredExams, setFilteredExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [form] = Form.useForm();
    const params = useParams();
    const navigate = useNavigate();

    const getExamsByCourseId = async () => {
        try {
            setLoading(true);
            const response = await quizService.getCourseQuizzes(params.id);  
            // Đảm bảo response.data là một mảng
            const examData = Array.isArray(response.data) ? response.data : [];
            setExams(examData);
            setFilteredExams(examData);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách bài kiểm tra:", error);
            message.error("Không thể tải danh sách bài kiểm tra");
            setExams([]);
            setFilteredExams([]);
        } finally {
            setLoading(false);
        }
    };

    const createExam = async (data) => {
        try {
            // Sau này sẽ thay bằng API call thực tế
            await quizService.createQuiz(data);
            
            // Hiển thị thông báo thành công và làm mới danh sách
            message.success('Tạo mới bài kiểm tra thành công!');
            getExamsByCourseId();
            return true;
        } catch (error) {
            message.error('Tạo mới bài kiểm tra thất bại: ' + (error.message || 'Đã xảy ra lỗi'));
            return false;
        }
    };

    // Lấy danh sách bài kiểm tra theo course_id
    useEffect(() => {
        getExamsByCourseId();
    }, [params.id]);

    // Xử lý tìm kiếm
    const handleSearch = (value) => {
        setSearchText(value);
        if (!value) {
            setFilteredExams(exams || []);
            return;
        }

        if (!Array.isArray(exams)) {
            setFilteredExams([]);
            return;
        }

        const filtered = exams?.filter(
            exam => 
                exam.title.toLowerCase().includes(value.toLowerCase()) ||
                exam.description.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredExams(filtered);
    };

    // Hiển thị trạng thái bài kiểm tra
    // const getStatusTag = (status) => {
    //     if (status === "active") {
    //         return <Tag color="green">Đã xuất bản</Tag>;
    //     } else if (status === "draft") {
    //         return <Tag color="orange">Bản nháp</Tag>;
    //     } else {
    //         return <Tag color="default">{status}</Tag>;
    //     }
    // };

    // Mở modal tạo/chỉnh sửa
    const showModal = (exam = null) => {
        setEditingExam(exam);
        if (exam) {
            form.setFieldsValue(exam);
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    // Đóng modal
    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    // Xử lý submit form
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitLoading(true);
            
            if (editingExam) {
                // Cập nhật bài kiểm tra
                try {
                    const updateData = {
                        quiz_id: editingExam.id,
                        title: values.title,
                        description: values.description,
                        time_limit: values.time_limit,
                        course_id: params.id
                    };
                    
                    await quizService.updateQuiz(editingExam.id,updateData);
                    
                    message.success('Cập nhật bài kiểm tra thành công!');
                    setIsModalVisible(false);
                    form.resetFields();
                    getExamsByCourseId(); // Làm mới danh sách sau khi cập nhật
                } catch (error) {
                    message.error('Lỗi khi cập nhật bài kiểm tra: ' + (error.message || 'Đã xảy ra lỗi'));
                } finally {
                    setSubmitLoading(false);
                }
            } else {
                // Tạo bài kiểm tra mới
                try {
                    const dataCreate = {
                        title: values.title,
                        description: values.description,
                        time_limit: values.time_limit,
                        course_id: params.id
                    };
                    
                    const success = await createExam(dataCreate);
                    if (success) {
                        setIsModalVisible(false);
                        form.resetFields();
                    }
                } catch (error) {
                    message.error('Lỗi khi tạo bài kiểm tra: ' + (error.message || 'Đã xảy ra lỗi'));
                } finally {
                    setSubmitLoading(false);
                }
            }
        } catch (info) {
            console.log('Lỗi khi xác thực:', info);
            setSubmitLoading(false);
        }
    };

    // Xử lý xóa bài kiểm tra
    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa bài kiểm tra này không?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okType: 'danger',
            onOk: async () => {
                try {
                    await quizService.deleteQuiz(id);
                    message.success('Xóa bài kiểm tra thành công!');
                    getExamsByCourseId(); // Làm mới danh sách sau khi xóa
                } catch (error) {
                    message.error('Xóa bài kiểm tra thất bại!');
                }
            },
        });
    };

    // Handler để chuyển đến trang quản lý câu hỏi
    const handleManageQuestions = (examId) => {

        // message.info(`Chuyển đến quản lý câu hỏi cho bài kiểm tra ID: ${examId}`);
        // Sau này sẽ thay bằng navigation thực tế
        navigate(`/admin/quiz/${examId}/questions`);
    };

    const columns = [
        // {
        //     title: 'ID',
        //     dataIndex: 'id',
        //     key: 'id',
        //     width: '5%',
        // },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            width: '20%',
            render: (text) => (
                <Space>
                    <FormOutlined style={{ color: '#1890ff' }} />
                    <Text strong>{text}</Text>
                </Space>
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: '25%',
            ellipsis: true,
        },
        {
            title: 'Thời gian (phút)',
            dataIndex: 'time_limit',
            key: 'time_limit',
            width: '10%',
            align: 'center',
        },
        // {
        //     title: 'Điểm đạt',
        //     dataIndex: 'passing_score',
        //     key: 'passing_score',
        //     width: '10%',
        //     align: 'center',
        //     render: (score) => `${score}%`,
        // },
        {
            title: 'Tổng Số câu hỏi',
            // key: 'total_questions',
            width: '10%',
            align: 'center',
            render: (record) => record?.questions?.length || 0,
        },
        // {
        //     title: 'Trạng thái',
        //     dataIndex: 'status',
        //     key: 'status',
        //     width: '10%',
        //     align: 'center',
        //     render: (status) => getStatusTag(status),
        // },
        {
            title: 'Thao tác',
            key: 'actions',
            width: '10%',
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button 
                            type="text" 
                            icon={<EditOutlined />} 
                            size="small" 
                            onClick={() => showModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Quản lý câu hỏi">
                        <Button 
                            type="text" 
                            icon={<QuestionCircleOutlined />} 
                            size="small" 
                            onClick={() => handleManageQuestions(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                            size="small" 
                            onClick={() => handleDelete(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Card 
            className="exam-management-card"
            style={{ 
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
            }}
        >
            <div style={{ padding: '0 0 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Title level={4} style={{ margin: 0 }}>
                        Danh sách bài kiểm tra
                    </Title>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => showModal()}
                    >
                        Thêm bài kiểm tra
                    </Button>
                </div>
                
                <Search
                    placeholder="Tìm kiếm theo tiêu đề hoặc mô tả"
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    onChange={(e) => handleSearch(e.target.value)}
                    value={searchText}
                    style={{ marginBottom: 16 }}
                />
                
                <Table
                    dataSource={Array.isArray(filteredExams) ? filteredExams : []}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ 
                        pageSize: 5,
                        showTotal: (total) => `Tổng cộng ${total} bài kiểm tra`,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20']
                    }}
                    bordered
                    style={{ 
                        backgroundColor: 'white',
                        borderRadius: '4px',
                    }}
                    rowClassName={(record, index) => 
                        index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
                    }
                />
            </div>

            {/* Modal tạo/cập nhật bài kiểm tra */}
            <Modal
                title={editingExam ? "Cập nhật bài kiểm tra" : "Thêm bài kiểm tra mới"}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel} disabled={submitLoading}>
                        Hủy
                    </Button>,
                    <Button 
                        key="submit" 
                        type="primary" 
                        onClick={handleSubmit} 
                        loading={submitLoading}
                    >
                        {editingExam ? "Cập nhật" : "Tạo mới"}
                    </Button>,
                ]}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="examForm"
                    initialValues={{ 
                        time_limit: 30
                    }}
                >
                    <Form.Item
                        name="title"
                        label="Tiêu đề"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                    >
                        <Input placeholder="Nhập tiêu đề bài kiểm tra" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                    >
                        <TextArea 
                            placeholder="Nhập mô tả bài kiểm tra" 
                            autoSize={{ minRows: 3, maxRows: 6 }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="time_limit"
                        label="Thời gian làm bài (phút)"
                        rules={[{ required: true, message: 'Vui lòng nhập thời gian!' }]}
                    >
                        <InputNumber 
                            min={1} 
                            max={180} 
                            style={{ width: '100%' }} 
                            placeholder="Nhập thời gian làm bài" 
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default ExamManagement; 