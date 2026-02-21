// 从 storage 中读取 HTML 字符串
chrome.storage.local.get(["tempHtmlData"], (result) => {
  const htmlContent = result.tempHtmlData;
  
  if (typeof htmlContent === 'string' && htmlContent.length > 0) {
    // This replaces the entire HTML content of the page with Gemini's output
    document.documentElement.innerHTML = htmlContent;
    
    // Optional: Update title
    document.title = "Inclusive Canvas - Accessible View";

    // Clean up storage
    chrome.storage.local.remove("tempHtmlData");
  } else {
    document.body.innerHTML = "<h1>Loading failed or no data found.</h1>";
  }
});