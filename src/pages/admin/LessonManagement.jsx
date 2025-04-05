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
import AIService from '../../services/AIService';
// import '../../assets/LessonManagement.css'
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

    const createLesson = async (data) => {
        try {
            const response = await lessonService.createLesson(data);
            await getLessonByCourseId();
            message.success('Tạo mới bài học thành công!');
    
            if (response?.data?.file_url && response.data.file_type === "file") {
                console.log("upload file to knowlegde base")
                console.log(response.data)
                setTimeout(() => {
                    AIService.uploadFileToAI({
                        file_url: response.data.file_url,
                        file_type: 'file'
                    }).then(() => console.log("success"))
                    .catch(error => console.error("Upload failed:", error));
                }, 0);
            }
    
            return true;
        } catch (error) {
            message.error('Tạo mới bài học thất bại: ' + (error.message || 'Đã xảy ra lỗi'));
            return false;
        }
    };
    

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
                         await AIService.uploadFileToAI({
                                        file_url: file_url.data.url,
                                        file_type: 'file'
                                    })
                        updateData.file_url = file_url.data.url;
                    }
                    
                    const response = await lessonService.updateLesson(updateData);
                    if (response && response.status === 'success') {
                        await getLessonByCourseId();
                        message.success('Cập nhật bài học thành công!');
                        if (response?.data?.file_url && response.data.file_type === "file") {
                            setTimeout(() => {
                                AIService.uploadFileToAI({
                                    file_url: response.data.file_url,
                                    file_type: 'file'
                                }).then(() => console.log("success"))
                                .catch(error => console.error("Upload failed:", error));
                            }, 0);
                        }
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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Title level={2} className="!mb-0">Quản Lý Bài Học</Title>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => showModal()}
                    className="w-full sm:w-auto"
                >
                    Thêm Bài Học Mới
                </Button>
            </div>

            <Card className="shadow-sm">
                <div className="mb-4">
                    <Search
                        placeholder="Tìm kiếm bài học..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        onSearch={handleSearch}
                        className="w-full sm:w-96"
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredLessons}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng số ${total} bài học`,
                        className: "mt-4"
                    }}
                    scroll={{ x: true }}
                    className="overflow-x-auto"
                />
            </Card>

            <Modal
                title={editingLesson ? "Chỉnh Sửa Bài Học" : "Thêm Bài Học Mới"}
                open={isModalVisible}
                onCancel={handleCancel}
                width={800}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="mt-4"
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
                        <TextArea rows={4} placeholder="Nhập nội dung bài học" />
                    </Form.Item>

                    <Form.Item
                        name="file"
                        label="Tệp đính kèm"
                        rules={[{ required: !editingLesson, message: 'Vui lòng tải lên tệp!' }]}
                    >
                        <Dragger
                            accept=".pdf,video/*"
                            maxCount={1}
                            beforeUpload={() => false}
                            className="!border-dashed"
                        >
                            <p className="ant-upload-drag-icon">
                                <UploadOutlined />
                            </p>
                            <p className="ant-upload-text">Nhấp hoặc kéo tệp vào đây để tải lên</p>
                            <p className="ant-upload-hint">
                                Chỉ chấp nhận file PDF hoặc video
                            </p>
                        </Dragger>
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <div className="flex justify-end gap-2">
                            <Button onClick={handleCancel}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit" loading={submitLoading}>
                                {editingLesson ? 'Cập Nhật' : 'Thêm Mới'}
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default LessonManagement;

