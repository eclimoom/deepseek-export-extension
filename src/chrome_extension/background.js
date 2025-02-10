chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generatePDF') {
    console.log('生成 PDF 请求>>>>>>>', request.html);
    // import('jspdf').then((jsPDF) => {
    //   const doc = new jsPDF.default();
    //
    //   // 创建虚拟DOM处理样式
    //   const iframe = document.createElement('iframe');
    //   document.body.appendChild(iframe);
    //   const iframeDoc = iframe.contentDocument;
    //
    //   // 注入样式
    //   iframeDoc.write(`
    //     <style>
    //       body { font-family: Arial; line-height: 1.4; }
    //       .question { font-size: 16px; margin-bottom: 10px; }
    //       .answer { font-size: 14px; color: #333; }
    //     </style>
    //     ${request.html}
    //   `);
    //
    //   // 使用html2canvas处理复杂样式
    //   html2canvas(iframeDoc.body).then(canvas => {
    //     const imgData = canvas.toDataURL('image/png');
    //     const imgWidth = doc.internal.pageSize.getWidth();
    //     const imgHeight = (canvas.height * imgWidth) / canvas.width;
    //
    //     doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    //     doc.save('deepseek-export.pdf');
    //     iframe.remove();
    //   });
    // });
  }
});
