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
  mode: string
) {
  try {
    console.log("[Canvas Accessify] Starting pipeline for:", file);

    const downloadUrl = toDownloadUrl(file.url);
    console.log("[Canvas Accessify] Converted to download URL:", downloadUrl);

    const originalPdf = await fetchPdfBlob(downloadUrl);
    console.log("[Canvas Accessify] Original PDF blob:", originalPdf);

    // // Placeholder renderer (returns original PDF unchanged)
    // const renderedPdf = await renderPdfPlaceholder(originalPdf);
    // console.log("[Canvas Accessify] Rendered PDF blob:", renderedPdf);

    // const blobUrl = URL.createObjectURL(renderedPdf);
    // console.log("[Canvas Accessify] Blob URL:", blobUrl);

    // // Open viewer with blob URL + mode
    // const viewerUrl =
    //   chrome.runtime.getURL("pdf-viewer.html") +
    //   `?url=${encodeURIComponent(blobUrl)}&mode=${encodeURIComponent(mode)}`;

    // console.log("[Canvas Accessify] Opening viewer:", viewerUrl);

    // chrome.tabs.create({ url: viewerUrl });

    const htmlString = await renderPdf(originalPdf);
    console.log("[Canvas Accessify] Rendered PDF blob:", htmlString);

    // 1. 将 HTML 字符串存入 chrome.storage.local
    chrome.storage.local.set({ tempHtmlData: htmlString }, () => {
      
      // 2. 获取扩展内部页面的真实 URL
      const viewerUrl = chrome.runtime.getURL("viewer.html") +
                        `?mode=${encodeURIComponent(mode)}`;
      
      //console.log("[Canvas Accessify] Opening viewer:", viewerUrl);
      
      // 3. 打开该页面
      chrome.tabs.create({ url: viewerUrl });
    });
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
    const mode = (changes.selectedMode?.newValue as string) || "adhd";

    console.log("[Canvas Accessify] Detected new selectedLink:", file);
    console.log("[Canvas Accessify] Mode:", mode);

    processSelectedFile(file, mode);
  }
});
