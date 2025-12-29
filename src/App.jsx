import React, { useState, useEffect } from 'react';
import questionsData from './data/questions.json';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { ProgressBar } from './components/ProgressBar';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Trophy, ChevronRight, ChevronLeft, BookOpen, LayoutGrid, Zap, Table, X, Search } from 'lucide-react';

// Fisher-Yates 洗牌算法
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // 记录用户答案 { [index]: 'Option Content' }
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [mode, setMode] = useState('exam'); // 'exam' | 'practice'
  const [showAnswer, setShowAnswer] = useState(false); // For practice mode peeking
  const [showQuestionBank, setShowQuestionBank] = useState(false); // 题库概览
  const [searchTerm, setSearchTerm] = useState(""); // 题库搜索关键词
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    content: null,
    onConfirm: () => {},
    cancelText: "取消",
    confirmText: "确定"
  });

  // 初始化：加载并打乱题目
  useEffect(() => {
    // 模拟异步加载，确保状态重置
    setTimeout(() => {
      startNewQuiz(mode);
      setIsLoading(false);
    }, 100);
  }, []);

  const startNewQuiz = (targetMode = mode) => {
    let newQuestions;
    if (targetMode === 'practice') {
        newQuestions = [...questionsData]; // 背题模式：不打乱，按顺序
    } else {
        newQuestions = shuffleArray(questionsData); // 考试模式：打乱顺序
    }
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setUserAnswers({});
    setScore(0);
    setWrongQuestions([]);
    setQuizFinished(false);
    setIsDrawerOpen(false);
    setShowAnswer(false);
    setShowQuestionBank(false);
  };

  const handleModeSwitch = (newMode) => {
    if (newMode === mode) return;
    
    const messages = {
      exam: {
        title: "切换到考试模式",
        content: (
          <div className="space-y-2 text-sm text-lark-gray-6">
            <p>确认切换到【考试模式】吗？</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>答题过程不显示正确答案和解析</li>
              <li>必须做完所有题目才能提交</li>
              <li>模拟真实考试环境</li>
            </ul>
            <p className="text-lark-error pt-2 font-medium">注意：切换模式将重新开始答题，当前进度会被重置。</p>
          </div>
        )
      },
      practice: {
        title: "切换到背题模式",
        content: (
          <div className="space-y-2 text-sm text-lark-gray-6">
            <p>确认切换到【背题模式】吗？</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>选择选项后立即显示对错和解析</li>
              <li>可随时点击“查看答案”</li>
              <li>适合快速刷题记忆</li>
              <li>题目将按题库顺序排列</li>
            </ul>
            <p className="text-lark-error pt-2 font-medium">注意：切换模式将重新开始答题，当前进度会被重置。</p>
          </div>
        )
      }
    };

    setConfirmDialog({
      isOpen: true,
      title: messages[newMode].title,
      content: messages[newMode].content,
      onConfirm: () => {
        setMode(newMode);
        startNewQuiz(newMode);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      cancelText: "取消",
      confirmText: "确定"
    });
  };

  // 滚动到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIndex]);

  const handleOptionSelect = (option) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentIndex]: option
    }));
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const handleNext = () => {
    // 检查是否已选择答案
    // In practice mode, allow next if answer is shown (even if not selected)?
    // Let's keep it simple: must select or show answer to proceed? 
    // Usually next button is just next. But currently logic requires selection.
    // Let's relax it for practice mode if answer is shown?
    // Actually, userAnswers[currentIndex] check is at line 68.
    
    if (mode === 'exam' && !userAnswers[currentIndex]) return;
    if (mode === 'practice' && !userAnswers[currentIndex] && !showAnswer) {
        // If practice mode, allow skip? Or require answer?
        // Let's require answer OR showAnswer.
        // If they just want to read, they can click "Show Answer" then "Next".
        // But if they just want to skip?
        // Let's stick to: if answer is shown (by peek or select), allow next.
        // If neither, maybe allow next in practice mode?
        // Let's allow Next in practice mode regardless? 
        // No, typically you want to at least try or see answer.
        // Let's keep strict for Exam, but for Practice:
        // If they click Next without answering, maybe just show answer?
        // Let's just allow Next if answer is visible.
        return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // 提交前检查是否所有题目都已作答
      const unansweredIndices = questions.map((_, index) => index).filter(index => !userAnswers[index]);
      
      if (unansweredIndices.length > 0) {
        // 如果有未答题目，提示用户并跳转到第一个未答题目
        if (window.confirm(`还有 ${unansweredIndices.length} 道题目未作答，是否跳转到第一道未答题目？`)) {
           jumpToQuestion(unansweredIndices[0]);
        }
        return;
      }

      finishQuiz();
    }
  };

  const jumpToQuestion = (index) => {
    setCurrentIndex(index);
    setIsDrawerOpen(false);
    setShowAnswer(false);
  };

  const calculateResult = (answers) => {
    let currentScore = 0;
    const currentWrong = [];

    questions.forEach((q, index) => {
      const userAnswer = answers[index];
      if (userAnswer) {
        const selectedLetter = userAnswer.charAt(0);
        const correctLetter = q.answer.trim().toUpperCase();
        
        if (selectedLetter === correctLetter) {
          currentScore += q.score;
        } else {
          currentWrong.push({
            ...q,
            userAnswer: selectedLetter
          });
        }
      } else {
        // 未答题处理为错题
        currentWrong.push({
          ...q,
          userAnswer: null
        });
      }
    });

    setScore(currentScore);
    setWrongQuestions(currentWrong);
    setQuizFinished(true);
    setIsDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finishQuiz = () => {
    calculateResult(userAnswers);
  };

  if (isLoading || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-lark-gray-1 text-lark-gray-5 gap-3">
        <div className="w-8 h-8 border-4 border-lark-primary border-t-transparent rounded-full animate-spin"></div>
        <p>正在准备题库...</p>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // 结果页 / 错题本
  // ----------------------------------------------------------------
  if (quizFinished) {
    const totalScore = questions.reduce((acc, curr) => acc + curr.score, 0);
    const percentage = Math.round((score / totalScore) * 100);

    return (
      <div className="min-h-screen bg-lark-gray-1 py-6 px-4 pb-24">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* 成绩概览卡片 */}
          <Card className="text-center py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center shadow-sm">
                <Trophy className="w-10 h-10 text-yellow-500" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-lark-gray-7 mb-2">练习结束</h1>
            <p className="text-lark-gray-5 mb-8 text-sm">这里是你的练习报告</p>
            
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8">
              <div className="bg-lark-gray-1 rounded-lark-md p-3">
                <div className="text-lark-gray-5 text-xs mb-1">最终得分</div>
                <div className="text-xl font-bold text-lark-primary">{score}</div>
              </div>
              <div className="bg-lark-gray-1 rounded-lark-md p-3">
                <div className="text-lark-gray-5 text-xs mb-1">正确率</div>
                <div className={`text-xl font-bold ${percentage >= 60 ? 'text-lark-success' : 'text-lark-error'}`}>
                  {percentage}%
                </div>
              </div>
              <div className="bg-lark-gray-1 rounded-lark-md p-3">
                <div className="text-lark-gray-5 text-xs mb-1">错题数</div>
                <div className="text-xl font-bold text-lark-error">{wrongQuestions.length}</div>
              </div>
            </div>

            <Button onClick={startNewQuiz} size="lg" className="w-full sm:w-auto shadow-lark-base">
              <RefreshCw className="w-4 h-4 mr-2" />
              重新练习 (题目已打乱)
            </Button>
          </Card>

          {/* 错题本区域 */}
          {wrongQuestions.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 ml-1 text-lark-gray-7 font-medium">
                <BookOpen className="w-5 h-5 text-lark-primary" />
                <h2>错题本 ({wrongQuestions.length}题)</h2>
              </div>
              
              {wrongQuestions.map((q, idx) => (
                <Card key={idx} className="border-l-4 border-l-lark-error relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${Math.min(idx * 50, 1000)}ms` }}>
                  <div className="relative z-10">
                    <div className="flex items-start gap-3 mb-4 pr-6">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-lark-error/10 text-lark-error flex items-center justify-center text-xs font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <h3 className="text-base font-medium text-lark-gray-7 leading-relaxed">
                        {q.question}
                      </h3>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {q.options.map((opt, i) => {
                        const letter = opt.charAt(0);
                        const isCorrect = letter === q.answer;
                        const isUserWrong = letter === q.userAnswer;
                        
                        let optionClass = "p-3 rounded-lark-sm border border-transparent text-sm flex justify-between items-center ";
                        let icon = null;

                        if (isCorrect) {
                          optionClass += "bg-lark-success-bg text-lark-success border-lark-success/30 font-medium";
                          icon = <CheckCircle className="w-4 h-4" />;
                        } else if (isUserWrong) {
                          optionClass += "bg-lark-error-bg text-lark-error border-lark-error/30 font-medium";
                          icon = <XCircle className="w-4 h-4" />;
                        } else {
                          optionClass += "bg-lark-gray-1 text-lark-gray-5";
                        }

                        return (
                          <div key={i} className={optionClass}>
                            <span>{opt}</span>
                            {icon}
                          </div>
                        );
                      })}
                      {q.userAnswer === null && (
                        <div className="text-xs text-lark-error mt-2 font-medium">未作答</div>
                      )}
                    </div>

                    <div className="bg-lark-gray-1 rounded-lark-md p-4 text-sm mt-4">
                      <div className="flex items-center gap-2 text-lark-gray-7 font-medium mb-2">
                        <AlertCircle className="w-4 h-4 text-lark-primary" />
                        <span>解析</span>
                      </div>
                      <div className="text-lark-gray-6 leading-relaxed text-justify">
                        {q.explanation}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="py-12 text-center bg-lark-success-bg/30 border-dashed border-2 border-lark-success/20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-lark-success rounded-full flex items-center justify-center text-white">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-lark-gray-7">全对！太棒了！</h3>
                  <p className="text-lark-gray-5 text-sm mt-1">没有错题，继续保持</p>
                </div>
              </div>
            </Card>
          )}

          {/* 结果页底部作者信息 */}
          <div className="mt-8 text-center text-xs text-lark-gray-4">
              清美栖山路三店 方细晶
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // 答题页
  // ----------------------------------------------------------------
  const currentQuestion = questions[currentIndex];
  const progress = currentIndex + 1;
  const total = questions.length;
  // 关键：从 userAnswers 中获取当前题目的已选答案，实现回显
  const selectedOption = userAnswers[currentIndex];

  return (
    <div className="min-h-screen bg-lark-gray-1 flex flex-col">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-50 bg-white border-b border-lark-gray-2 px-4 py-3 shadow-sm">
        <div className="max-w-2xl mx-auto w-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowQuestionBank(true)}
                className="sm:hidden px-2 py-1.5 rounded-full bg-lark-primary/10 text-xs text-lark-primary flex items-center gap-1.5 active:bg-lark-primary/20 transition-colors font-medium"
              >
                <Table className="w-3.5 h-3.5" />
                <span>题库</span>
              </button>
              <h1 className="text-sm font-medium text-lark-gray-7">题目 {progress} / {total}</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-lark-gray-2 rounded-lg p-0.5 mr-1 sm:mr-2">
                <button
                  onClick={() => handleModeSwitch('exam')}
                  className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-all ${mode === 'exam' ? 'bg-white text-lark-primary shadow-sm' : 'text-lark-gray-5 hover:text-lark-gray-7'}`}
                >
                  <span className="hidden sm:inline">考试模式</span>
                  <span className="sm:hidden">考试</span>
                </button>
                <button
                  onClick={() => handleModeSwitch('practice')}
                  className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-all ${mode === 'practice' ? 'bg-white text-lark-primary shadow-sm' : 'text-lark-gray-5 hover:text-lark-gray-7'}`}
                >
                  <span className="hidden sm:inline">背题模式</span>
                  <span className="sm:hidden">背题</span>
                </button>
              </div>
              <button 
                onClick={() => setShowQuestionBank(true)}
                className="hidden sm:flex px-2 sm:px-3 py-1.5 rounded-full bg-lark-primary/10 text-xs text-lark-primary items-center gap-1.5 active:bg-lark-primary/20 transition-colors font-medium hover:bg-lark-primary/15"
                title="查看完整题库"
              >
                <Table className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">完整题库</span>
                <span className="sm:hidden">题库</span>
              </button>
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="hidden sm:flex px-3 py-1.5 rounded-full bg-lark-gray-1 text-xs text-lark-primary items-center gap-1.5 active:bg-lark-gray-2 transition-colors font-medium"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>答题卡</span>
              </button>
            </div>
          </div>
          <div className="w-full h-1.5 bg-lark-gray-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-lark-primary transition-all duration-300 ease-out"
              style={{ width: `${(progress / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 p-4 pb-36 md:pb-32 md:py-8">
        <div className="max-w-2xl mx-auto h-full flex flex-col">
          <Card className="flex-1 flex flex-col min-h-[60vh] md:min-h-[500px]">
            {/* 题目内容 */}
            <div className="mb-6 md:mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lark-sm bg-lark-primary/10 text-lark-primary text-xs font-medium">
                  单选题 {currentQuestion.score}分
                </span>
                {selectedOption && (
                  <span className="text-xs text-lark-success font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> 已作答
                  </span>
                )}
              </div>
              <h2 className="text-lg md:text-xl font-medium text-lark-gray-7 leading-relaxed text-justify">
                {currentQuestion.question}
              </h2>
            </div>

            {/* 选项列表 */}
            <div className="space-y-3 md:space-y-4 flex-1">
              {currentQuestion.options.map((option, index) => {
                const letter = String.fromCharCode(65 + index);
                const isSelected = selectedOption === option;
                
                // Practice Mode Logic
                const isPracticeMode = mode === 'practice';
                const showResult = isPracticeMode && (selectedOption || showAnswer); // Show if answered or forced show
                const isCorrect = letter === currentQuestion.answer.trim().toUpperCase();
                
                let optionStyle = "";
                let icon = null;

                if (showResult) {
                  if (isCorrect) {
                    optionStyle = "border-lark-success bg-lark-success-bg text-lark-success ring-1 ring-lark-success shadow-sm";
                    icon = <CheckCircle className="w-5 h-5 text-lark-success ml-auto" />;
                  } else if (isSelected) {
                    optionStyle = "border-lark-error bg-lark-error-bg text-lark-error ring-1 ring-lark-error shadow-sm";
                    icon = <XCircle className="w-5 h-5 text-lark-error ml-auto" />;
                  } else {
                     optionStyle = "border-lark-gray-2 bg-white text-lark-gray-5 opacity-60";
                  }
                } else {
                  // Exam Mode or Practice Mode (before answer)
                  optionStyle = isSelected
                    ? "border-lark-primary bg-lark-primary-lighter text-lark-primary ring-1 ring-lark-primary shadow-sm"
                    : "border-lark-gray-2 bg-white text-lark-gray-7 active:bg-lark-gray-1";
                }

                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (!showResult || mode === 'exam') { // Prevent changing answer in practice mode after showing result? Or allow? Let's allow change but it will update result.
                         handleOptionSelect(option);
                      }
                    }}
                    className={`
                      relative p-4 rounded-lark-md border cursor-pointer transition-all duration-200
                      flex items-center gap-3 active:scale-[0.99] touch-manipulation
                      ${optionStyle}
                    `}
                  >
                    <div className={`
                      flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium transition-colors
                      ${showResult 
                          ? (isCorrect ? 'border-lark-success bg-lark-success text-white' : (isSelected ? 'border-lark-error bg-lark-error text-white' : 'border-lark-gray-3 text-lark-gray-5'))
                          : (isSelected ? 'border-lark-primary bg-lark-primary text-white' : 'border-lark-gray-3 text-lark-gray-5')
                      }
                    `}>
                      {letter}
                    </div>
                    <span className="text-sm md:text-base leading-relaxed select-none flex-1">{option.substring(option.indexOf('.') + 1).trim()}</span>
                    {icon}
                  </div>
                );
              })}
            </div>

            {/* 解析区域 (背题模式下显示) */}
            {mode === 'practice' && (selectedOption || showAnswer) && (
              <div className="mt-6 pt-6 border-t border-lark-gray-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-lark-gray-1 rounded-lark-md p-4 text-sm">
                  <div className="flex items-center gap-2 text-lark-gray-7 font-medium mb-2">
                    <AlertCircle className="w-4 h-4 text-lark-primary" />
                    <span>解析</span>
                  </div>
                  <div className="text-lark-gray-6 leading-relaxed text-justify">
                    {currentQuestion.explanation}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* 底部作者信息 */}
          <div className="mt-6 text-center text-xs text-lark-gray-4 pb-2">
             清美栖山路三店 方细晶
          </div>
        </div>
      </div>

      {/* 底部操作栏 - 增加 padding-bottom 适配全面屏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-lark-gray-2 px-4 py-4 pb-8 md:pb-4 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-2xl mx-auto flex gap-3 items-center">
          <Button 
            onClick={handlePrev} 
            disabled={currentIndex === 0} 
            variant="outline"
            size="xl"
            className="flex-1 active:scale-[0.98] transition-transform text-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            上一题
          </Button>

          {/* 答题卡按钮 - 增加文字说明 */}
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center justify-center px-4 gap-1 text-lark-gray-5 hover:text-lark-primary active:opacity-70 transition-colors"
          >
            <LayoutGrid className="w-6 h-6" />
            <span className="text-[10px] font-medium">答题卡</span>
          </button>

          {/* Practice Mode: Show Answer Button */}
          {mode === 'practice' && !selectedOption && !showAnswer && (
             <Button
               onClick={() => setShowAnswer(true)}
               variant="outline"
               size="xl"
               className="flex-[2] active:scale-[0.98] transition-transform text-sm font-semibold border-lark-primary text-lark-primary bg-white"
             >
               <BookOpen className="w-4 h-4 mr-1" />
               查看答案
             </Button>
          )}
          
          {/* Next Button (Hidden if Show Answer is visible to avoid clutter? Or show both?) */}
          {/* Let's show Next button always, but maybe disabled? */}
          {/* If Show Answer is visible, we replace Next button? No, we might want to skip. */}
          {/* Let's stack them or hide Next until answered/shown? */}
          {/* If I hide Next, user can't skip. But user should answer or see answer first. */}
          {/* Let's just swap them: If Practice & No Answer & No Show -> Show "Show Answer" button (primary) and "Next" (secondary/disabled)? */}
          {/* To keep layout simple: */}
          {/* If (Practice & !selected & !showAnswer), show "Show Answer" INSTEAD of "Next"? */}
          {/* But we need "Next" to skip? Maybe "Show Answer" is better. */}
          {/* Let's just keep Next button but enable it if showAnswer is true. */}
          
          {!(mode === 'practice' && !selectedOption && !showAnswer) && (
            <Button 
                onClick={handleNext} 
                disabled={mode === 'exam' ? !selectedOption : (!selectedOption && !showAnswer)} 
                size="xl"
                className="flex-[2] shadow-lark-base active:scale-[0.98] transition-transform text-sm font-semibold"
            >
                {currentIndex < questions.length - 1 ? (
                <span className="flex items-center justify-center gap-1">
                    下一题 <ChevronRight className="w-4 h-4" />
                </span>
                ) : (
                <span className="flex items-center justify-center gap-1">
                    提交试卷 <CheckCircle className="w-4 h-4" />
                </span>
                )}
            </Button>
          )}
        </div>
      </div>

      {/* 题目导航抽屉 */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center">
          {/* 遮罩 */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* 抽屉内容 */}
          <div className="relative w-full max-w-lg bg-white rounded-t-xl sm:rounded-xl shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-5 fade-in duration-300">
            <div className="p-4 border-b border-lark-gray-2 flex items-center justify-between">
              <h3 className="font-semibold text-lark-gray-7 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-lark-primary" />
                答题卡
              </h3>
              <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-lark-primary"></div>
                  <span className="text-lark-gray-5">已答</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full border border-lark-primary"></div>
                  <span className="text-lark-gray-5">当前</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-lark-gray-2"></div>
                  <span className="text-lark-gray-5">未答</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto grid grid-cols-6 sm:grid-cols-8 gap-2.5 pb-8">
              {questions.map((_, index) => {
                const isAnswered = !!userAnswers[index];
                const isCurrent = index === currentIndex;
                
                let btnStyle = "bg-lark-gray-1 text-lark-gray-5 border-transparent hover:bg-lark-gray-2";
                if (isCurrent) {
                  btnStyle = "border-lark-primary text-lark-primary ring-2 ring-lark-primary/20 bg-white font-bold";
                } else if (isAnswered) {
                  btnStyle = "bg-lark-primary text-white border-transparent shadow-sm";
                }

                return (
                  <button
                    key={index}
                    onClick={() => jumpToQuestion(index)}
                    className={`
                      h-9 rounded-lark-sm border text-sm font-medium transition-all
                      flex items-center justify-center
                      ${btnStyle}
                    `}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="p-4 border-t border-lark-gray-2 bg-lark-gray-1/50">
              <Button 
                onClick={() => setIsDrawerOpen(false)} 
                variant="outline" 
                className="w-full bg-white"
              >
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 完整题库概览模态框 */}
      {showQuestionBank && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowQuestionBank(false)}
          />
          <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-lark-gray-2 flex flex-col gap-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Table className="w-5 h-5 text-lark-primary" />
                  <h2 className="text-lg font-semibold text-lark-gray-7">完整题库概览 ({questionsData.length}题)</h2>
                </div>
                <button 
                  onClick={() => setShowQuestionBank(false)}
                  className="p-1.5 rounded-full hover:bg-lark-gray-2 text-lark-gray-5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* 搜索框 */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-lark-gray-4" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-lark-gray-3 rounded-md leading-5 bg-white placeholder-lark-gray-4 focus:outline-none focus:ring-1 focus:ring-lark-primary focus:border-lark-primary sm:text-sm transition duration-150 ease-in-out"
                  placeholder="搜索题目、选项或解析..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Content - Scrollable Table or Cards */}
            <div className="overflow-auto flex-1 p-0 sm:p-4 bg-lark-gray-1">
              
              {/* Filter Data */}
              {(() => {
                const filteredQuestions = questionsData.filter(q => 
                  q.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  q.options.some(opt => opt.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  q.explanation.toLowerCase().includes(searchTerm.toLowerCase())
                );

                if (filteredQuestions.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-12 text-lark-gray-5">
                      <Search className="w-12 h-12 mb-3 opacity-20" />
                      <p>未找到匹配的题目</p>
                    </div>
                  );
                }

                return (
                  <>
                    {/* Mobile View: Cards */}
                    <div className="sm:hidden space-y-3 p-3">
                      {filteredQuestions.map((q, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-lark-gray-2">
                          <div className="flex justify-between items-start mb-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-lark-gray-2 text-lark-gray-6 text-xs font-bold">
                              {q.id}
                            </span>
                            <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-lark-success-bg text-lark-success font-bold text-xs border border-lark-success/20">
                               {q.answer}
                            </span>
                          </div>
                          
                          <div className="mb-3">
                            <h4 className="font-medium text-lark-gray-8 text-sm mb-2">
                              {q.question.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => 
                                part.toLowerCase() === searchTerm.toLowerCase() ? <span key={i} className="bg-yellow-200 text-lark-gray-9">{part}</span> : part
                              )}
                            </h4>
                            <div className="space-y-1 pl-1 border-l-2 border-lark-gray-2">
                              {q.options.map((opt, i) => (
                                <div key={i} className={`text-xs pl-2 py-0.5 ${opt.startsWith(q.answer) ? 'text-lark-primary font-medium bg-lark-primary/5 rounded-r' : 'text-lark-gray-5'}`}>
                                  {opt.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, j) => 
                                    part.toLowerCase() === searchTerm.toLowerCase() ? <span key={j} className="bg-yellow-200 text-lark-gray-9">{part}</span> : part
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-lark-gray-1 rounded-md p-2.5 text-xs">
                            <div className="flex items-center gap-1.5 text-lark-gray-6 font-medium mb-1">
                              <AlertCircle className="w-3 h-3 text-lark-primary" />
                              <span>解析</span>
                            </div>
                            <div className="text-lark-gray-5 leading-relaxed text-justify">
                              {q.explanation.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => 
                                part.toLowerCase() === searchTerm.toLowerCase() ? <span key={i} className="bg-yellow-200 text-lark-gray-9">{part}</span> : part
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop View: Table */}
                    <div className="hidden sm:block bg-white rounded-lg border border-lark-gray-2 overflow-hidden shadow-sm">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-lark-gray-1 text-lark-gray-6 font-medium border-b border-lark-gray-2">
                          <tr>
                            <th className="px-4 py-3 w-16 text-center">序号</th>
                            <th className="px-4 py-3 min-w-[200px]">题目 & 选项</th>
                            <th className="px-4 py-3 w-20 text-center">答案</th>
                            <th className="px-4 py-3 min-w-[250px]">解析</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-lark-gray-2">
                          {filteredQuestions.map((q, idx) => (
                            <tr key={idx} className="hover:bg-lark-gray-1/30 transition-colors">
                              <td className="px-4 py-3 text-center text-lark-gray-5 font-medium">{q.id}</td>
                              <td className="px-4 py-3">
                                <div className="font-medium text-lark-gray-8 mb-1.5">
                                  {q.question.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => 
                                    part.toLowerCase() === searchTerm.toLowerCase() ? <span key={i} className="bg-yellow-200 text-lark-gray-9">{part}</span> : part
                                  )}
                                </div>
                                <div className="space-y-0.5">
                                  {q.options.map((opt, i) => (
                                    <div key={i} className={`text-xs ${opt.startsWith(q.answer) ? 'text-lark-primary font-medium' : 'text-lark-gray-5'}`}>
                                      {opt.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, j) => 
                                        part.toLowerCase() === searchTerm.toLowerCase() ? <span key={j} className="bg-yellow-200 text-lark-gray-9">{part}</span> : part
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-lark-success-bg text-lark-success font-bold text-xs border border-lark-success/20">
                                  {q.answer}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-lark-gray-6 text-xs leading-relaxed">
                                {q.explanation.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => 
                                  part.toLowerCase() === searchTerm.toLowerCase() ? <span key={i} className="bg-yellow-200 text-lark-gray-9">{part}</span> : part
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-lark-gray-2 bg-lark-gray-1/50 flex-shrink-0 flex justify-end">
               <Button 
                onClick={() => setShowQuestionBank(false)} 
                variant="outline" 
                className="bg-white"
              >
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 通用确认弹窗 */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          />
          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-lark-gray-7 mb-3">
                {confirmDialog.title}
              </h3>
              <div className="text-lark-gray-6">
                {confirmDialog.content}
              </div>
            </div>
            
            <div className="p-4 bg-lark-gray-1/50 border-t border-lark-gray-2 flex justify-end gap-3">
              <Button 
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} 
                variant="outline"
                className="bg-white"
              >
                {confirmDialog.cancelText}
              </Button>
              <Button 
                onClick={confirmDialog.onConfirm}
              >
                {confirmDialog.confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
