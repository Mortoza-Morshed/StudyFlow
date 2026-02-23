import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, Clipboard, Loader2, Info, Plus, Sparkles } from "lucide-react";

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

  const tabs = [
    { id: "upload", label: "Upload File", icon: UploadCloud },
    { id: "paste", label: "Paste Text", icon: Clipboard },
  ];

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-border-subtle relative px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 py-4 px-4 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? "text-accent-primary"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className="tab-indicator" initial={false} />
            )}
          </button>
        ))}
      </div>

      <div className="p-8">
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
                className={`relative group border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                  dragActive
                    ? "border-accent-primary bg-accent-primary/5 scale-[1.01]"
                    : "border-border-subtle hover:border-accent-primary/50 hover:bg-bg-surface"
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

                <div className="flex flex-col items-center gap-6">
                  <motion.div
                    animate={dragActive ? { scale: 1.1, rotate: 5 } : {}}
                    whileHover={{ scale: 1.1 }}
                    className="p-5 rounded-2xl bg-bg-surface text-accent-primary border border-border-subtle shadow-inner"
                  >
                    {isLoading ? (
                      <Loader2 className="w-10 h-10 animate-spin" />
                    ) : (
                      <UploadCloud className="w-10 h-10" />
                    )}
                  </motion.div>

                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      {dragActive ? "Drop documents here" : "Click to select or drag & drop"}
                    </h3>
                    <p className="text-text-muted text-sm mb-6">
                      PDF, DOCX, or TXT (Max size 10MB)
                    </p>

                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                      {["PDF", "DOCX", "TXT"].map((type) => (
                        <span
                          key={type}
                          className="px-3 py-1 rounded bg-bg-surface border border-border-subtle text-[10px] font-mono font-bold tracking-widest text-text-muted"
                        >
                          {type}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="primary-btn inline-flex items-center gap-2 group/btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
                      <span>Browse Files</span>
                    </button>
                  </div>
                </div>

                {isLoading && (
                  <div className="absolute inset-0 bg-bg-base/80 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <Loader2 className="w-12 h-12 text-accent-primary animate-spin" />
                        <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-accent-primary animate-pulse" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-lg">Scanning Document</p>
                        <p className="text-xs text-text-muted">Extracting text using NLP...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-accent-primary/5 border border-accent-primary/10">
                <Info className="w-5 h-5 text-accent-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-text-muted leading-relaxed">
                  Your files are processed securely. AI analysis usually takes 5-10 seconds
                  depending on the document length.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="paste"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="relative group">
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Insert your study notes, lecture transcript, or textbook excerpt here..."
                  className="w-full h-72 bg-bg-surface border border-border-subtle rounded-2xl p-6 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-primary transition-all font-mono text-sm leading-relaxed resize-none group-hover:bg-bg-surface/50"
                  disabled={isLoading}
                />
                <div className="absolute bottom-4 right-4 text-[10px] font-mono text-text-muted bg-bg-base/80 px-2 py-1 rounded border border-border-subtle backdrop-blur-sm">
                  {pasteText.length} characters
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handlePasteSubmit}
                  disabled={isLoading || pasteText.trim().length === 0}
                  className="primary-btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Generate from Text
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
