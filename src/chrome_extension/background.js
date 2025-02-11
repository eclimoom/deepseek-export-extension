chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generatePDF') {
    console.log('generatePDF', request);
    // const iframe = document.createElement('iframe');
    // document.body.appendChild(iframe);
    // const iframeDoc = iframe.contentDocument;
    //
    // iframeDoc.write(`
    //   <style>
    //     body { font-family: Arial; line-height: 1.4; }
    //     .question { font-size: 16px; margin-bottom: 10px; }
    //     .answer { font-size: 14px; color: #333; }
    //   </style>
    //   ${request.title}
    //   ${request.content}
    // `);
    //
    // html2canvas(iframeDoc.body).then(canvas => {
    //   const imgData = canvas.toDataURL('image/png');
    //   sendResponse({ imgData });
    //   iframe.remove();
    // });

    return true; // Keep the message channel open for sendResponse
  }
});
