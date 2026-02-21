import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Award, Lightbulb } from "lucide-react";
import confetti from "canvas-confetti";

function QuestionPanel({ questions }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isRevealed = revealedAnswers[currentQuestion?.id] !== undefined;
  const hasSelected = userAnswers[currentQuestion?.id] !== undefined;
  const answeredCount = Object.keys(revealedAnswers).length;
  const progress = (answeredCount / questions.length) * 100;

  const score = Object.entries(revealedAnswers).filter(([, isCorrect]) => isCorrect).length;
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const handleOptionSelect = useCallback(
    (questionId, optionIndex) => {
      if (revealedAnswers[questionId] !== undefined) return;
      setUserAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    },
    [revealedAnswers],
  );

  const handleCheckAnswer = useCallback(() => {
    const questionId = currentQuestion.id;
    if (userAnswers[questionId] === undefined) return;
    const isCorrect = userAnswers[questionId] === currentQuestion.correctAnswer;
    setRevealedAnswers((prev) => ({ ...prev, [questionId]: isCorrect }));
  }, [currentQuestion, userAnswers]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((curr) => curr + 1);
    } else {
      setShowResults(true);
      if (percentage >= 80) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#6366f1", "#8b5cf6", "#ec4899"],
        });
      }
    }
  }, [currentQuestionIndex, questions.length, percentage]);

  const handleRetry = () => {
    setUserAnswers({});
    setRevealedAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
  };

  const getOptionStyle = (questionId, optionIndex) => {
    const revealed = revealedAnswers[questionId] !== undefined;
    const isSelected = userAnswers[questionId] === optionIndex;
    const question = questions.find((q) => q.id === questionId);
    const isCorrectOption = question?.correctAnswer === optionIndex;

    if (!revealed) {
      return isSelected
        ? "bg-indigo-500/20 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10"
        : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10 cursor-pointer";
    }

    if (isCorrectOption) return "bg-emerald-500/15 border-emerald-500/40 text-emerald-200";
    if (isSelected && !isCorrectOption) return "bg-red-500/15 border-red-500/40 text-red-200";
    return "bg-white/3 border-white/5 text-slate-500 opacity-50";
  };

  const getCircleStyle = (questionId, optionIndex) => {
    const revealed = revealedAnswers[questionId] !== undefined;
    const isSelected = userAnswers[questionId] === optionIndex;
    const question = questions.find((q) => q.id === questionId);
    const isCorrectOption = question?.correctAnswer === optionIndex;

    if (!revealed) {
      return isSelected
        ? "bg-indigo-500 border-indigo-500 text-white"
        : "border-slate-600 text-slate-500";
    }

    if (isCorrectOption) return "bg-emerald-500 border-emerald-500 text-white";
    if (isSelected && !isCorrectOption) return "bg-red-500 border-red-500 text-white";
    return "border-slate-700 text-slate-600";
  };

  if (showResults) {
    return (
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel rounded-2xl p-8 text-center"
        >
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-indigo-500/10 mb-6 relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <Award className="w-12 h-12 text-indigo-400" />
            </motion.div>
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
          </div>

          <h3 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h3>
          <p className="text-slate-400 mb-2">
            You scored <span className="text-indigo-400 font-bold text-xl">{percentage}%</span>
          </p>
          <p className="text-sm text-slate-500 mb-8">
            {score} of {questions.length} correct
          </p>

          <div className="space-y-4 text-left max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {questions.map((q, idx) => {
              const userAnswer = userAnswers[q.id];
              const isCorrect = revealedAnswers[q.id];

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border ${
                    isCorrect
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-red-500/5 border-red-500/20"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="mt-1">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-slate-200 font-medium mb-1">
                        {idx + 1}. {q.question}
                      </p>
                      {isCorrect ? (
                        <p className="text-sm text-emerald-400/80">
                          Correct: {q.options[q.correctAnswer]}
                        </p>
                      ) : (
                        <>
                          <p className="text-sm text-red-400/80">
                            Your answer: {q.options[userAnswer] ?? "Not answered"}
                          </p>
                          <p className="text-sm text-emerald-400/80">
                            Correct: {q.options[q.correctAnswer]}
                          </p>
                        </>
                      )}
                      {!isCorrect && q.explanation && (
                        <p className="text-xs text-slate-500 mt-2 italic">{q.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <button onClick={handleRetry} className="glass-btn flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Quiz Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Knowledge Check</h2>
          <p className="text-slate-400">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        <div className="w-32">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-panel rounded-2xl p-6 md:p-8"
          >
            <h3 className="text-xl font-medium text-white mb-6 leading-relaxed">
              {currentQuestion.question}
            </h3>

            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const revealed = revealedAnswers[currentQuestion.id] !== undefined;
                const isSelected = userAnswers[currentQuestion.id] === idx;
                const isCorrectOption = currentQuestion.correctAnswer === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(currentQuestion.id, idx)}
                    disabled={revealed}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group ${getOptionStyle(
                      currentQuestion.id,
                      idx,
                    )} ${revealed ? "cursor-default" : ""}`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border transition-all duration-300 ${getCircleStyle(
                          currentQuestion.id,
                          idx,
                        )}`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {option}
                    </span>

                    {revealed && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                    {revealed && isSelected && !isCorrectOption && (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    {!revealed && isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback Banner */}
            <AnimatePresence>
              {isRevealed && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      revealedAnswers[currentQuestion.id]
                        ? "bg-emerald-500/10 border-emerald-500/20"
                        : "bg-red-500/10 border-red-500/20"
                    }`}
                  >
                    <div className="mt-0.5">
                      {revealedAnswers[currentQuestion.id] ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Lightbulb className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`font-medium text-sm ${
                          revealedAnswers[currentQuestion.id] ? "text-emerald-300" : "text-red-300"
                        }`}
                      >
                        {revealedAnswers[currentQuestion.id]
                          ? "Correct!"
                          : `Incorrect — Answer: ${currentQuestion.options[currentQuestion.correctAnswer]}`}
                      </p>
                      {currentQuestion.explanation && (
                        <p className="text-xs text-slate-400 mt-1">{currentQuestion.explanation}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentQuestionIndex((curr) => Math.max(0, curr - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-3">
            {/* Check Answer button — visible when answer selected but not yet checked */}
            {hasSelected && !isRevealed && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleCheckAnswer}
                className="px-6 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 rounded-xl transition-all flex items-center gap-2 font-medium"
              >
                <CheckCircle2 className="w-4 h-4" />
                Check Answer
              </motion.button>
            )}

            {/* Next Question button — visible after answer is checked */}
            {isRevealed && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleNext}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all flex items-center gap-2 font-medium"
              >
                {currentQuestionIndex < questions.length - 1 ? "Next Question" : "View Results"}
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionPanel;
