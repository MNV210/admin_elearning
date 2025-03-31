import { useState, useEffect } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Modal } from 'antd';
import { toast } from 'react-toastify';
import questionService from '../../services/questionService';
import { useParams } from 'react-router-dom';

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Quản Lý Câu Hỏi</h3>
          <button
            onClick={handleAddQuestion}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm Câu Hỏi Mới
          </button>
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Không tìm thấy câu hỏi nào' : 'Chưa có câu hỏi nào'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc tìm kiếm' 
                : 'Bắt đầu bằng cách thêm câu hỏi mới cho bài kiểm tra này'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddQuestion}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Thêm Câu Hỏi Mới
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Câu Hỏi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đáp Án A</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đáp Án B</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đáp Án C</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đáp Án D</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đáp Án Đúng</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuestions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-normal">{question.question}</td>
                    <td className="px-6 py-4 whitespace-normal">{question.option1}</td>
                    <td className="px-6 py-4 whitespace-normal">{question.option2}</td>
                    <td className="px-6 py-4 whitespace-normal">{question.option3}</td>
                    <td className="px-6 py-4 whitespace-normal">{question.option4}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{question.correct_answer}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      <Modal
        title={editingQuestion ? "Chỉnh Sửa Câu Hỏi" : "Thêm Câu Hỏi Mới"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => !isSubmitting && setIsModalOpen(false)}
        okText={editingQuestion ? "Cập Nhật" : "Thêm"}
        cancelText="Hủy"
        width={800}
        confirmLoading={isSubmitting}
        okButtonProps={{ 
          loading: isSubmitting,
          disabled: isSubmitting 
        }}
        cancelButtonProps={{ 
          disabled: isSubmitting 
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Câu Hỏi
            </label>
            <textarea
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập câu hỏi..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đáp Án A
              </label>
              <input
                type="text"
                name="option1"
                value={formData.option1}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập đáp án A..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đáp Án B
              </label>
              <input
                type="text"
                name="option2"
                value={formData.option2}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập đáp án B..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đáp Án C
              </label>
              <input
                type="text"
                name="option3"
                value={formData.option3}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập đáp án C..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đáp Án D
              </label>
              <input
                type="text"
                name="option4"
                value={formData.option4}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập đáp án D..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đáp Án Đúng
            </label>
            <div className="space-y-2">
              <input
                type="text"
                name="correct_answer"
                value={formData.correct_answer}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập A, B, C hoặc D"
              />
              {formData.correct_answer_text && (
                <div className="text-sm text-gray-600">
                  Đáp án được chọn: {formData.correct_answer_text}
                </div>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác Nhận Xóa"
        open={isDeleteModalOpen}
        onOk={confirmDeleteQuestion}
        onCancel={() => !isSubmitting && setIsDeleteModalOpen(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ 
          danger: true,
          loading: isSubmitting,
          disabled: isSubmitting 
        }}
        cancelButtonProps={{ 
          disabled: isSubmitting 
        }}
      >
        <p>Bạn có chắc chắn muốn xóa câu hỏi này không?</p>
      </Modal>
    </div>
  );
};

export default QuestionManagement;
