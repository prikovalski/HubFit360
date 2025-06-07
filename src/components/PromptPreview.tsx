import React, { useEffect } from "react";

interface PromptPreviewProps {
  prompt: string;
  onClose: () => void;
}

const PromptPreview: React.FC<PromptPreviewProps> = ({ prompt, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 8000); // Fecha automaticamente após 8s
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      background: "#fff",
      border: "1px solid #019f80",
      borderRadius: 8,
      boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
      padding: 24,
      zIndex: 10000,
      maxWidth: 500
    }}>
      <strong>Prompt enviado ao GPT-4:</strong>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{prompt}</pre>
      <button onClick={onClose} style={{ marginTop: 16, color: "#019f80" }}>Fechar</button>
    </div>
  );
};

export default PromptPreview;
