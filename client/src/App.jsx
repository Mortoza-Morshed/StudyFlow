import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Plus,
  Sparkles,
  AlertCircle,
  X,
  LayoutDashboard,
  Library,
  BarChart3,
  Settings,
  Bell,
  Search,
  User,
  ChevronRight,
  Clock,
  ExternalLink,
  Sun,
  Moon,
} from "lucide-react";
import DocumentUploader from "./components/DocumentUploader";
import DocumentViewer from "./components/DocumentViewer";
import QuestionPanel from "./components/QuestionPanel";
import {
  uploadDocument,
  generateQuestions,
  getDocuments,
  getQuizzes,
  getStats,
} from "./services/api";

function App() {
  const [currentView, setCurrentView] = useState("dashboard"); // dashboard, document, split
  const [activeTab, setActiveTab] = useState("dashboard");
  const [documentText, setDocumentText] = useState("");
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentDocumentId, setCurrentDocumentId] = useState(null);
  const [currentDocumentTitle, setCurrentDocumentTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Welcome to StudyFlow! Try uploading a PDF.", time: "Just now", read: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  // Initial Data Load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Theme effect
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Real Data State
  const [documentHistory, setDocumentHistory] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    avgAccuracy: "0%",
    studyTime: "0h",
    docsSynced: 0,
  });

  const addNotification = (text) => {
    setNotifications((prev) =>
      [{ id: Date.now(), text, time: "Just now", read: false }, ...prev].slice(0, 10),
    ); // Keep last 10
  };

  const fetchDashboardData = async () => {
    try {
      const [docsData, quizzesData, statsData] = await Promise.all([
        getDocuments(),
        getQuizzes(),
        getStats(),
      ]);
      setDocumentHistory(docsData.documents || []);
      setQuizHistory(quizzesData.quizzes || []);
      setStats(statsData.stats || stats);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  };

  const handleDocumentLoaded = async (file, text) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await uploadDocument(file, text);
      setDocumentText(text || data.text);
      setCurrentDocumentId(data.id);
      setCurrentDocumentTitle(data.title);
      setCurrentView("document");
      addNotification(`Successfully synced "${data.title}"`);
      // Refresh list in background
      fetchDashboardData();
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
      setCurrentView("split");
      const data = await generateQuestions(text, count, provider);
      setQuestions(data.questions);
      // Stats will update after quiz is checked in QuestionPanel (or next fetch)
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      if (questions.length === 0) setCurrentView("document");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewDocument = () => {
    setDocumentText("");
    setQuestions([]);
    setCurrentView("dashboard");
    setActiveTab("dashboard");
    setError(null);
    fetchDashboardData();
  };

  const handleHomeClick = handleNewDocument;

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === "dashboard") {
      setCurrentView("dashboard");
      fetchDashboardData();
    }
    setShowNotifications(false);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "quizzes", label: "My Quizzes", icon: GraduationCap },
    { id: "library", label: "Library", icon: Library },
    { id: "stats", label: "Statistics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const filteredDocuments = documentHistory.filter(
    (doc) =>
      (doc.title && doc.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.filename && doc.filename.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const exportQuizData = () => {
    const dataStr = JSON.stringify(quizHistory, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "studyflow-results.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    addNotification("Exported quiz results successfully.");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex">
      {/* Sidebar - Fixed Left */}
      <aside className="w-[260px] bg-bg-surface border-r border-border-subtle flex flex-col fixed inset-y-0 z-50">
        <div className="p-6">
          <div
            className="flex items-center gap-3 cursor-pointer group mb-10"
            onClick={handleHomeClick}
          >
            <div className="p-2 bg-accent-primary rounded-xl shadow-lg shadow-accent-primary/20 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">StudyFlow</span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-accent-primary text-white shadow-lg shadow-accent-primary/20"
                    : "text-text-muted hover:bg-white/5 hover:text-text-primary"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6" />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-20 border-b border-border-subtle bg-bg-base/80 backdrop-blur-xl sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your library..."
              className="w-full bg-bg-surface border border-border-subtle rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-accent-primary transition-colors"
            />
          </div>

          <div className="flex items-center gap-6">
            {/* Professional Theme Toggle */}
            <div
              className={`relative flex items-center h-9 w-16 p-1 rounded-full cursor-pointer transition-colors duration-300 ${
                theme === "light" ? "bg-accent-primary/20" : "bg-white/5"
              }`}
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <motion.div
                className="absolute w-7 h-7 bg-accent-primary rounded-full shadow-lg flex items-center justify-center"
                animate={{
                  x: theme === "light" ? 28 : 0,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {theme === "light" ? (
                  <Sun className="w-4 h-4 text-white" />
                ) : (
                  <Moon className="w-4 h-4 text-white" />
                )}
              </motion.div>
              <div className="flex justify-between w-full px-1.5 opacity-30 pointer-events-none">
                <Moon className="w-3.5 h-3.5 text-text-primary" />
                <Sun className="w-3.5 h-3.5 text-text-primary" />
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  const newState = !showNotifications;
                  setShowNotifications(newState);
                  if (newState) {
                    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                  }
                }}
                className={`p-2 transition-colors relative rounded-full ${showNotifications ? "bg-accent-primary/10 text-accent-primary" : "text-text-muted hover:text-text-primary"}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-primary rounded-full border-2 border-bg-base" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-80 glass-panel rounded-2xl shadow-2xl border border-border-subtle overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-border-subtle bg-bg-surface/50 backdrop-blur-md flex items-center justify-between">
                      <h4 className="font-bold text-sm">Notifications</h4>
                      <span className="text-[10px] font-mono font-bold text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded uppercase">
                        {unreadCount} Unread
                      </span>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="p-4 border-b border-border-subtle/50 hover:bg-white/5 transition-colors cursor-pointer group"
                          >
                            <p className="text-xs text-text-primary mb-1 leading-relaxed">
                              {notif.text}
                            </p>
                            <span className="text-[10px] text-text-muted font-mono">
                              {notif.time}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-text-muted text-xs font-medium">
                          No recent notifications
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-px bg-border-subtle" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none mb-1">Alex Rivier</p>
                <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 bg-accent-primary/10 text-accent-primary rounded border border-accent-primary/20">
                  Premium Member
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary to-violet-600 flex items-center justify-center p-0.5">
                <div className="w-full h-full rounded-full bg-bg-base flex items-center justify-center border border-white/10 uppercase font-black text-xs">
                  AR
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="p-8 max-w-[1400px] w-full mx-auto flex-1 flex flex-col transition-all duration-300">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-8 p-4 rounded-xl bg-danger/5 border border-danger/20 flex items-center gap-3 text-danger"
              >
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-bold">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto hover:scale-110 transition-transform"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && currentView === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                <div>
                  <h1 className="text-4xl font-black tracking-tight mb-2">Workspace</h1>
                  <p className="text-text-muted text-sm font-medium">
                    Sync your knowledge and generate deep insights.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-8">
                    <DocumentUploader
                      onDocumentLoaded={handleDocumentLoaded}
                      isLoading={isLoading}
                    />
                  </div>

                  <div className="lg:col-span-4 space-y-8">
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text-muted">
                          History
                        </h3>
                        <button
                          onClick={() => setActiveTab("library")}
                          className="text-[10px] font-bold text-accent-primary hover:underline flex items-center gap-1"
                        >
                          See All <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {filteredDocuments.slice(0, 3).map((doc, i) => (
                          <div
                            key={doc._id || i}
                            className="p-4 rounded-2xl bg-bg-surface border border-border-subtle group hover:border-accent-primary/50 transition-all cursor-pointer"
                            onClick={() => {
                              setDocumentText(doc.text);
                              setCurrentDocumentId(doc._id);
                              setCurrentDocumentTitle(doc.title);
                              setCurrentView("document");
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`p-3 rounded-xl ${doc.source === "pasted" ? "text-blue-400 bg-blue-400/10" : "text-emerald-400 bg-emerald-400/10"}`}
                              >
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate text-text-primary">
                                  {doc.title}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-tighter">
                                    {new Date(doc.createdAt).toLocaleDateString()}
                                  </span>
                                  <span className="text-[10px] font-mono font-bold text-accent-primary uppercase">
                                    ready
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        ))}

                        {filteredDocuments.length === 0 && (
                          <div className="p-8 text-center border border-dashed border-border-subtle rounded-2xl opacity-50">
                            <p className="text-xs font-bold text-text-muted">
                              {searchQuery ? "No matching history" : "No recent activity"}
                            </p>
                          </div>
                        )}

                        <button
                          onClick={() => setCurrentView("dashboard")}
                          className="w-full mt-4 p-5 rounded-2xl border border-dashed border-border-subtle flex items-center justify-center gap-3 text-text-muted hover:text-text-primary hover:border-accent-primary/40 hover:bg-accent-primary/5 transition-all group"
                        >
                          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                          <span className="text-xs font-black uppercase tracking-widest">
                            New Sync Session
                          </span>
                        </button>
                      </div>
                    </section>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "quizzes" && (
              <motion.div
                key="quizzes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-end justify-between">
                  <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">My Quizzes</h1>
                    <p className="text-text-muted text-sm">Your generated knowledge checkpoints.</p>
                  </div>
                  <button className="secondary-btn flex items-center gap-2 text-xs">
                    <Clock className="w-3.5 h-3.5" /> Latest First
                  </button>
                </div>

                {quizHistory.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizHistory.map((quiz) => (
                      <div
                        key={quiz._id}
                        className="glass-panel p-6 rounded-3xl group hover:border-accent-primary/30 transition-all"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-accent-primary/10 rounded-2xl">
                            <GraduationCap className="w-6 h-6 text-accent-primary" />
                          </div>
                          <span className="px-2 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-mono text-text-muted uppercase">
                            {quiz.total} Questions
                          </span>
                        </div>
                        <h4 className="text-lg font-bold mb-2 group-hover:text-accent-primary transition-colors">
                          {quiz.title}
                        </h4>
                        <p className="text-xs text-text-muted mb-6">
                          Completed on {new Date(quiz.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                          <span className="text-[10px] font-black uppercase text-accent-primary tracking-widest">
                            Score: {quiz.percentage}%
                          </span>
                          <button className="text-xs font-bold text-accent-primary flex items-center gap-1 hover:gap-2 transition-all">
                            Review Results <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center glass-panel rounded-3xl border-dashed">
                    <p className="text-text-muted font-bold">No quizzes generated yet</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "library" && (
              <motion.div key="library" className="space-y-8">
                <h1 className="text-4xl font-black tracking-tight mb-2">Document Library</h1>
                {filteredDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredDocuments.map((doc) => (
                      <div
                        key={doc._id}
                        className="glass-panel p-6 rounded-3xl group hover:border-accent-primary/30 transition-all cursor-pointer"
                        onClick={() => {
                          setDocumentText(doc.text);
                          setCurrentDocumentId(doc._id);
                          setCurrentDocumentTitle(doc.title);
                          setActiveTab("dashboard");
                          setCurrentView("document");
                        }}
                      >
                        <div className="p-3 bg-accent-primary/5 w-fit rounded-xl mb-6">
                          <FileText className="w-6 h-6 text-accent-primary" />
                        </div>
                        <h4 className="font-bold truncate mb-1">{doc.title}</h4>
                        <p className="text-[10px] text-text-muted uppercase font-mono mb-6">
                          {doc.filename || "Pasted Content"}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <span className="text-[9px] font-bold text-text-muted">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] font-black uppercase text-accent-primary group-hover:underline transition-all">
                            Open Doc
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center glass-panel rounded-3xl border-dashed">
                    <Library className="w-16 h-16 text-text-muted mb-6 opacity-20" />
                    <h2 className="text-2xl font-black mb-2">
                      {searchQuery ? "No Matches" : "Empty Library"}
                    </h2>
                    <p className="text-text-muted max-w-sm mb-8 text-center text-sm">
                      {searchQuery
                        ? `Could not find any documents matching "${searchQuery}"`
                        : "Upload your first paper to the dashboard to start building your library."}
                    </p>
                    {!searchQuery && (
                      <button onClick={() => setActiveTab("dashboard")} className="primary-btn">
                        Go to Workspace
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div key="settings" className="space-y-8 max-w-2xl">
                <div>
                  <h1 className="text-4xl font-black tracking-tight mb-2">Settings</h1>
                  <p className="text-text-muted text-sm font-medium">
                    Manage your workspace and data.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="glass-panel rounded-3xl p-8 border border-border-subtle">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-accent-primary" /> Appearance
                    </h3>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div>
                        <p className="text-sm font-bold">Theme Mode</p>
                        <p className="text-[10px] text-text-muted">
                          Toggle between Neural Dark and Light theme
                        </p>
                      </div>
                      <button
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                        className="px-4 py-2 bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-[10px] font-black uppercase rounded-lg hover:bg-accent-primary/20 transition-all"
                      >
                        {theme === "light" ? "Clean Light" : "Neural Dark"}
                      </button>
                    </div>
                  </div>

                  <div className="glass-panel rounded-3xl p-8 border border-border-subtle">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                      <ExternalLink className="w-5 h-5 text-accent-primary" /> Data & Privacy
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div>
                          <p className="text-sm font-bold">Export Activity</p>
                          <p className="text-[10px] text-text-muted">
                            Download your quiz history and performance data
                          </p>
                        </div>
                        <button
                          onClick={exportQuizData}
                          className="px-4 py-2 bg-accent-primary text-white text-[10px] font-black uppercase rounded-lg hover:shadow-lg hover:shadow-accent-primary/20 transition-all"
                        >
                          Export as JSON
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "stats" && (
              <motion.div key="stats" className="space-y-8">
                <h1 className="text-4xl font-black tracking-tight mb-2">Performance</h1>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: "Quizzes Taken", val: stats.totalQuizzes, icon: GraduationCap },
                    { label: "Avg Accuracy", val: stats.avgAccuracy, icon: BarChart3 },
                    { label: "Docs Synced", val: stats.docsSynced, icon: FileText },
                    { label: "Study Time", val: stats.studyTime, icon: Clock },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="p-6 rounded-3xl bg-bg-surface border border-border-subtle"
                    >
                      <div className="p-2 bg-accent-primary/10 w-fit rounded-xl mb-4 text-accent-primary">
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-black">{stat.val}</p>
                    </div>
                  ))}
                </div>
                <div className="h-64 glass-panel rounded-3xl flex items-center justify-center text-text-muted text-xs font-mono uppercase tracking-[0.3em] border-dashed">
                  Activity Matrix Visualization Coming Soon
                </div>
              </motion.div>
            )}

            {(currentView === "document" || currentView === "split") &&
              activeTab === "dashboard" && (
                <motion.div
                  key="workspace"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex gap-8 overflow-hidden"
                >
                  <div
                    className={`transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) h-full overflow-hidden flex flex-col ${
                      currentView === "split" ? "w-1/2" : "w-full"
                    }`}
                  >
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                      <DocumentViewer
                        documentText={documentText}
                        onGenerateQuestions={handleGenerateQuestions}
                        isGenerating={isLoading}
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {currentView === "split" && (
                      <motion.div
                        initial={{ x: 100, opacity: 0, width: 0 }}
                        animate={{ x: 0, opacity: 1, width: "50%" }}
                        exit={{ x: 100, opacity: 0, width: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        className="h-full overflow-hidden flex flex-col"
                      >
                        <div className="flex-1 overflow-y-auto custom-scrollbar pl-2">
                          {isLoading ? (
                            <>
                              <div className="flex items-center justify-between mb-8 px-2">
                                <div>
                                  <h2 className="text-2xl font-bold tracking-tight mb-1">
                                    Knowledge Sync
                                  </h2>
                                  <p className="text-text-muted text-xs font-mono uppercase tracking-widest">
                                    Neural Mapping in Progress
                                  </p>
                                </div>
                              </div>
                              <div className="h-fit flex flex-col items-center justify-center space-y-6 glass-panel rounded-[2rem] p-12 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-accent-primary/10 overflow-hidden">
                                  <motion.div
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    className="w-1/2 h-full bg-accent-primary shadow-[0_0_15px_#4f46e5]"
                                  />
                                </div>
                                <div className="relative">
                                  <div className="w-20 h-20 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin" />
                                  <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-accent-primary animate-pulse" />
                                </div>
                                <div className="text-center">
                                  <h3 className="text-2xl font-black mb-2">Syncing Knowledge...</h3>
                                  <p className="text-text-muted max-w-xs text-sm font-medium leading-relaxed">
                                    Our neural engine is mapping your document to extract key
                                    concepts and challenges.
                                  </p>
                                </div>
                              </div>
                            </>
                          ) : questions.length > 0 ? (
                            <QuestionPanel
                              questions={questions}
                              documentId={currentDocumentId}
                              title={currentDocumentTitle}
                              addNotification={addNotification}
                            />
                          ) : (
                            <>
                              <div className="flex items-center justify-between mb-8 px-2">
                                <div>
                                  <h2 className="text-2xl font-bold tracking-tight mb-1">
                                    Knowledge Sync
                                  </h2>
                                  <p className="text-text-muted text-xs font-mono uppercase tracking-widest">
                                    Standby for active sync
                                  </p>
                                </div>
                              </div>
                              <div className="h-fit flex flex-col items-center justify-center text-text-muted glass-panel rounded-[2rem] text-center p-12">
                                <div className="p-4 bg-white/5 rounded-full mb-6">
                                  <Sparkles className="w-8 h-8 opacity-20" />
                                </div>
                                <p className="text-sm font-bold max-w-xs">
                                  Select a passage in the document and choose a sync model to begin.
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
