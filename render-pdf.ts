// src/render-pdf.ts

// Placeholder for your real PDF rendering pipeline.
// For now, it just returns the original PDF blob unchanged.
export async function renderPdfPlaceholder(inputPdf: Blob): Promise<Blob> {
  console.log("[InclusiveCanvas] Placeholder renderer received PDF blob:", inputPdf);
  // replace this with a call to the backend
  return inputPdf;
}

import { GoogleGenerativeAI } from "@google/generative-ai";

// You will need a library to convert the resulting HTML back to PDF.
// For client-side: 'jspdf' is common. For server-side: 'puppeteer' or 'html-pdf-node'.
// This example assumes a helper function exists or you handle the HTML rendering.

const API_KEY = "AIzaSyD_PiyhAFmh52SgY6bTfqQknhVepV-k3rg"; // Securely manage this (e.g., process.env.API_KEY)

export async function renderPdf(inputPdf: Blob): Promise<TrustedHTML> {
  console.log("[InclusiveCanvas] Processing PDF for ADHD optimization...");

  try {
    // 1. Initialize Gemini Client
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Gemini 1.5 Flash is multimodal and can read PDFs directly
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 2. Convert Blob to Base64 (Required for the API)
    const base64Data = await blobToBase64(inputPdf);

    // 3. Define the ADHD-friendly System Prompt
    const prompt = `You are an expert Web Accessibility Specialist and UI Designer focusing on neurodiversity. Your task is to refactor the provided PDF content to be highly readable HTML website for users with ADHD, using "Bionic Reading" techniques and color coding.

**CRITICAL CONTENT RULES:**
1. You must NOT change, delete, or rephrase any of the original body text. The words must remain exactly as they are.
2. You are only allowed to change the HTML structure (tags) and add inline CSS styles.
3. You may generate new text ONLY for the "TL;DR" summary.

**FORMATTING INSTRUCTIONS:**
1. **TL;DR Section:** Analyze the content and generate a 2-3 sentence summary. Place this at the very top inside a \`<div>\` with a distinct background color.
2. **Bionic Reading:** Always Bold ALL \`Key Phrases and Takeaways, Important Terms, Subheadings, Actionable Data, Questions or Hooks\` using \`<strong>\` tag.
3. **Chunking:** Break any paragraph longer than 3 sentences into smaller, separate paragraphs.
4. **Lists:** If you detect a list of items in the text, convert them into \`<ul>\` or \`<ol>\` lists.
5. **Tables**: If a table does not have title, give it a small title.
6. **Math**: If a formula appears, use KaTeX blocks ($$) to state them. You can assume KaTeX model is already provided in <head>.

**VISUAL/COLOR INSTRUCTIONS (Use Inline CSS):**
*   **Background:** Use #fdfbf7 as the main container to reduce eye strain
*   **Text Color:** Use one of the \` #000000, #009E73, #332288, #882255, #117733\` as text color, and ALWAYS change the color applied between EVERY topic.
*   **Bionic Bold Color:** Make the \`<strong>\` parts use #1a202c to make them pop without being distracting.
*   **TL;DR Box:** Use a soft pastel background (e.g., \`#e6fffa\`) with a dark border.

**OUTPUT:**
Return ONLY the raw HTML code. Do not include markdown code blocks (\`\`\`html) or conversational filler.`;
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
    console.log("[InclusiveCanvas] Generated HTML content.");

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