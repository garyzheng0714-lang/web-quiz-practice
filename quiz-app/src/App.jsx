import React, { useState, useEffect } from 'react';
import questionsData from './data/questions.json';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { ProgressBar } from './components/ProgressBar';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Trophy, ChevronRight, ChevronLeft, BookOpen, LayoutGrid, Zap } from 'lucide-react';

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

  // 初始化：加载并打乱题目
  useEffect(() => {
    // 模拟异步加载，确保状态重置
    setTimeout(() => {
      startNewQuiz();
      setIsLoading(false);
    }, 100);
  }, []);

  const startNewQuiz = () => {
    const shuffled = shuffleArray(questionsData);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setUserAnswers({});
    setScore(0);
    setWrongQuestions([]);
    setQuizFinished(false);
    setIsDrawerOpen(false);
    setShowAnswer(false);
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
      finishQuiz();
    }
  };

  const jumpToQuestion = (index) => {
    setCurrentIndex(index);
    setIsDrawerOpen(false);
    setShowAnswer(false);
  };

  // 模拟自动答题 (Debug 功能)
  const handleAutoFill = () => {
    if (window.confirm('确定要自动随机填写所有题目并提交吗？这将用于测试结果页。')) {
      const simulatedAnswers = {};
      questions.forEach((q, index) => {
        // 随机选择一个选项
        const randomOptionIndex = Math.floor(Math.random() * q.options.length);
        simulatedAnswers[index] = q.options[randomOptionIndex];
      });
      setUserAnswers(simulatedAnswers);
      
      // 这里需要稍微延迟一下再结算，或者直接调用结算逻辑
      // 但由于 setState 是异步的，我们直接用计算出的 answers 去结算比较稳妥
      calculateResult(simulatedAnswers);
    }
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
            <h1 className="text-sm font-medium text-lark-gray-7">题目 {progress} / {total}</h1>
            <div className="flex items-center gap-2">
              <div className="flex bg-lark-gray-2 rounded-lg p-0.5 mr-2">
                <button
                  onClick={() => setMode('exam')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${mode === 'exam' ? 'bg-white text-lark-primary shadow-sm' : 'text-lark-gray-5 hover:text-lark-gray-7'}`}
                >
                  考试模式
                </button>
                <button
                  onClick={() => setMode('practice')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${mode === 'practice' ? 'bg-white text-lark-primary shadow-sm' : 'text-lark-gray-5 hover:text-lark-gray-7'}`}
                >
                  背题模式
                </button>
              </div>
              <button 
                onClick={handleAutoFill}
                className="p-1.5 rounded-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100 active:bg-yellow-200 transition-colors"
                title="模拟自动答题 (测试用)"
              >
                <Zap className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="px-3 py-1.5 rounded-full bg-lark-gray-1 text-xs text-lark-primary flex items-center gap-1.5 active:bg-lark-gray-2 transition-colors font-medium"
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
    </div>
  );
}

export default App;
