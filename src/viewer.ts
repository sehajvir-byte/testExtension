// 从 storage 中读取 HTML 字符串
chrome.storage.local.get(["tempHtmlData"], (result: { [key: string]: any }) => {
  const htmlContent: string = result.tempHtmlData;
  
  if (htmlContent) {
    // 替换整个文档的内容
    document.open();
    document.write(htmlContent);
    document.close();
    
    // 可选：读取完后清除 storage，释放空间
    chrome.storage.local.remove("tempHtmlData");
  } else {
    document.body.innerHTML = "<h1>加载失败或没有数据</h1>";
  }
});