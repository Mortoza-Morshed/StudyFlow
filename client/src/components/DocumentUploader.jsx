import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, Clipboard, X, Loader2, File } from "lucide-react";

function DocumentUploader({ onDocumentLoaded, isLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const validTypes = [".txt", ".pdf", ".docx"];
    const extension = "." + file.name.split(".").pop().toLowerCase();

    if (!validTypes.includes(extension)) {
      alert(`Invalid file type. Supported formats: ${validTypes.join(", ")}`);
      return;
    }

    onDocumentLoaded(file, null);
  };

  const handlePasteSubmit = () => {
    if (pasteText.trim().length === 0) {
      alert("Please enter some text.");
      return;
    }
    onDocumentLoaded(null, pasteText);
  };

  return (
    <div className="glass-panel rounded-2xl p-1 max-w-2xl mx-auto overflow-hidden">
      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-black/20 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === "upload"
              ? "bg-white/10 text-white shadow-lg border border-white/5"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          Upload File
        </button>
        <button
          onClick={() => setActiveTab("paste")}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === "paste"
              ? "bg-white/10 text-white shadow-lg border border-white/5"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Clipboard className="w-4 h-4" />
          Paste Text
        </button>
      </div>

      <div className="p-6 pt-0">
        <AnimatePresence mode="wait">
          {activeTab === "upload" ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className={`relative group border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]"
                    : "border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.docx"
                  onChange={handleFileInput}
                  hidden
                />

                <div className="flex flex-col items-center gap-4">
                  <div
                    className={`p-4 rounded-full bg-slate-800/50 text-indigo-400 mb-2 transition-transform duration-300 ${dragActive ? "scale-110 rotate-3" : "group-hover:scale-110"}`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <UploadCloud className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">
                      {dragActive ? "Drop it like it's hot!" : "Click to upload or drag & drop"}
                    </h3>
                    <p className="text-slate-400 text-sm">TXT, PDF, or DOCX up to 10MB</p>
                  </div>
                </div>

                {isLoading && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <div className="flex items-center gap-3 bg-slate-800 px-6 py-3 rounded-full border border-white/10 shadow-xl">
                      <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                      <span className="text-sm font-medium">Processing document...</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="paste"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="relative">
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste your study notes here..."
                  className="w-full h-64 bg-slate-950/50 border border-slate-700/50 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent resize-none font-mono text-sm leading-relaxed"
                  disabled={isLoading}
                />
                <div className="absolute bottom-4 right-4 text-xs text-slate-500 bg-slate-900/80 px-2 py-1 rounded-md border border-white/5">
                  {pasteText.length} characters
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handlePasteSubmit}
                  disabled={isLoading || pasteText.trim().length === 0}
                  className="glass-btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Process Text
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default DocumentUploader;
