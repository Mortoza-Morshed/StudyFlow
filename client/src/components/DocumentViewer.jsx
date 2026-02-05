import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MousePointerClick } from "lucide-react";

function DocumentViewer({ documentText, onGenerateQuestions, isGenerating }) {
  const [selectedText, setSelectedText] = useState("");
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isSelectionActive, setIsSelectionActive] = useState(false);
  const contentRef = useRef(null);

  // Handle text selection logic
  useEffect(() => {
    const handleSelectionChange = () => {
      // Small timeout to allow the browser to complete the selection update
      requestAnimationFrame(() => {
        const selection = window.getSelection();

        // Ensure we have a valid selection inside our content
        if (
          !selection ||
          selection.isCollapsed ||
          !contentRef.current?.contains(selection.anchorNode)
        ) {
          if (!isGenerating && isSelectionActive) {
            setIsSelectionActive(false);
            setTimeout(() => setSelectedText(""), 200); // Animation delay
          }
          return;
        }

        const text = selection.toString().trim();
        if (text.length > 0) {
          try {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Calculate absolute position (centered below selection)
            setMenuPosition({
              top: rect.bottom + 10, // 10px below the text
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
      // Prevent clearing if clicking the menu itself
      if (e.target.closest(".selection-menu")) return;
      handleSelectionChange();
    };

    // Also listen for keyup (shift+arrow selection)
    const handleKeyUp = (e) => {
      if (e.shiftKey) handleSelectionChange();
    };

    // Global listener to capture selection anywhere in document but filtered logic above handles the 'where'
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keyup", handleKeyUp);

    // Handle scrolling to update position if needed, or close menu
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

  const handleGenerateClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (selectedText) {
      onGenerateQuestions(selectedText, 5);
      // Clear selection after generation starts
      window.getSelection().removeAllRanges();
      setSelectedText("");
      setIsSelectionActive(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto relative px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Document Content</h2>
          <p className="text-slate-400">Highlight any text to generate a quiz</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass-panel rounded-2xl p-8 md:p-12 min-h-[60vh] relative shadow-2xl border-white/5">
        <div
          ref={contentRef}
          className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed font-light font-body selection:bg-indigo-500/30 selection:text-indigo-200"
        >
          {documentText.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-6 text-justify">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Floating Context Menu - "Hovering" effect */}
      <AnimatePresence>
        {isSelectionActive && selectedText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              transform: "translateX(-50%)", // Center horizontally using transform
              zIndex: 9999,
            }}
            className="selection-menu pointer-events-auto"
          >
            <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full p-1.5 flex items-center gap-2 ring-1 ring-white/20">
              <button
                onClick={handleGenerateClick}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-5 py-2.5 rounded-full font-medium text-sm hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-105 transition-all active:scale-95 whitespace-nowrap"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-white/20" />
                    <span>Generate Quiz</span>
                  </>
                )}
              </button>

              <div className="px-3 border-l border-white/10 text-xs text-slate-400 font-medium whitespace-nowrap tabular-nums">
                {selectedText.length} chars
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State Hint */}
      {!isSelectionActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 2 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-slate-500 text-sm flex items-center justify-center gap-2 bg-slate-900/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm pointer-events-none"
        >
          <MousePointerClick className="w-4 h-4" />
          <span>Highlight text to see magic actions</span>
        </motion.div>
      )}
    </div>
  );
}

export default DocumentViewer;
