import React, { useState } from "react";

type FigmaPreviewProps = {
  url: string;
  title?: string;
};

export const FigmaPreview: React.FC<FigmaPreviewProps> = ({
  url,
  title = "Figma Preview",
}) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="w-full aspect-[16/9] relative bg-gray-100 rounded border overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      <iframe
        title={title}
        className="w-full h-full absolute inset-0 rounded"
        src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(
          url
        )}`}
        onLoad={() => setLoading(false)}
        allowFullScreen
        style={{ border: "none" }}
      />
    </div>
  );
};
