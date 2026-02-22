// ===============================
//  FETCH CANVAS SYLLABUS (existing)
// ===============================
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "FETCH_CANVAS_DATA") {
    (async () => {
      try {
        const { courseId, token } = request.payload;
        console.log("[Canvas Accessify] Fetching Canvas data for course:", courseId);

        const url = `https://uofa.instructure.com/api/v1/courses/${courseId}/syllabus`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          console.error("[Canvas Accessify] Canvas API Error:", response.status);
          const errorText = await response.text();
          console.error("[Canvas Accessify] Canvas error text:", errorText.substring(0, 100));
          sendResponse({ success: false, error: `Canvas error: ${response.status}` });
          return;
        }

        const data = await response.json();
        sendResponse({
          success: true,
          data: data.public_syllabus_body || data.body
        });
      } catch (err) {
        sendResponse({ success: false, error: (err as Error).message });
      }
    })();

    return true; // keep channel open
  }
});

// ===============================
//  IMPORT PLACEHOLDER RENDERER
// ===============================
import { renderPdf } from "../render-pdf";

// ===============================
//  PDF PIPELINE
// ===============================

// Convert Canvas preview link → direct download link
function toDownloadUrl(url: string): string {
  if (url.includes("/download")) return url;
  const base = url.split("?")[0];
  return `${base}/download?download_frd=1`;
}

// Download the PDF as a Blob
async function fetchPdfBlob(downloadUrl: string): Promise<Blob> {
  console.log("[Canvas Accessify] Fetching PDF:", downloadUrl);

  const res = await fetch(downloadUrl, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`Failed to download PDF: HTTP ${res.status}`);
  }

  return await res.blob();
}

// Main processing pipeline
export async function processSelectedFile(
  file: { name: string; url: string },
  mode: { adhd: boolean, dyslexia: boolean, colorBlind: boolean, highContrast: boolean } 
) {
  try {
    console.log("[Canvas Accessify] Starting pipeline for:", file);

    const downloadUrl = toDownloadUrl(file.url);
    console.log("[Canvas Accessify] Converted to download URL:", downloadUrl);

    const originalPdf = await fetchPdfBlob(downloadUrl);
    console.log("[Canvas Accessify] Original PDF blob:", originalPdf);

    const htmlString = await renderPdf(originalPdf, mode.highContrast);
    console.log("[Canvas Accessify] Rendered PDF blob:", htmlString);

    // 1. Store HTML to chrome.storage.local
    chrome.storage.local.set(
      { tempHtmlData: htmlString, dyslexic: mode.dyslexia },
      () => {
        // 2. Build viewer URL
        const viewerUrl =
          chrome.runtime.getURL("viewer.html") +
          `?mode=${encodeURIComponent(mode.highContrast)}`;

        // 3. Open viewer + notify popup
        chrome.tabs.create({ url: viewerUrl }, () => {
          chrome.runtime.sendMessage({ type: "PDF_LOADED" });
        });
      }
    );
  } catch (err) {
    console.error("[Canvas Accessify] Pipeline error:", err);
  }
}

// ===============================
//  STORAGE LISTENER (popup → background)
// ===============================
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;

  if (changes.selectedLink) {
    const file = changes.selectedLink.newValue as { name: string; url: string };
    const mode = changes.selectedLink.newValue as { adhd: boolean, dyslexia: boolean, colorBlind: boolean, highContrast: boolean};

    console.log("[Canvas Accessify] Detected new selectedLink:", file);
    console.log("[Canvas Accessify] Mode:", mode);

    processSelectedFile(file, mode);
  }
});

self.addEventListener('fetch', (event: any) => {
  const url = new URL(event.request.url);
  // Intercept requests to our "buffer zone" path
  if (url.pathname.startsWith('/temp-images/')) {
    event.respondWith(handleImageRequest(url.pathname));
  }
});

async function handleImageRequest(pathname: string): Promise<Response> {
  const filename = pathname.replace('/temp-images/', '');
  
  // 1. Tell TypeScript that the storage result is a record of strings
  const result = await chrome.storage.local.get(filename) as Record<string, string>;
  
  // 2. Extract the value (it will be string | undefined)
  const base64Data: string | undefined = result[filename];

  if (!base64Data) {
    return new Response('Image Not Found', { status: 404 });
  }

  // 3. Use 'as string' to satisfy the fetch parameter type (URL | RequestInfo)
  const response = await fetch(base64Data as string);
  const blob = await response.blob();

  return new Response(blob, {
    headers: { 
      'Content-Type': blob.type,
      'Cache-Control': 'public, max-age=3600' // Optional: cache for 1 hour
    }
  });
}