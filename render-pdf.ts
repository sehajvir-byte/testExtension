// src/render-pdf.ts

// Placeholder for your real PDF rendering pipeline.
// For now, it just returns the original PDF blob unchanged.
export async function renderPdfPlaceholder(inputPdf: Blob): Promise<Blob> {
  console.log("[CanvasAccessibility] Placeholder renderer received PDF blob:", inputPdf);
  // replace this with a call to the backend
  return inputPdf;
}

import { GoogleGenerativeAI } from "@google/generative-ai";

// You will need a library to convert the resulting HTML back to PDF.
// For client-side: 'jspdf' is common. For server-side: 'puppeteer' or 'html-pdf-node'.
// This example assumes a helper function exists or you handle the HTML rendering.
var API_KEY: string = "";
chrome.storage.local.get(['googleToken'], (result) => {
   API_KEY = String(result.googleToken)
})

export async function renderPdf(inputPdf: Blob, contrast: boolean, colourBlind: boolean): Promise<TrustedHTML> {
  console.log("[CanvasAccessibility] Processing PDF for ADHD optimization...");

  try {
    // 1. Initialize Gemini Client
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Gemini 1.5 Flash is multimodal and can read PDFs directly
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 2. Convert Blob to Base64 (Required for the API)
    const base64Data = await blobToBase64(inputPdf);

    var bg_color : string = "#fdfbf7"
    var text_color : string = "#000000, #009E73, #332288, #882255, #117733"
  
    if(contrast){
      bg_color = "#121212"
      text_color = "#1A85FF, #4fffd9ff, #FEFE62, #ffcca7ff, #1AFF1A"
    }

    if(colourBlind){
      bg_color = "#f0ededff"
      text_color = "#882255, #785EF0, #FFB000 #DC267F, #FE6100"
    }

    // 3. Define the ADHD-friendly System Prompt
    const prompt = `
    You are an expert Web Accessibility Specialist and UI Designer focusing on neurodiversity. Your task is to refactor the provided PDF content into highly readable, accessibility-optimized HTML for users with ADHD using structured layout, controlled emphasis, and minimal cognitive load.

    ==============================
    CRITICAL CONTENT RULES
    ==============================

    1. You MUST NOT change, delete, summarize, paraphrase, or rewrite any original body text.
    2. You may ONLY modify HTML structure (tags) and add inline CSS styles.
    3. The ONLY new text you are allowed to generate is a 2-3 sentence "TL;DR" summary at the very top.

    ==============================
    STRUCTURE & FORMATTING RULES
    ==============================

    1. TL;DR SECTION
    - Generate a 2-3 sentence summary of the content.
    - Place it at the very top inside:
      <div style="background:#e6fffa; border:1px solid #2d3748; padding:16px; border-radius:8px; margin-bottom:24px;">
    - Add a small bold heading inside the div: TL;DR
    - Do NOT modify original content when generating summary.

    2. BIONIC READING (CONTROLLED)
    - Bold ONLY the 1-2 most essential phrases per paragraph.
    - NEVER bold full sentences.
    - NEVER exceed 15% of the total words.
    - Use:
      <strong style="color:#1a202c;">
    - Do NOT bold headings, list bullets, or entire lines.

    3. PARAGRAPH CHUNKING
    - If a paragraph exceeds 3 sentences, split it into smaller paragraphs.
    - Do NOT rewrite sentences.
    - Only insert structural breaks.

    4. LIST DETECTION
    - Convert detected item sequences into <ul> or <ol>.
    - Do NOT rewrite list text.
    - Preserve exact wording.

    5. TABLES
    - Preserve table content exactly.
    - If a table has no title, add a small heading above it:
      <h4 style="margin-bottom:8px;">Table</h4>

    6. MATH
    - Wrap formulas in KaTeX block format:
      $$ formula $$
    - Do NOT modify the formula text itself.

    ==============================
    VISUAL DESIGN RULES (INLINE CSS ONLY)
    ==============================

    1. Wrap ALL content inside a main container:

    <div style="background:${bg_color}; color:${text_color}; padding:24px; line-height:1.7; font-size:16px; max-width:900px; margin:auto;">

    2. Use consistent heading hierarchy:
    - h1 for main title
    - h2 for major sections
    - h3 for subsections

    3. Add spacing:
    - margin-bottom:16px for paragraphs
    - margin-bottom:24px for sections

    4. DO NOT randomly change text colors between topics.
      Use ONLY one of the provided colours: [${text_color}] for all body text.

    ==============================
    OUTPUT RULE
    ==============================

    Return ONLY raw HTML.
    Do NOT include markdown code blocks.
    Do NOT include explanations.
    Do NOT include conversational text.
    `;

    // 4. Call the API (Multimodal: Text + PDF)
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf",
        },
      },
    ]);

    const adhdHtml = result.response.text();
    console.log("[CanvasAccessibility] Generated HTML content.");

    // Deprecated: We no longer output pdfs
    // 5. Convert the generated HTML string back to a PDF Blob
    // Since LLMs return text, we must render it to PDF.
    // const outputPdfBlob = await convertHtmlToPdfBlob(adhdHtml);

    return adhdHtml;

  } catch (error) {
    console.error("Error generating ADHD PDF:", error);
    throw error;
  }
}

// --- Helper Functions ---

/**
 * Converts a Blob to a Base64 string (without the data URL prefix)
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove "data:application/pdf;base64," prefix
      const base64 = result.split(",")[1]; 
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * MOCK FUNCTION: Converts HTML string to PDF Blob.
 * In a real app, use 'jspdf' (client) or 'puppeteer' (server).
 */
// async function convertHtmlToPdfBlob(htmlContent: string): Promise<Blob> {
//   // Example logic using a hypothetical library:
//   // const doc = new jsPDF();
//   // doc.html(htmlContent, { callback: (doc) => doc.save() });
  
//   console.log("Converting HTML to PDF...");
  
//   // For this example, we return the input blob to satisfy the type signature,
//   // but in production, this would be the new generated PDF.
//   return new Blob([htmlContent], { type: 'application/pdf' }); 
// }