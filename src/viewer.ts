import DOMPurify from 'dompurify';

// 1. 定义你的自定义 CSS
const customCSS: string = `
  code {
			font-size: 1em;
			background-color: #f4f4f4;
			padding: 2px 6px;
			border-radius: 4px;
			font-size: 24px;
	}
  body {
    font-size: 20px;
    line-height: 2;
  }
`;

chrome.storage.local.get(["tempHtmlData"], (result: { [key: string]: any }) => {
  const htmlContent: string = result.tempHtmlData;
  
  if (htmlContent) {
    // 2. 使用 DOMPurify 清洗 HTML 并生成 TrustedHTML
    const cleanTrustedHtml = DOMPurify.sanitize(htmlContent, {
      RETURN_TRUSTED_TYPE: true,
      WHOLE_DOCUMENT: true // 允许保留 <html>, <head>, <body> 结构
    });

    // 3. 安全地替换整个页面的内容（此时原有的 head 和 body 会被覆盖）
    document.documentElement.innerHTML = cleanTrustedHtml as unknown as string;
    
    // 4. 动态创建 style 标签并注入自定义 CSS
    const styleEl = document.createElement('style');
    styleEl.textContent = customCSS;
    
    // 确保 document.head 存在（即使传入的 HTML 没有 head，浏览器通常也会自动补全）
    if (!document.head) {
      const headEl = document.createElement('head');
      document.documentElement.insertBefore(headEl, document.body);
    }
    
    // 将自定义样式追加到 head 的末尾，确保其优先级最高
    document.head.appendChild(styleEl);
    
    // 5. 清理 storage

    chrome.storage.local.remove("tempHtmlData");
  } else {
    document.body.innerHTML = "<h1>Loading failed or no data found.</h1>";
  }
});