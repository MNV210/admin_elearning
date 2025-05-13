import { useState, useEffect } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Modal, Upload } from 'antd';
import { toast } from 'react-toastify';
import questionService from '../../services/questionService';
import { useParams } from 'react-router-dom';
import { UploadOutlined } from '@ant-design/icons';

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const params = useParams();
  
  const [formData, setFormData] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correct_answer: '',
    correct_answer_text: ''
  });

  const fetchQuestions = async () => {
    try {
      const quizId = params.quizId;
      const response = await questionService.getAllQuestions(quizId);
      const questionsData = response?.data || [];
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Không thể tải danh sách câu hỏi');
      setQuestions([]);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuestions();
  }, [params.quizId]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredQuestions = questions.filter(question => {
    if (!question) return false;
    
    const searchString = searchTerm.toLowerCase();
    return (
      (question.question || '').toLowerCase().includes(searchString) ||
      (question.option1 || '').toLowerCase().includes(searchString) ||
      (question.option2 || '').toLowerCase().includes(searchString) ||
      (question.option3 || '').toLowerCase().includes(searchString) ||
      (question.option4 || '').toLowerCase().includes(searchString)
    );
  });

  const handleDeleteQuestion = (question) => {
    setDeletingQuestion(question);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteQuestion = async () => {
    try {
      setIsSubmitting(true);
      await questionService.deleteQuestion(deletingQuestion.id);
      await fetchQuestions();
      toast.success('Câu hỏi đã được xóa thành công');
      setIsDeleteModalOpen(false);
      setDeletingQuestion(null);
    } catch (error) {
      console.error('Error deleting question:', error);
      const errorMessage = error.response?.data?.message || 'Không thể xóa câu hỏi';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditQuestion = (question) => {
    // Lấy đáp án đúng dựa vào correct_answer
    const answerKeyMapping = {
      [question.option1]: 'A',
      [question.option2]: 'B',
      [question.option3]: 'C',
      [question.option4]: 'D'
    };

    // Xác định answer_key dựa trên correct_answer
    const answer_key = answerKeyMapping[question.correct_answer] || '';

    setEditingQuestion(question);
    setFormData({
      question: question.question,
      option1: question.option1,
      option2: question.option2,
      option3: question.option3,
      option4: question.option4,
      correct_answer: answer_key,
      correct_answer_text: question.correct_answer
    });
    setIsModalOpen(true);
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setFormData({
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correct_answer: '',
      correct_answer_text: ''
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'correct_answer') {
      const upperValue = value.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(upperValue)) {
        const optionMapping = {
          'A': 'option1',
          'B': 'option2',
          'C': 'option3',
          'D': 'option4'
        };
        const selectedOption = formData[optionMapping[upperValue]];
        setFormData(prev => ({
          ...prev,
          [name]: upperValue,
          correct_answer_text: selectedOption
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          correct_answer_text: ''
        }));
      }
    } else {
      // Nếu thay đổi giá trị của các đáp án, cập nhật lại correct_answer_text nếu đáp án đó đang được chọn
      const optionNumber = name.replace('option', '');
      const correctAnswerMapping = {
        '1': 'A',
        '2': 'B',
        '3': 'C',
        '4': 'D'
      };
      if (formData.correct_answer === correctAnswerMapping[optionNumber]) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          correct_answer_text: value
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadExcel = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file Excel');
      return;
    }
    const formData = new FormData();
    formData.append('files', selectedFile);
    formData.append('quiz_id',params.quizId)
    setUploading(true);
    try {
      // console.log(formData)
      // Gọi API importExcelController (giả sử đã có trong questionService)
      await questionService.importExcelController(formData);
      toast.success('Import file Excel thành công!');
      setSelectedFile(null);
      await fetchQuestions();
    } catch (error) {
      console.error('Error importing Excel:', error);
      const errorMessage = error.response?.data?.message || 'Không thể import file Excel';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.question || !formData.option1 || !formData.option2 || 
        !formData.option3 || !formData.option4 || !formData.correct_answer) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!['A', 'B', 'C', 'D'].includes(formData.correct_answer.toUpperCase())) {
      toast.error('Đáp án đúng phải là A, B, C hoặc D');
      return;
    }

    try {
      setIsSubmitting(true);
      const optionMapping = {
        'A': formData.option1,
        'B': formData.option2,
        'C': formData.option3,
        'D': formData.option4
      };

      const questionData = {
        quiz_id: parseInt(params.quizId),
        question: formData.question,
        option1: formData.option1,
        option2: formData.option2,
        option3: formData.option3,
        option4: formData.option4,
        correct_answer: optionMapping[formData.correct_answer.toUpperCase()],
        answer_key: formData.correct_answer.toUpperCase()
      };

      if (editingQuestion) {
        await questionService.updateQuestion(editingQuestion.id, questionData);
        await fetchQuestions();
        toast.success('Câu hỏi đã được cập nhật thành công');
      } else {
        await questionService.createQuestion(questionData);
        await fetchQuestions();
        toast.success('Câu hỏi mới đã được tạo thành công');
      }
      
      setIsModalOpen(false);
      setEditingQuestion(null);
      setFormData({
        question: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correct_answer: '',
        correct_answer_text: ''
      });
    } catch (error) {
      console.error('Error saving question:', error);
      const errorMessage = error.response?.data?.message || 'Không thể lưu câu hỏi';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">Quản Lý Câu Hỏi</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải câu hỏi...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-800">Quản Lý Câu Hỏi</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <UploadOutlined className="mr-2" />
            Import Excel
          </button>
          <button
            onClick={handleAddQuestion}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full sm:w-auto justify-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Thêm Câu Hỏi Mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Không tìm thấy câu hỏi nào.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((question, index) => (
              <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{question.question}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm">A</span>
                            <span className={`${question.correct_answer === question.option1 ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                              {question.option1}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm">B</span>
                            <span className={`${question.correct_answer === question.option2 ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                              {question.option2}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm">C</span>
                            <span className={`${question.correct_answer === question.option3 ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                              {question.option3}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm">D</span>
                            <span className={`${question.correct_answer === question.option4 ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                              {question.option4}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditQuestion(question)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form */}
      <Modal
        title={editingQuestion ? "Chỉnh Sửa Câu Hỏi" : "Thêm Câu Hỏi Mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Câu hỏi
            </label>
            <input
              type="text"
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đáp án A
              </label>
              <input
                type="text"
                name="option1"
                value={formData.option1}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đáp án B
              </label>
              <input
                type="text"
                name="option2"
                value={formData.option2}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đáp án C
              </label>
              <input
                type="text"
                name="option3"
                value={formData.option3}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đáp án D
              </label>
              <input
                type="text"
                name="option4"
                value={formData.option4}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đáp án đúng
            </label>
            <select
              name="correct_answer"
              value={formData.correct_answer}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Chọn đáp án đúng</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Đang xử lý...' : (editingQuestion ? 'Cập Nhật' : 'Thêm Mới')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác Nhận Xóa"
        open={isDeleteModalOpen}
        onOk={confirmDeleteQuestion}
        onCancel={() => setIsDeleteModalOpen(false)}
      >
        <p>Bạn có chắc chắn muốn xóa câu hỏi này?</p>
      </Modal>

      {/* Modal Upload Excel */}
      <Modal
        title="Import Câu Hỏi từ Excel"
        open={isUploadModalOpen}
        onCancel={() => { setIsUploadModalOpen(false); setSelectedFile(null); }}
        footer={null}
        width={400}
      >
        <div className="space-y-4">
          <Upload
            beforeUpload={file => {
              setSelectedFile(file);
              return false; // Ngăn antd tự upload
            }}
            fileList={selectedFile ? [selectedFile] : []}
            onRemove={() => setSelectedFile(null)}
            accept=".xlsx,.xls"
            maxCount={1}
            showUploadList={{ showRemoveIcon: true }}
            disabled={uploading}
          >
            <button
              type="button"
              className="block border border-gray-300 rounded-lg px-2 py-1 text-sm w-full bg-white hover:bg-gray-50"
              disabled={uploading}
            >Chọn file Excel</button>
          </Upload>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setIsUploadModalOpen(false); setSelectedFile(null); }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              disabled={uploading}
            >
              Hủy
            </button>
            <button
              onClick={async () => {
                await handleUploadExcel();
                setIsUploadModalOpen(false);
                setSelectedFile(null);
              }}
              disabled={uploading || !selectedFile}
              className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {uploading ? 'Đang tải lên...' : 'Xác nhận Import'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuestionManagement;
