"use client";

import { useState } from "react";

export default function Home() {
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const res = await fetch("/api/generate", { method: "POST" });
    const data = await res.json();
    setMarkdown(data.markdown);
    setLoading(false);
  };

  const download = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blog-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">🧙‍♂️ 하루 자동 블로그 생성기</h1>
      <button
        onClick={generate}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        disabled={loading}
      >
        {loading ? "생성 중..." : "블로그 글 생성하기"}
      </button>

      {markdown && (
        <>
          <pre className="bg-gray-100 p-4 whitespace-pre-wrap rounded mb-4">
            {markdown}
          </pre>
          <button
            onClick={download}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            마크다운 다운로드
          </button>
        </>
      )}
    </main>
  );
}
