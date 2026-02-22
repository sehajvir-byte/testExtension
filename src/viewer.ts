import DOMPurify from 'dompurify';
// Import Katex
import renderMathInElement from 'katex/dist/contrib/auto-render.js';

const fontUrl = chrome.runtime.getURL("fonts/OpenDyslexic-Regular.otf"); 

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
    strong{
      text-color: #FFDE64;
    }
`;

const fontCSS: string = `
  @font-face {
    font-family: 'OpenDyslexic';
    src: url('${fontUrl}');
  }
  * {
    font-family: 'OpenDyslexic', sans-serif !important;
  }
`;

chrome.storage.local.get(["tempHtmlData", "dyslexic"], (result: { [key: string]: any }) => {
  const htmlContent: string = result.tempHtmlData;
  
  if (htmlContent) {
    // 1. 清洗 HTML
    const cleanTrustedHtml = DOMPurify.sanitize(htmlContent, {
      RETURN_TRUSTED_TYPE: true,
      WHOLE_DOCUMENT: true
    });

    // 2. 替换 DOM（这会清空原有的 head 和 body）
    document.documentElement.innerHTML = cleanTrustedHtml as unknown as string;
    
    if (!document.head) {
      const headEl = document.createElement('head');
      document.documentElement.insertBefore(headEl, document.body);
    }

    // 3. 注入自定义 CSS
    const styleEl = document.createElement('style');
    if(result.dyslexic){
      styleEl.textContent = customCSS+fontCSS;
    }else{
      styleEl.textContent = customCSS;
    }
    document.head.appendChild(styleEl);

    // 4. 注入 KaTeX 的 CSS (允许使用 CDN，这样不需要在扩展里打包庞大的字体文件)
    const katexLink = document.createElement('link');
    katexLink.rel = 'stylesheet';
    katexLink.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
    document.head.appendChild(katexLink);
    
    // 5. 执行 KaTeX 自动渲染 (使用本地打包的 JS，符合 Chrome CSP 规范)
    // 必须确保在 DOM 替换完成后执行
    renderMathInElement(document.body, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\[', right: '\\]', display: true}
      ],
      throwOnError: false // 防止某个公式语法错误导致整个页面渲染中断
    });
    
    // 6. 清理 Storage
    chrome.storage.local.remove("tempHtmlData");
  } else {
    document.body.innerHTML = "<h1>加载失败或没有数据</h1>";
  }
});