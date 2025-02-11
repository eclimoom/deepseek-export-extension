// 监听DOM变化处理动态加载的内容

const observer = new MutationObserver(mutations => {
  applyStyleModifications();
});

let timer = null;
function applyStyleModifications() {
  // 增加节流延迟1s执行
  clearTimeout(timer);
  timer = setTimeout(() => {
    addExportBtn();
  }, 1000);
}
timer = setTimeout(() => {
  addExportBtn();
}, 1000);

observer.observe(document.body, {
  childList: true,
  subtree: true
});


// setTimeout(() => {
//
// }, 1000);

// add btn
function addExportBtn() {


  // 获取编辑按钮
  const btns = [...document.querySelectorAll('.ds-icon-button:nth-of-type(1)')].filter((item) => {
    return item.parentElement.querySelectorAll(".ds-icon-button").length === 2 && item.parentElement.parentElement.querySelectorAll('.export-pdf').length === 0;
  });


  const exportBtn = document.createElement('button');
  exportBtn.textContent = '导出PDF';
  exportBtn.style.position = 'absolute';
  exportBtn.style.right = 'calc(100% + 77px)';

  exportBtn.style.top = '4px';
  exportBtn.style.width = '64px';
  exportBtn.style.fontSize = '12px';
  exportBtn.style.right = '-68px';
  exportBtn.classList.add('export-pdf');


  // 插入导出按钮
  btns.forEach(btn => {
    // copy exportBtn to btn
    if(btn.parentElement.parentElement.querySelectorAll('.export-pdf').length > 0) {
      return;
    }
    const expBtn = exportBtn.cloneNode(true);
    expBtn.addEventListener('click', handleClick);
    btn.parentElement.parentElement.appendChild(expBtn);
  });

// 点击事件处理
  function handleClick(evt) {
    let title = evt.target.parentElement;
    let content = title.parentElement.nextElementSibling;
    content.lastChild.style.display = 'none';


    // 获取 页面的 style 插入iframe


    html2canvas(title).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      html2canvas(content).then(canvas => {
        content.lastChild.style.display = 'block';
        const contentData = canvas.toDataURL('image/png');
        mergeImages(imgData, contentData, title.textContent);
      });
    });

  }

  function mergeImages(titleImgData, contentImgData, title) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const titleImg = new Image();
    const contentImg = new Image();

    titleImg.src = titleImgData;
    contentImg.src = contentImgData;

    titleImg.onload = () => {
      contentImg.onload = () => {
        canvas.width = Math.max(titleImg.width, contentImg.width);
        canvas.height = titleImg.height + contentImg.height;

        // ctx 增加背景色
        ctx.fillStyle = 'white';
        ctx.drawImage(titleImg, canvas.width - titleImg.width, 0);
        ctx.drawImage(contentImg, 0, titleImg.height);


        const mergedImgData = canvas.toDataURL('image/png');
        // generatePDF(mergedImgData).then();

        // 保存图片 png 到下载
        const link = document.createElement('a');
        link.href = mergedImgData;
        link.download = `deepseek_${title.slice(0,10)}.png`;
        link.click();

      };
    };
  }


  // 拼接pdf
  async function generatePDF(base64) {
    const pdfDoc = await PDFLib.PDFDocument.create();

    // 获取base64 宽高
    const img = new Image();
    img.src = base64;
    let aspectRatio = img.width / img.height;


    const pageWidth = 466;
    const pageHeight = 1200;

    let width, height;
    if (pageWidth / aspectRatio <= pageHeight) {
      width = pageWidth;
      height = pageWidth / aspectRatio;
    } else {
      width = pageHeight * aspectRatio;
      height = pageHeight;
    }

    let remainingHeight = img.height;
    let yOffset = 0;

    while (remainingHeight > 0) {
      const page = pdfDoc.addPage();
      const drawHeight = Math.min(height, remainingHeight);
      page.drawImage(img, {
        x: 12,
        y: pageHeight - drawHeight - yOffset,
        width: width,
        height: drawHeight,
      });

      remainingHeight -= drawHeight;
      yOffset += drawHeight;
    }

    const mergedPdfBytes = await pdfDoc.save();
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `down.pdf`;
    link.click();
  }
}
