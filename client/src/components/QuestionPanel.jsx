import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Award,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

import { checkAnswers } from "../services/api";

function QuestionPanel({ questions, documentId, title, addNotification }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleNext = useCallback(async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((curr) => curr + 1);
    } else {
      setIsSaving(true);
      try {
        await checkAnswers(questions, userAnswers, documentId, title);
        addNotification(`Quiz completed: ${score}/${questions.length} correct in "${title}"`);
      } catch (err) {
        console.error("Failed to save quiz results:", err);
      } finally {
        setIsSaving(false);
        setShowResults(true);
      }

      if (percentage >= 80) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#4F46E5", "#818CF8", "#C084FC"],
        });
      }
    }
  }, [currentQuestionIndex, questions, userAnswers, documentId, title, percentage]);

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
        ? "bg-accent-primary/10 border-accent-primary text-text-primary shadow-[inset_0_0_20px_rgba(79,70,229,0.1)]"
        : "bg-bg-surface border-border-subtle text-text-muted hover:border-text-muted/50 hover:bg-bg-surface/80 group-hover:scale-[1.01]";
    }

    if (isCorrectOption) return "bg-success/5 border-success text-success font-bold";
    if (isSelected && !isCorrectOption) return "bg-danger/5 border-danger text-danger font-bold";
    return "bg-bg-base/50 border-border-subtle text-text-muted opacity-40 grayscale-[0.5]";
  };

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 px-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-1">Sync Results</h2>
            <p className="text-text-muted text-xs font-mono uppercase tracking-widest">
              Verification Session Complete
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-10 md:p-14 text-center"
        >
          <div className="inline-flex items-center justify-center p-6 rounded-full bg-accent-primary/10 mb-8 relative group">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <Award className="w-16 h-16 text-accent-primary" />
            </motion.div>
            <div className="absolute inset-0 bg-accent-primary/20 blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
            <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-accent-primary animate-pulse" />
          </div>

          <h3 className="text-4xl font-bold tracking-tight mb-3">Goal Reached!</h3>
          <p className="text-text-muted text-lg mb-8">
            Accuracy:{" "}
            <span className="text-accent-primary font-bold font-mono tracking-tighter">
              {percentage}%
            </span>
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10 max-w-sm mx-auto">
            <div className="p-4 rounded-2xl bg-bg-surface border border-border-subtle">
              <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">
                Correct
              </p>
              <p className="text-2xl font-bold text-success">{score}</p>
            </div>
            <div className="p-4 rounded-2xl bg-bg-surface border border-border-subtle">
              <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">
                Total
              </p>
              <p className="text-2xl font-bold">{questions.length}</p>
            </div>
          </div>

          <div className="space-y-4 text-left max-h-[45vh] overflow-y-auto pr-4 custom-scrollbar mb-8">
            {questions.map((q, idx) => {
              const userAnswer = userAnswers[q.id];
              const isCorrect = revealedAnswers[q.id];

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCorrect ? "bg-success/5 border-success/20" : "bg-danger/5 border-danger/20"
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="mt-1">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <XCircle className="w-5 h-5 text-danger" />
                      )}
                    </div>
                    <div>
                      <p className="text-text-primary text-sm font-bold mb-2">{q.question}</p>
                      {isCorrect ? (
                        <p className="text-xs text-success/80 font-medium">
                          <span className="font-mono uppercase tracking-widest mr-2">Matched:</span>
                          {q.options[q.correctAnswer]}
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          <p className="text-xs text-danger/80 font-medium">
                            <span className="font-mono uppercase tracking-widest mr-2">Yours:</span>
                            {q.options[userAnswer] ?? "[ Skipped ]"}
                          </p>
                          <p className="text-xs text-success/80 font-medium">
                            <span className="font-mono uppercase tracking-widest mr-2">
                              Target:
                            </span>
                            {q.options[q.correctAnswer]}
                          </p>
                        </div>
                      )}
                      {!isCorrect && q.explanation && (
                        <div className="mt-3 flex gap-2 p-3 bg-white/5 rounded-lg border border-white/5">
                          <Lightbulb className="w-3.5 h-3.5 text-accent-primary flex-shrink-0 mt-0.5" />
                          <p className="text-[11px] text-text-muted leading-relaxed italic">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleRetry}
            className="secondary-btn w-full md:w-auto inline-flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retry Quiz Session
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Quiz Progress Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">Knowledge Sync</h2>
          <p className="text-text-muted text-xs font-mono uppercase tracking-widest">
            Step {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        <div className="w-40">
          <div className="flex justify-between text-[10px] font-bold text-text-muted mb-1.5 uppercase tracking-tighter">
            <span>Progress Scan</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden border border-border-subtle p-[1px]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-accent-primary rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]"
            />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-panel rounded-3xl p-8 md:p-10 shadow-2xl relative group overflow-hidden"
          >
            {/* Decorative glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-primary/5 blur-[80px] rounded-full pointer-events-none" />

            <h3 className="text-xl font-bold text-text-primary mb-10 leading-[1.6]">
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
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group/opt ${getOptionStyle(
                      currentQuestion.id,
                      idx,
                    )} ${revealed ? "cursor-default" : "cursor-pointer active:scale-[0.98]"}`}
                  >
                    <span className="flex items-center gap-4">
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                          isSelected || (revealed && isCorrectOption)
                            ? "bg-accent-primary text-white border-accent-primary/50"
                            : "bg-bg-base/30 border-border-subtle text-text-muted group-hover/opt:border-text-muted"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm font-medium pr-4">{option}</span>
                    </span>

                    <AnimatePresence>
                      {revealed && isCorrectOption && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        </motion.div>
                      )}
                      {revealed && isSelected && !isCorrectOption && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <XCircle className="w-5 h-5 text-danger" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
            </div>

            {/* AI Explanation Banner */}
            <AnimatePresence>
              {isRevealed && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className={`p-5 rounded-2xl border flex items-start gap-4 ${
                      revealedAnswers[currentQuestion.id]
                        ? "bg-success/5 border-success/10"
                        : "bg-danger/5 border-danger/10"
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-bg-surface border border-border-subtle">
                      {revealedAnswers[currentQuestion.id] ? (
                        <Sparkles className="w-5 h-5 text-accent-primary" />
                      ) : (
                        <Lightbulb className="w-5 h-5 text-danger" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`font-bold text-sm mb-1 ${
                          revealedAnswers[currentQuestion.id] ? "text-success" : "text-danger"
                        }`}
                      >
                        {revealedAnswers[currentQuestion.id]
                          ? "Mastered!"
                          : "Clarification Required"}
                      </p>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {revealedAnswers[currentQuestion.id]
                          ? "Excellent understanding of this concept."
                          : `The correct insight was: ${currentQuestion.options[currentQuestion.correctAnswer]}.`}
                        {currentQuestion.explanation && (
                          <span className="block mt-2 pt-2 border-t border-white/5 opacity-80">
                            {currentQuestion.explanation}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Action Bar Integrated into Card */}
            <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentQuestionIndex((curr) => Math.max(0, curr - 1));
                }}
                disabled={currentQuestionIndex === 0}
                className="text-xs font-bold uppercase tracking-widest text-text-muted hover:text-text-primary disabled:opacity-20 transition-colors"
              >
                ← Back
              </button>

              <div className="flex items-center gap-3">
                {hasSelected && !isRevealed && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCheckAnswer();
                    }}
                    className="primary-btn !py-2 !px-5 text-sm"
                  >
                    Validate Sync
                  </motion.button>
                )}

                {isRevealed && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="primary-btn !py-2 !px-6 text-sm flex items-center gap-2"
                  >
                    {currentQuestionIndex < questions.length - 1 ? "Next Phase" : "Scan Results"}
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default QuestionPanel;
