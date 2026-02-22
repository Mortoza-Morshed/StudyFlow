import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, FileText, GraduationCap, Plus, Sparkles, AlertCircle, X } from "lucide-react";
import DocumentUploader from "./components/DocumentUploader";
import DocumentViewer from "./components/DocumentViewer";
import QuestionPanel from "./components/QuestionPanel";
import { uploadDocument, generateQuestions } from "./services/api";

function App() {
  const [currentView, setCurrentView] = useState("upload"); // upload, document, quiz, split
  const [documentText, setDocumentText] = useState("");
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDocumentLoaded = async (file, text) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await uploadDocument(file, text);
      setDocumentText(text || data.text); // Assuming API returns extract text
      setCurrentView("document");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuestions = async (text, count, provider) => {
    setIsLoading(true);
    setError(null);
    try {
      // Switch to split view immediately to show loading state in right panel
      setCurrentView("split");
      const data = await generateQuestions(text, count, provider);
      setQuestions(data.questions);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      // Go back to document view if failed
      if (questions.length === 0) setCurrentView("document");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewDocument = () => {
    setDocumentText("");
    setQuestions([]);
    setCurrentView("upload");
    setError(null);
  };

  const handleHomeClick = () => {
    handleNewDocument();
  };

  return (
    <div className="min-h-screen text-slate-200 font-body selection:bg-indigo-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 -z-10" />

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={handleHomeClick}>
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 group-hover:from-white group-hover:to-white transition-all">
                StudyFlow
              </span>
            </div>

            {currentView !== "upload" && (
              <nav className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView("document")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentView === "document"
                      ? "bg-white/10 text-white shadow-lg backdrop-blur-md border border-white/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Document
                  </span>
                </button>

                {(questions.length > 0 || currentView === "split") && (
                  <button
                    onClick={() => setCurrentView("split")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentView === "split"
                        ? "bg-white/10 text-white shadow-lg backdrop-blur-md border border-white/10"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Quiz
                      {questions.length > 0 && (
                        <span className="bg-indigo-500/20 text-indigo-300 px-1.5 rounded-full text-xs">
                          {questions.length}
                        </span>
                      )}
                    </span>
                  </button>
                )}

                <div className="h-6 w-px bg-white/10 mx-2" />

                <button
                  onClick={handleNewDocument}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New
                </button>
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-200"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p>{error}</p>
              <button onClick={() => setError(null)} className="ml-auto hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 relative flex flex-col">
          <AnimatePresence mode="wait">
            {currentView === "upload" ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto w-full my-auto"
              >
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center p-3 mb-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl">
                    <Sparkles className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400 mb-4">
                    Welcome to StudyFlow
                  </h2>
                  <p className="text-lg text-slate-400 leading-relaxed max-w-lg mx-auto">
                    Transform your study materials into interactive quizzes instantly. Just upload
                    your notes and let AI do the magic.
                  </p>
                </div>

                <DocumentUploader onDocumentLoaded={handleDocumentLoaded} isLoading={isLoading} />
              </motion.div>
            ) : (
              /* Workspace View: Stable DocumentViewer + Conditional Quiz Panel */
              <motion.div
                key="workspace"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[calc(100vh-8rem)] flex gap-8 overflow-hidden"
              >
                {/* Left Panel: Document (Always present in Workspace) */}
                <div
                  className={`transition-all duration-500 ease-in-out h-full overflow-hidden flex flex-col ${
                    currentView === "split" ? "w-1/2" : "w-full"
                  }`}
                >
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <DocumentViewer
                      documentText={documentText}
                      onGenerateQuestions={handleGenerateQuestions}
                      isGenerating={isLoading}
                    />
                  </div>
                </div>

                {/* Right Panel: Quiz Center */}
                <AnimatePresence>
                  {currentView === "split" && (
                    <motion.div
                      initial={{ x: 50, opacity: 0, width: 0 }}
                      animate={{ x: 0, opacity: 1, width: "50%" }}
                      exit={{ x: 50, opacity: 0, width: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="h-full overflow-hidden flex flex-col"
                    >
                      <div className="flex-1 overflow-y-auto custom-scrollbar pl-2">
                        {isLoading ? (
                          <div className="h-full flex flex-col items-center justify-center space-y-4 p-8 glass-panel rounded-2xl">
                            <div className="relative">
                              <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                              </div>
                            </div>
                            <h3 className="text-xl font-medium text-white">Analyzing Content...</h3>
                            <p className="text-slate-400 text-center max-w-xs">
                              Our AI is reading your text and crafting challenging questions to test
                              your knowledge.
                            </p>
                          </div>
                        ) : questions.length > 0 ? (
                          <QuestionPanel questions={questions} />
                        ) : (
                          <div className="h-full flex items-center justify-center text-slate-500 glass-panel rounded-2xl text-center p-8">
                            <p>Highlight text in the document and click "Generate Quiz" to start</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;
