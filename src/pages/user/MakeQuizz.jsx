import React, { useState } from 'react';
import { Card, Button, Space, Typography, Divider, Row, Col, Result, Badge, Steps, Progress, Statistic, Tooltip, Modal } from 'antd';
import { CheckOutlined, CloseOutlined, LeftOutlined, RightOutlined, CheckCircleFilled, ClockCircleOutlined, TrophyOutlined, BookOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import questionService from '../../services/questionService';
import { useEffect } from 'react';
import quizService from '../../services/quizService';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import quizResultService from '../../services/quizResultService';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

// CSS cho hiệu ứng nhấp nháy khi thời gian gần hết
const pulseKeyframes = `
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
    100% {
      opacity: 1;
    }
  }
`;

const QuizApp = () => {
  // Dữ liệu câu hỏi mẫu
  const [quizData, setQuizData] = useState([]);
  const [quizInfo, setQuizInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const params = useParams();
  const navigate = useNavigate();

  const fetchQuestion = async() => {
    try {
      setLoading(true);
      
      // Lấy thông tin về quiz (tên, thời gian làm bài, ...)
      const quizInfoResponse = await quizService.getInfomationQuiz(params.quizId);
      
      if (quizInfoResponse && quizInfoResponse.data) {
        setQuizInfo(quizInfoResponse.data);
        
        // Thiết lập thời gian làm bài (nếu có)
        if (quizInfoResponse.data.time_limit) {
          const timeInMinutes = parseInt(quizInfoResponse.data.time_limit);
          if (!isNaN(timeInMinutes)) {
            setTimeLeft(timeInMinutes * 60); // Chuyển đổi phút thành giây
          }
        }
      }
      
      // Lấy danh sách câu hỏi
      const question = await questionService.getAllQuestions(params.quizId);
      
      if (question && question.data) {
        // Đảm bảo dữ liệu là một mảng
        let dataArray = Array.isArray(question.data) ? question.data : [question.data];
        
        // Chuyển đổi dữ liệu từ định dạng database (option1, option2...) sang mảng options
        dataArray = dataArray.map(item => {
          // Kiểm tra nếu dữ liệu đã có cấu trúc options thì không cần chuyển đổi
          if (item.options && Array.isArray(item.options)) {
            return item;
          }
          
          // Tạo mảng options từ option1, option2, option3, option4, ...
          const options = [];
          for (let i = 1; i <= 10; i++) {
            const optionKey = `option${i}`;
            if (item[optionKey] && item[optionKey].trim() !== '') {
              options.push(item[optionKey]);
            }
          }
          
          // Thêm trường options vào dữ liệu
          return {
            ...item,
            options: options,
            // Tìm đáp án đúng nếu có
            correctAnswer: item.answer || item.correct_option || item.correct_answer || options[0]
          };
        });
        
        setQuizData(dataArray);
      } else {
        console.error("Không có dữ liệu trả về từ API hoặc dữ liệu không đúng định dạng");
        setQuizData([]);
      }
    } catch (error) {
      setQuizData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  // Áp dụng CSS animation
  useEffect(() => {
    // Tạo style element
    const styleElement = document.createElement('style');
    styleElement.innerHTML = pulseKeyframes;
    document.head.appendChild(styleElement);
    
    // Cleanup khi component unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Đếm ngược thời gian làm bài
  useEffect(() => {
    // Nếu không có thời gian hoặc đã hiển thị kết quả
    if (timeLeft === null || timeLeft <= 0 ) {
      return;
    }

    // Thiết lập bộ đếm thời gian
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          // Khi hết thời gian, tự động nộp bài
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    // Dọn dẹp bộ đếm khi component unmount
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format thời gian từ giây sang dạng mm:ss
  const formatTime = (seconds) => {
    if (seconds === null || seconds < 0) return '--:--';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Chuyển đổi options thành format A, B, C, D
  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  
  // State
  const [currentAnswers, setCurrentAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Xử lý khi chọn câu trả lời
  const handleAnswerSelect = (questionId, answerIndex) => {
    // Đảm bảo quizData và options tồn tại
    const question = quizData.find(q => q.id === questionId);
    if (!question || !question.options) return;
    
    // Lưu đáp án với giá trị thực tế, không phải label
    const actualAnswer = question.options[answerIndex];
    
    setCurrentAnswers({
      ...currentAnswers,
      [questionId]: {
        labelIndex: answerIndex,
        value: actualAnswer
      }
    });
  };

  // Xử lý nộp bài
  const handleSubmit = async () => {
    // Kiểm tra xem đã trả lời đủ số câu chưa
    const answeredCount = Object.keys(currentAnswers).length;
    const totalQuestions = quizData.length;
    
    if (answeredCount < totalQuestions) {
      Modal.confirm({
        title: 'Xác nhận nộp bài',
        content: `Bạn mới chỉ trả lời ${answeredCount}/${totalQuestions} câu hỏi. Bạn có chắc chắn muốn nộp bài không?`,
        okText: 'Nộp bài',
        cancelText: 'Tiếp tục làm bài',
        onOk: () => submitQuiz()
      });
    } else {
      Modal.confirm({
        title: 'Xác nhận nộp bài',
        content: 'Bạn đã trả lời đủ số câu hỏi. Bạn có chắc chắn muốn nộp bài không?',
        okText: 'Nộp bài',
        cancelText: 'Kiểm tra lại',
        onOk: () => submitQuiz()
      });
    }
  };
  
  // Hàm thực hiện việc nộp bài
  const submitQuiz = async () => {
    try {
      setSubmitting(true);
      
      // Tính điểm
      const score = calculateScore();
      const totalQuestions = quizData.length;
      
      // Chuẩn bị dữ liệu để gửi đi
      const submissionData = {
        quiz_id: params.quizId,
        score: score,
        total_questions: totalQuestions,
        answers: Object.entries(currentAnswers).map(([questionId, answer]) => ({
          question_id: questionId,
          selected_option: answer.value,
          is_correct: answer.value === (quizData.find(q => q.id === parseInt(questionId))?.correctAnswer || '')
        }))
      };
      console.log(submissionData)
      
      // Gửi kết quả đến API
      await quizResultService.submitQuiz(submissionData).then(()=>{
        message.success('Bạn đã hoàn thành bài kiểm tra!');
        navigate('/user/quizzes');
      });
      
    } catch (error) {
      console.error('Lỗi khi nộp bài:', error);
      message.error('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  // Chuyển đến câu hỏi được chọn
  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Tính điểm
  const calculateScore = () => {
    if (!quizData || quizData.length === 0) return 0;
    
    let correctCount = 0;
    quizData.forEach(question => {
      if (!question || !currentAnswers[question.id]) return;
      
      // Lấy đáp án người dùng đã chọn
      const userAnswer = currentAnswers[question.id].value;
      
      // Lấy đáp án đúng từ các trường có thể có
      const correctAnswer = question.correctAnswer || 
                          question.answer || 
                          question.correct_option || 
                          question.correct_answer;
      
      if (userAnswer === correctAnswer) {
        correctCount++;
      }
    });
    return correctCount;
  };

  // Đánh dấu trạng thái câu hỏi
  const getQuestionStatus = (index) => {
    if (!quizData || !quizData[index]) return 'wait';
    
    const question = quizData[index];
    if (currentAnswers[question.id]) {
      return 'finish'; // Đã trả lời
    }
    
    return 'wait'; // Chưa trả lời
  };

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <div style={{ 
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0f7fa 0%, #bbdefb 100%)'
      }}>
        <div style={{
          fontSize: '24px',
          padding: '20px 40px',
          borderRadius: '8px',
          background: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          Đang tải bài kiểm tra...
        </div>
      </div>
    );
  }
  
  // Kiểm tra nếu không có dữ liệu
  if (!quizData || quizData.length === 0) {
    return (
      <div style={{ 
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0f7fa 0%, #bbdefb 100%)'
      }}>
        <Card 
          style={{ 
            borderRadius: '16px',
            width: '500px',
            textAlign: 'center',
            padding: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}
        >
          <Result
            status="warning"
            title="Không tìm thấy bài kiểm tra"
            subTitle="Không thể tải dữ liệu bài kiểm tra hoặc bài kiểm tra không tồn tại."
            extra={
              <Button type="primary" onClick={() => window.history.back()}>
                Quay lại
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  // Tính phần trăm hoàn thành
  const completionPercentage = Math.round((Object.keys(currentAnswers).length / quizData.length) * 100);

  // Lấy câu hỏi hiện tại
  const currentQuestion = quizData[currentQuestionIndex];
  
  // Kiểm tra câu hỏi hiện tại có tồn tại không
  if (!currentQuestion) {
    return (
      <div style={{ 
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0f7fa 0%, #bbdefb 100%)'
      }}>
        <Card 
          style={{ 
            borderRadius: '16px',
            width: '500px',
            textAlign: 'center',
            padding: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}
        >
          <Result
            status="warning"
            title="Lỗi câu hỏi"
            subTitle="Không thể hiển thị câu hỏi này. Vui lòng thử lại sau."
            extra={
              <Button type="primary" onClick={() => window.history.back()}>
                Quay lại
              </Button>
            }
          />
        </Card>
      </div>
    );
  }
  
  // Lấy nội dung câu hỏi từ các trường có thể có
  const questionText = currentQuestion.question || 
                      currentQuestion.question_text || 
                      currentQuestion.content || 
                      currentQuestion.title || 
                      "Câu hỏi không có tiêu đề";

  // Render bài kiểm tra
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #e0f7fa 0%, #bbdefb 100%)',
      padding: '24px'
    }}>
      <Card 
        className="w-full max-w-4xl mx-auto my-8" 
        style={{ 
          borderRadius: '16px', 
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}
        bodyStyle={{ padding: '0' }}
      >
        <div style={{ 
          padding: '24px', 
          borderBottom: '1px solid #f0f0f0', 
          background: 'linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)',
          borderRadius: '16px 16px 0 0' 
        }}>
          <Row align="middle">
            <Col span={16}>
              <Title level={2} style={{ margin: 0, color: '#fff', fontWeight: '600' }}>
                {quizInfo?.title || "Bài Kiểm Tra Trắc Nghiệm"}
              </Title>
              {quizInfo?.description && (
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', marginTop: '8px', display: 'block' }}>
                  {quizInfo.description}
                </Text>
              )}
            </Col>
            <Col span={8} style={{ textAlign: 'right' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  background: timeLeft && timeLeft < 60 
                    ? 'rgba(255, 77, 79, 0.25)' 
                    : (timeLeft && timeLeft < 300 ? 'rgba(250, 173, 20, 0.25)' : 'rgba(255, 255, 255, 0.15)'), 
                  padding: '6px 16px',
                  borderRadius: '20px',
                  animation: timeLeft && timeLeft < 60 ? 'pulse 1s infinite' : 'none'
                }}>
                  <ClockCircleOutlined style={{ 
                    color: timeLeft && timeLeft < 60 ? '#ff4d4f' : (timeLeft && timeLeft < 300 ? '#faad14' : '#fff'),
                    marginRight: '8px' 
                  }}/>
                  <Text style={{ 
                    color: timeLeft && timeLeft < 60 ? '#ff4d4f' : (timeLeft && timeLeft < 300 ? '#faad14' : '#fff'),
                    fontFamily: 'monospace', 
                    fontSize: '18px', 
                    fontWeight: '600' 
                  }}>
                    {formatTime(timeLeft)}
                  </Text>
                </div>
              </div>
              <Statistic 
                title={<span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Hoàn thành</span>}
                value={completionPercentage}
                precision={0}
                suffix="%"
                valueStyle={{ color: '#fff', fontWeight: '600' }}
              />
            </Col>
          </Row>
        </div>
        
        <div style={{ padding: '28px' }}>
          <Row gutter={24}>
            {/* Phần hiển thị danh sách câu hỏi (bên trái) */}
            <Col span={7}>
              <Card 
                title={
                  <Space>
                    <BookOutlined style={{ color: '#1890ff' }} /> 
                    <span style={{ fontWeight: '600', color: '#262626' }}>Danh sách câu hỏi</span>
                  </Space>
                }
                className="mb-4"
                style={{ 
                  borderRadius: '12px', 
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  overflow: 'hidden'
                }}
                headStyle={{ background: '#fafafa' }}
              >
                <Steps
                  direction="vertical"
                  size="small"
                  current={currentQuestionIndex}
                  onChange={goToQuestion}
                  style={{ padding: '0 8px' }}
                  items={quizData.map((question, index) => {
                    if (!question) return null;
                    const isAnswered = !!currentAnswers[question.id];
                    return {
                      title: `Câu ${index + 1}`,
                      status: getQuestionStatus(index),
                      icon: isAnswered ? <CheckCircleFilled /> : <ClockCircleOutlined />,
                      description: (
                        <Badge 
                          status={isAnswered ? "success" : "default"} 
                          text={isAnswered ? "Đã trả lời" : "Chưa trả lời"}
                          style={{ color: isAnswered ? '#52c41a' : '#999' }}
                        />
                      )
                    };
                  }).filter(Boolean)}
                />
              </Card>
              
              <div style={{ 
                background: '#fafafa', 
                padding: '16px', 
                borderRadius: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ 
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <Text style={{ color: '#595959' }}>Tiến độ làm bài</Text>
                  <Text strong>{`${Object.keys(currentAnswers).length}/${quizData.length}`}</Text>
                </div>
                <Progress 
                  percent={completionPercentage} 
                  status="active" 
                  strokeColor={{
                    '0%': '#1890ff',
                    '100%': '#52c41a',
                  }}
                  style={{ marginBottom: '0' }}
                />
              </div>
              
              <Tooltip title="Hoàn thành bài kiểm tra">
                <Button 
                  type="primary" 
                  shape="round" 
                  icon={<CheckOutlined />} 
                  onClick={handleSubmit} 
                  style={{ marginLeft: '8px' }}
                  loading={submitting}
                  disabled={submitting}
                >
                  Nộp bài
                </Button>
              </Tooltip>
            </Col>
            
            {/* Phần hiển thị nội dung câu hỏi (bên phải) */}
            <Col span={17}>
              <Card 
                title={
                  <Space size="middle">
                    <Badge 
                      count={currentQuestionIndex + 1} 
                      style={{ 
                        backgroundColor: '#1890ff',
                        boxShadow: '0 2px 6px rgba(24, 144, 255, 0.4)',
                        width: '28px',
                        height: '28px',
                        fontWeight: '500',
                        fontSize: '14px'
                      }} 
                    />
                    <Text strong style={{ fontSize: '17px', color: '#262626' }}>{questionText}</Text>
                  </Space>
                }
                style={{ 
                  borderRadius: '12px', 
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  minHeight: '450px'
                }}
                headStyle={{ background: '#fafafa' }}
              >
                {currentQuestion.options && currentQuestion.options.length > 0 ? (
                  <Space direction="vertical" style={{ width: '100%' }} size="large">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = currentAnswers[currentQuestion.id]?.labelIndex === index;
                      
                      return (
                        <div 
                          key={index}
                          style={{
                            padding: '16px',
                            borderRadius: '10px',
                            border: `2px solid ${isSelected ? '#1890ff' : '#e8e8e8'}`,
                            background: isSelected ? 'rgba(230, 247, 255, 0.6)' : '#fff',
                            transition: 'all 0.3s',
                            cursor: 'pointer',
                            boxShadow: isSelected ? '0 2px 10px rgba(24, 144, 255, 0.15)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}
                          onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: isSelected ? '#1890ff' : '#f5f5f5',
                            color: isSelected ? '#fff' : '#595959',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            flexShrink: 0,
                            transition: 'all 0.3s ease',
                            border: isSelected ? 'none' : '1px solid #e8e8e8'
                          }}>
                            {optionLabels[index]}
                          </div>
                          <Text style={{ 
                            fontSize: '16px', 
                            color: isSelected ? '#262626' : '#595959',
                            fontWeight: isSelected ? '500' : 'normal'
                          }}>
                            {option}
                          </Text>
                          {isSelected && (
                            <CheckCircleFilled style={{ 
                              color: '#1890ff', 
                              fontSize: '20px',
                              marginLeft: 'auto'
                            }} />
                          )}
                        </div>
                      );
                    })}
                  </Space>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Text>Không có đáp án cho câu hỏi này</Text>
                  </div>
                )}
                
                <Divider style={{ margin: '28px 0' }} />
                
                <Row gutter={16} justify="space-between">
                  <Col>
                    <Button 
                      icon={<LeftOutlined />}
                      onClick={() => goToQuestion(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                      size="large"
                      style={{ 
                        borderRadius: '8px',
                        height: '44px',
                        width: '130px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      Câu trước
                    </Button>
                  </Col>
                  <Col>
                    <Button 
                      type="primary"
                      size="large"
                      icon={<RightOutlined />}
                      onClick={() => goToQuestion(Math.min(quizData.length - 1, currentQuestionIndex + 1))}
                      disabled={currentQuestionIndex === quizData.length - 1}
                      style={{ 
                        borderRadius: '8px',
                        height: '44px',
                        width: '140px',
                        background: '#1890ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      Câu tiếp theo
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
};

export default QuizApp;