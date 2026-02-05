import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Award, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";

function QuestionPanel({ questions, onCheckAnswers, isChecking }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleOptionSelect = (questionId, optionIndex) => {
    if (submitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    const result = await onCheckAnswers(userAnswers);
    if (result) {
      setSubmitted(true);
      setScore(result.percentage);
      if (result.score >= 80) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#6366f1", "#8b5cf6", "#ec4899"],
        });
      }
    }
  };

  const handleRetry = () => {
    setUserAnswers({});
    setSubmitted(false);
    setScore(0);
    setCurrentQuestionIndex(0);
  };

  const allAnswered = questions.every((q) => userAnswers[q.id] !== undefined);
  const progress = (Object.keys(userAnswers).length / questions.length) * 100;

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

        {/* Progress Bar */}
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

      {submitted ? (
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
          <p className="text-slate-400 mb-8">
            You scored <span className="text-indigo-400 font-bold text-xl">{score}%</span>
          </p>

          <div className="space-y-4 text-left max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {questions.map((q, idx) => {
              const userAnswer = userAnswers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border ${isCorrect ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"}`}
                >
                  <div className="flex gap-3">
                    <div className="mt-1">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-slate-200 font-medium mb-1">
                        {idx + 1}. {q.question}
                      </p>
                      <p className="text-sm text-slate-400">
                        {isCorrect
                          ? `Correct: ${q.options[q.correctAnswer]}`
                          : `Correct answer: ${q.options[q.correctAnswer]}`}
                      </p>
                      {!isCorrect && (
                        <p className="text-xs text-slate-500 mt-2 italic">Why: {q.explanation}</p>
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
      ) : (
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
                {questions[currentQuestionIndex].question}
              </h3>

              <div className="space-y-3">
                {questions[currentQuestionIndex].options.map((option, idx) => {
                  const isSelected = userAnswers[questions[currentQuestionIndex].id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(questions[currentQuestionIndex].id, idx)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group ${
                        isSelected
                          ? "bg-indigo-500/20 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10"
                          : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border ${
                            isSelected
                              ? "bg-indigo-500 border-indigo-500 text-white"
                              : "border-slate-600 text-slate-500"
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        {option}
                      </span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setCurrentQuestionIndex((curr) => Math.max(0, curr - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            >
              Previous
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || isChecking}
                className="glass-btn px-8 py-3 flex items-center gap-2"
              >
                {isChecking ? "Checking..." : "Submit Quiz"}
                {!isChecking && <Award className="w-4 h-4" />}
              </button>
            ) : (
              <button
                onClick={() =>
                  setCurrentQuestionIndex((curr) => Math.min(questions.length - 1, curr + 1))
                }
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionPanel;
