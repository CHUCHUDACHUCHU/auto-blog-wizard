import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST() {
  const today = new Date().toISOString().split("T")[0];

  // Step 1: 텍스트 콘텐츠 GPT로 생성
  const basePrompt = `
오늘 날짜: ${today}

아래 형식에 맞춰 오늘의 블로그 글을 작성해줘 (단, 이미지 없이 텍스트만!):

[오늘의 운세]
- 직장운, 금전운, 연애운을 간단히 설명해줘

[오늘의 명언]
- 짧고 임팩트 있는 명언 한 개와 출처

[오늘의 뉴스 요약]
- 오늘 한국 사회에서 주요한 뉴스를 간단히 요약해줘 (1~2개)
`;

  const chatRes = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: basePrompt }],
    temperature: 0.8,
  });

  const content = chatRes.choices[0].message.content ?? "";

  // Step 2: 이미지 프롬프트 지정
  const imagePrompts = {
    운세: "A modern illustration symbolizing fortune and luck with stars and zodiac signs",
    명언: "Inspirational background with sunrise and quote space, minimalist style",
    뉴스: "Flat-style illustration showing Korean news theme like headlines or breaking news",
  };

  // Step 3: 이미지 생성
  const imageUrls: Record<string, string> = {};

  for (const key in imagePrompts) {
    const imgRes = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompts[key],
      n: 1,
      size: "1024x1024",
    });
    imageUrls[key] = imgRes.data[0].url ?? "";
  }

  // Step 4: 이미지 URL 삽입
  const markdownWithImages = `
![운세 이미지](${imageUrls.운세})

### [오늘의 운세]
${extractSection(content, "운세")}

![명언 이미지](${imageUrls.명언})

### [오늘의 명언]
${extractSection(content, "명언")}

![뉴스 이미지](${imageUrls.뉴스})

### [오늘의 뉴스 요약]
${extractSection(content, "뉴스")}
  `;

  return NextResponse.json({ markdown: markdownWithImages });
}

// ✅ 섹션 추출 함수 개선: "-" 없어도 잘 동작하게
function extractSection(text: string, type: "운세" | "명언" | "뉴스"): string {
  const sectionTitles = {
    운세: "오늘의 운세",
    명언: "오늘의 명언",
    뉴스: "오늘의 뉴스 요약",
  };

  const title = sectionTitles[type];
  const regex = new RegExp(
    `\\[${title}\\]\\s*\\n([\\s\\S]*?)(?=\\n\\[|$)`,
    "m"
  );
  const match = text.match(regex);
  return match ? match[1].trim() : "(내용 없음)";
}
