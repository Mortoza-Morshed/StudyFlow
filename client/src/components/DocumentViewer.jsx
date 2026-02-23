import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Cpu } from "lucide-react";

function DocumentViewer({ documentText, onGenerateQuestions, isGenerating }) {
  const [selectedText, setSelectedText] = useState("");
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isSelectionActive, setIsSelectionActive] = useState(false);
  const [provider, setProvider] = useState("gemini");
  const contentRef = useRef(null);

  // Handle text selection logic
  useEffect(() => {
    const handleSelectionChange = () => {
      if (isGenerating) return;

      requestAnimationFrame(() => {
        const selection = window.getSelection();

        if (
          !selection ||
          selection.isCollapsed ||
          !contentRef.current?.contains(selection.anchorNode)
        ) {
          if (isSelectionActive) {
            setIsSelectionActive(false);
            setTimeout(() => setSelectedText(""), 200);
          }
          return;
        }

        const text = selection.toString().trim();
        if (text.length > 0) {
          try {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            setMenuPosition({
              top: rect.bottom + 10,
              left: rect.left + rect.width / 2,
            });

            setSelectedText(text);
            setIsSelectionActive(true);
          } catch (e) {
            console.error("Selection calculation error:", e);
          }
        } else {
          setIsSelectionActive(false);
        }
      });
    };

    const handleMouseUp = (e) => {
      if (e.target.closest(".selection-menu")) return;
      handleSelectionChange();
    };

    const handleKeyUp = (e) => {
      if (e.shiftKey) handleSelectionChange();
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keyup", handleKeyUp);

    const handleScroll = () => {
      if (isSelectionActive) handleSelectionChange();
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isGenerating, isSelectionActive]);

  useEffect(() => {
    if (!isGenerating && selectedText) {
      window.getSelection()?.removeAllRanges();
      setSelectedText("");
      setIsSelectionActive(false);
    }
  }, [isGenerating]);

  const handleGenerateClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (selectedText) {
      onGenerateQuestions(selectedText, 5, provider);
      setIsSelectionActive(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">Document Analysis</h2>
          <p className="text-text-muted text-xs font-mono uppercase tracking-widest">
            Select text fragments to generate quizzes
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass-panel rounded-3xl p-10 md:p-14 relative shadow-2xl overflow-hidden group">
        {/* Subtle radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-accent-primary/5 blur-[120px] pointer-events-none opacity-50 transition-opacity group-hover:opacity-100" />

        <div
          ref={contentRef}
          className="relative prose prose-invert prose-lg max-w-none text-text-primary leading-[1.8] font-light selection:bg-accent-primary/30 selection:text-white"
        >
          {documentText.split("\n").map((paragraph, index) => (
            <p
              key={index}
              className="mb-8 text-justify opacity-90 hover:opacity-100 transition-opacity"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Floating Context Menu */}
      <AnimatePresence>
        {isSelectionActive && selectedText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              transform: "translateX(-50%)",
              zIndex: 9999,
            }}
            className="selection-menu"
          >
            <div className="bg-bg-base/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl p-2 flex items-center gap-2 ring-1 ring-white/10">
              <button
                onClick={handleGenerateClick}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-accent-primary text-white pl-4 pr-5 py-2.5 rounded-xl font-bold text-sm hover:bg-accent-hover transition-all active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Sparkles className="w-4 h-4 fill-white/20" />
                )}
                <span>{isGenerating ? "Generating..." : "Generate Quiz"}</span>
              </button>

              <div className="h-6 w-px bg-white/10 mx-1" />

              {/* Provider Toggle */}
              <div className="flex items-center gap-1 bg-bg-surface/50 p-1 rounded-xl border border-white/5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setProvider("gemini");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    provider === "gemini"
                      ? "bg-white/10 text-white shadow-inner"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  <Sparkles
                    className={`w-3 h-3 ${provider === "gemini" ? "text-accent-primary" : ""}`}
                  />
                  Gemini
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setProvider("openrouter");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    provider === "openrouter"
                      ? "bg-white/10 text-white shadow-inner"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  <Cpu
                    className={`w-3 h-3 ${provider === "openrouter" ? "text-accent-primary" : ""}`}
                  />
                  Advanced
                </button>
              </div>

              <div className="px-3 border-l border-white/10 text-[10px] font-mono text-text-muted font-bold tracking-tighter uppercase tabular-nums">
                {selectedText.length} CH
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Loader2 = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2v4" />
    <path d="m16.2 7.8 2.9-2.9" />
    <path d="M18 12h4" />
    <path d="m16.2 16.2 2.9 2.9" />
    <path d="M12 18v4" />
    <path d="m4.9 19.1 2.9-2.9" />
    <path d="M2 12h4" />
    <path d="m4.9 4.9 2.9 2.9" />
  </svg>
);

export default DocumentViewer;
