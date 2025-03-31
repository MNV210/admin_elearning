import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Table, Typography, Input, Space, Card, Button, Tag, Tooltip, 
  Modal, Form, Select, Upload, message 
} from 'antd';
import { 
  SearchOutlined, BookOutlined, EditOutlined, DeleteOutlined, 
  PlusOutlined, UploadOutlined, VideoCameraOutlined, FileOutlined,
  FilePdfOutlined
} from '@ant-design/icons';

import { courseService } from '../../services';
import '../../assets/LessonManagement.css'
import lessonService from '../../services/lessonService';
import uploadToS3 from '../../services/uploadToS3';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;
// const [pdfFileList, setPdfFileList] = useState([]);


const LessonManagement = () => {
    const [lessons, setLessons] = useState([]);
    const [filteredLessons, setFilteredLessons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [form] = Form.useForm();
    const params = useParams()
    

    const getLessonByCourseId = async() => {
        const response = await courseService.getLessonByCourseId(params.id);
        console.log(response.data);
        setLoading(true);
        setTimeout(() => {
            setLessons(response.data);
            setFilteredLessons(response.data);
            setLoading(false);
        }, 1000);
    }

    const createLesson = async(data) => {
        try {
            await lessonService.createLesson(data);
            await getLessonByCourseId();
            message.success('Tạo mới bài học thành công!');
            return true;
        } catch (error) {
            message.error('Tạo mới bài học thất bại: ' + (error.message || 'Đã xảy ra lỗi'));
            return false;
        }
    }

    // lấy danh sách khóa học theo course_id
    useEffect(() => {
        getLessonByCourseId();
    }, [params.id]);

    // Xử lý tìm kiếm
    const handleSearch = (value) => {
        setSearchText(value);
        if (!value) {
            setFilteredLessons(lessons);
            return;
        }

        const filtered = lessons.filter(
            lesson => 
                lesson.title.toLowerCase().includes(value.toLowerCase()) ||
                lesson.content.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredLessons(filtered);
    };

    // Hiển thị icon loại tệp
    const getTypeIcon = (type) => {
        return type === 'video' 
            ? <VideoCameraOutlined style={{ color: '#ff4d4f' }} /> 
            : <FileOutlined style={{ color: '#1890ff' }} />;
    };

    // Mở modal tạo/chỉnh sửa
    const showModal = (lesson = null) => {
        setEditingLesson(lesson);
        if (lesson) {
            form.setFieldsValue(lesson);
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
            
            if (editingLesson) {
                // Cập nhật bài học
                try {
                    let fileType = "";
                    let file = null;
                    
                    if (values.file && values.file.fileList && values.file.fileList.length > 0) {
                        file = values.file.fileList[0].originFileObj;
                        const isPDF = file.type === 'application/pdf';
                        const isVideo = file.type.startsWith('video/');
                        
                        if (!isPDF && !isVideo) {
                            message.error('Chỉ chấp nhận file PDF hoặc video!');
                            setSubmitLoading(false);
                            return;
                        }
                        
                        // Xác định loại file
                        fileType = isPDF ? "file" : "video";
                    }
                    
                    const updateData = {
                        id: editingLesson.id,
                        title: values.title,
                        content: values.content,
                        type: fileType || editingLesson.type
                    };
                    
                    if (file) {
                        const file_url = await uploadToS3.uploadVideo({file: file});
                        updateData.file_url = file_url.data.url;
                    }
                    
                    const response = await lessonService.updateLesson(updateData);
                    if (response && response.status === 'success') {
                        await getLessonByCourseId();
                        message.success('Cập nhật bài học thành công!');
                        setIsModalVisible(false);
                        form.resetFields();
                    } else {
                        message.error('Cập nhật bài học thất bại');
                    }
                } catch (error) {
                    message.error('Lỗi khi cập nhật bài học: ' + (error.message || 'Đã xảy ra lỗi'));
                } finally {
                    setSubmitLoading(false);
                }
            } else {
                // Tạo bài học mới
                if(values.file && values.file.fileList && values.file.fileList.length > 0) {
                    try {
                        const file = values.file.fileList[0].originFileObj;
                        const isPDF = file.type === 'application/pdf';
                        const isVideo = file.type.startsWith('video/');
                        
                        if (!isPDF && !isVideo) {
                            message.error('Chỉ chấp nhận file PDF hoặc video!');
                            setSubmitLoading(false);
                            return;
                        }
                        
                        // Xác định loại file
                        const fileType = isPDF ? "file" : "video";
                        
                        const file_url = await uploadToS3.uploadVideo({file: file});
                        const dataCreate = {
                            title: values.title,
                            content: values.content,
                            file_url: file_url.data.url,
                            course_id: params.id,
                            type: fileType
                        };
                        const success = await createLesson(dataCreate);
                        if (success) {
                            setIsModalVisible(false);
                            form.resetFields();
                        }
                    } catch (error) {
                        message.error('Lỗi khi tải file lên: ' + (error.message || 'Đã xảy ra lỗi'));
                    } finally {
                        setSubmitLoading(false);
                    }
                } else {
                    message.error('Vui lòng tải lên tệp PDF hoặc video!');
                    setSubmitLoading(false);
                }
            }
        } catch (info) {
            console.log('Lỗi khi xác thực:', info);
            setSubmitLoading(false);
        }
    };

    // Xử lý xóa bài học
    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa bài học này không?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okType: 'danger',
            onOk: async () => {
                try {
                    const response = await lessonService.deleteLesson(id);
                    console.log(response);
                    if (response.status === 'success') {
                        await getLessonByCourseId();
                        message.success('Xóa bài học thành công!');
                    }
                } catch (error) {
                    message.error('Xóa bài học thất bại!');
                }
            },
        });
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: '5%',
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            width: '20%',
            render: (text) => (
                <Space>
                    <BookOutlined style={{ color: '#1890ff' }} />
                    <Text strong>{text}</Text>
                </Space>
            ),
        },
        {
            title: 'Nội dung',
            dataIndex: 'content',
            key: 'content',
            width: '30%',
            ellipsis: true,
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            width: '10%',
            align: 'center',
            render: (type) => (
                <Space>
                    {getTypeIcon(type)}
                    <Text>{type === 'video' ? 'Video' : 'Tài liệu'}</Text>
                </Space>
            ),
        },
        {
            title: 'File URL',
            dataIndex: 'file_url',
            key: 'file_url',
            width: '15%',
            ellipsis: true,
            render: (url) => (
                url ? (
                    <Tooltip title={url}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            {url.substring(0, 20)}...
                        </a>
                    </Tooltip>
                ) : (
                    <Text type="secondary">Không có URL</Text>
                )
            ),
        },
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
            className="lesson-management-card"
            style={{ 
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
            }}
        >
            <div style={{ padding: '0 0 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Title level={4} style={{ margin: 0 }}>
                        Danh sách bài học
                    </Title>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => showModal()}
                    >
                        Thêm bài học
                    </Button>
                </div>
                
                <Search
                    placeholder="Tìm kiếm theo tiêu đề hoặc nội dung"
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    onChange={(e) => handleSearch(e.target.value)}
                    value={searchText}
                    style={{ marginBottom: 16 }}
                />
                
                <Table
                    dataSource={filteredLessons}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ 
                        pageSize: 5,
                        showTotal: (total) => `Tổng cộng ${total} bài học`,
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

            {/* Modal tạo/cập nhật bài học */}
            <Modal
                title={editingLesson ? "Cập nhật bài học" : "Thêm bài học mới"}
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
                        {editingLesson ? "Cập nhật" : "Tạo mới"}
                    </Button>,
                ]}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="lessonForm"
                    initialValues={{ type: 'file' }}
                >
                    <Form.Item
                        name="title"
                        label="Tiêu đề"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                    >
                        <Input placeholder="Nhập tiêu đề bài học" />
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="Nội dung"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
                    >
                        <TextArea 
                            placeholder="Nhập nội dung bài học" 
                            autoSize={{ minRows: 3, maxRows: 6 }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="file"
                        label="Tải lên tệp (PDF hoặc Video)"
                        rules={[{ required: true, message: 'Vui lòng tải lên tệp PDF hoặc video!' }]}
                    >
                        <Upload
                            maxCount={1}
                            beforeUpload={(file) => {
                                const isPDF = file.type === 'application/pdf';
                                const isVideo = file.type.startsWith('video/');
                                if (!isPDF && !isVideo) {
                                    message.error('Chỉ chấp nhận file PDF hoặc video!');
                                }
                                return false;
                            }}
                            accept=".pdf,.mp4,.webm,.avi"
                        >
                            <Button icon={<UploadOutlined />}>Chọn tệp</Button>
                            <Text type="secondary" style={{ marginLeft: 10 }}>
                                Hỗ trợ tệp PDF hoặc video (MP4, Webm, AVI) dưới 100MB
                            </Text>
                        </Upload>
                    </Form.Item>

                </Form>
            </Modal>
        </Card>
    );
};

export default LessonManagement;

