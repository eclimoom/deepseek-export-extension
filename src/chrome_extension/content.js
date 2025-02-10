// 监听DOM变化处理动态加载的内容
const observer = new MutationObserver(mutations => {
  applyStyleModifications();
});

function applyStyleModifications() {
  document.querySelectorAll('.answer-section').forEach(element => {
    element.style.cssText += `
      font-family: Arial, sans-serif;
      margin: 10px 0;
      border-left: 3px solid #4CAF50;
      padding-left: 15px;
    `;
  });
}

observer.observe(document.body, {
  childList: true,
  subtree: true
});

addExportBtn();

// add btn
function addExportBtn() {
  // 插入导出按钮
  const exportBtn = document.createElement('button');
  exportBtn.textContent = '导出为PDF';
  exportBtn.style.position = 'fixed';
  exportBtn.style.bottom = '20px';
  exportBtn.style.right = '20px';
  exportBtn.style.zIndex = 9999;
  document.body.appendChild(exportBtn);

// 点击事件处理
  exportBtn.addEventListener('click', async () => {
    const content = document.querySelector('.content-container').cloneNode(true);

    // 清理不需要的元素
    content.querySelectorAll('.ads, .side-menu').forEach(el => el.remove());

    // 发送生成PDF请求
    chrome.runtime.sendMessage({
      action: 'generatePDF',
      html: content.innerHTML
    });
  });
}
