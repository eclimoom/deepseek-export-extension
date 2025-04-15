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
}, 500);

observer.observe(document.body, {
  childList: true,
  subtree: true
});


// setTimeout(() => {
//
// }, 1000);
const downImgSvg = '<svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m6.00002 21.5999 10.19998-9.6 4.8 4.8m-14.99998 4.8h11.99998c1.9882 0 3.6-1.6118 3.6-3.6v-6m-15.59998 9.6c-1.98822 0-3.6-1.6118-3.6-3.6v-12c0-1.98822 1.61178-3.6 3.6-3.6h7.79998m7.8 3.55743-2.4542 2.44257m0 0-2.3458-2.33216m2.3458 2.33216v-6m-9.54578 5.4c0 .99411-.80588 1.8-1.8 1.8-.99411 0-1.8-.80589-1.8-1.8s.80589-1.8 1.8-1.8c.99412 0 1.8.80589 1.8 1.8z" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>'

// add btn
function addExportBtn() {


  // 获取编辑按钮
  const btns = [...document.querySelectorAll('.ds-icon-button:nth-of-type(1)')].filter((item) => {
    return item.parentElement.querySelectorAll(".ds-icon-button").length === 1 && item.parentElement.querySelectorAll(".ds-button").length === 1 && item.parentElement.parentElement.querySelectorAll('.export-pdf').length === 0;
  });


  const exportBtn = document.createElement('button');
  // exportBtn.textContent = '导出PDF';
  exportBtn.className = 'ds-moom-btn ds-export-moom-btn export-pdf'
  exportBtn.innerHTML = downImgSvg + '导出';


  // 插入导出按钮
  btns.forEach(btn => {
    // copy exportBtn to btn
    if (btn.parentElement.parentElement.querySelectorAll('.export-pdf').length > 0) {
      return;
    }
    const expBtn = exportBtn.cloneNode(true);
    expBtn.addEventListener('click', handleClick);
    btn.parentElement.parentElement.appendChild(expBtn);
  });

// 点击事件处理
  async function handleClick(evt) {
    let title = evt.target.parentElement.parentElement;
    let content = title.parentElement.nextElementSibling;
    if (content) {
      content.lastChild.style.display = 'none';
    }
    try {
      const titleCanvas = await html2canvas(title, {
        useCORS: true,
        ignoreElements: (element) => element.classList.contains('export-pdf')
      });
      const imgData = titleCanvas.toDataURL('image/png');
      await customStyle(content);
      // 获取body className
      const bodyClass = document.body.className;
      let backgroundColor = 'transparent';
      if (bodyClass.includes('dark')) {
        backgroundColor = '#292a2d';
      }
      const contentCanvas = await html2canvas(content, {useCORS: true, backgroundColor: backgroundColor});
      const contentData = contentCanvas.toDataURL('image/png');

      // 删除extension-styles
      const style = document.getElementById('extension-styles');
      if (style) {
        style.parentNode.removeChild(style);
      }
      content.lastChild.style.display = 'block';

      const titleKey = extractKeyPoints(title.textContent).substring(0, 18);
      mergeImages(imgData, contentData, titleKey);
    } catch (error) {
      console.error('Error capturing screenshots:', error);
    }
  }

  async function customStyle(dom) {
    const style = document.createElement('style');
    style.id = 'extension-styles';
    style.rel = 'stylesheet';
    style.style.opacity = '0';
    style.style.height = '1px';

    let styleStr = `
    .deep-min-moom * {
      --ds-md-zoom: 0.95 !important;
      --ds-font-size-m: 12px !important;
      --ds-line-height-m: 16px !important;
      .ds-markdown{
        min-height: 16px !important;
      }
      .ds-markdown h3{
        line-height: 1.3 !important;
        font-size: calc(var(--ds-md-zoom) * 13px) !important;
      }
      .ds-markdown h1, .ds-markdown h2, .ds-markdown h3, .ds-markdown h4, .ds-markdown h5, .ds-markdown h6{
        margin: 4px 0 !important;
      }
        .ds-markdown ul, .ds-markdown ol {
          margin: 2px 0 2px !important;
        }
      .ds-markdown p{
        margin: calc(var(--ds-md-zoom)*2px)0 !important;
      }
        /*todo 暂时方案 */
        .fa81{
          padding-bottom: 0 !important;
          margin-bottom: 4px !important;
          font-size: 12px !important;
          &>div{
            padding: 2px 10px !important;
            font-size: 12px !important;
          }
        }
    }
    `;
    style.innerHTML = styleStr;
    dom.appendChild(style);
  }

  /** title 截取函数
   * @param title
   * 规则：截取前10个字符，
   * 如果包含 ， 。 , . 等则截取到第一个符号之前的内容
   */
  function truncateTitle(title) {
    // 使用正则表达式匹配第一个标点符号
    const punctuationPattern = /[，。,.]/;
    const match = title.match(punctuationPattern);

    // 如果找到标点符号，截取到该符号之前的内容
    if (match && match.index !== undefined) {
      return title.substring(0, match.index);
    }

    // 如果没有标点符号，直接截取前10个字
    return title.length > 10 ? title.substring(0, 10) : title;
  }


  function extractKeyPoints(question) {
    const actionWords = ["如何", "怎么", "怎样", "怎么才能", "怎样才能", "为什么", "为何", "为什么会", "为何会", "为啥会", '请用', '请给',  '请帮', '请问', '请教', '请解', '请指出', '请说出'];
    const targetWords = ["提高", "学习", "解决", "选择", "优化", "管理", "应对", "实现", "打造", "改善", "用来"];
    const stopWords = ["的", "了", "吗", "呢", "啊", "呀",];

    // 去除问题中的标点符号，去除常见疑问词（如“如何”）
    let keyPhrase = question.replace(/[，。？！,.?\s]/g, "").replace(/导出$/g, "");
    for (const word of actionWords) {
      if (keyPhrase.startsWith(word)) {
        keyPhrase = keyPhrase.slice(word.length).trim();
        break;
      }
    }
    let filteredWords = keyPhrase.replace(/我们|我|你们|你/g, '').split(" "); // 第一人称和第二人称代词
    let action = "";
    let target = "";
    for (const word of filteredWords) {
      if (targetWords.includes(word)) {
        action = word;
      } else if (!stopWords.includes(word)) {
        target = target ? `${target} ${word}` : word;
      }
    }
    if (action && target) {
      return `${action} ${target}`;
    } else if (target) {
      return target;
    } else {
      return keyPhrase; // 如果无法提取，返回原问题的简化版
    }
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
        let padding = 10;
        canvas.width = Math.max(titleImg.width, contentImg.width) + padding * 2;
        canvas.height = titleImg.height + contentImg.height + padding * 2;
        // ctx 增加背景色
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(titleImg, canvas.width - titleImg.width * 0.8 - padding, padding / 2, titleImg.width * 0.8, titleImg.height * 0.8);
        ctx.drawImage(contentImg, padding, titleImg.height);


        const mergedImgData = canvas.toDataURL('image/png');
        // generatePDF(mergedImgData).then();

        // 保存图片 png 到下载
        const link = document.createElement('a');
        link.href = mergedImgData;
        link.download = `dp_${title}.png`;
        link.click();

      };
    };
  }


  // 拼接pdf
  // async function generatePDF(base64) {
  //   const pdfDoc = await PDFLib.PDFDocument.create();
  //
  //   // 获取base64 宽高
  //   const img = new Image();
  //   img.src = base64;
  //   let aspectRatio = img.width / img.height;
  //
  //
  //   const pageWidth = 466;
  //   const pageHeight = 1200;
  //
  //   let width, height;
  //   if (pageWidth / aspectRatio <= pageHeight) {
  //     width = pageWidth;
  //     height = pageWidth / aspectRatio;
  //   } else {
  //     width = pageHeight * aspectRatio;
  //     height = pageHeight;
  //   }
  //
  //   let remainingHeight = img.height;
  //   let yOffset = 0;
  //
  //   while (remainingHeight > 0) {
  //     const page = pdfDoc.addPage();
  //     const drawHeight = Math.min(height, remainingHeight);
  //     page.drawImage(img, {
  //       x: 12,
  //       y: pageHeight - drawHeight - yOffset,
  //       width: width,
  //       height: drawHeight,
  //     });
  //
  //     remainingHeight -= drawHeight;
  //     yOffset += drawHeight;
  //   }
  //
  //   const mergedPdfBytes = await pdfDoc.save();
  //   const blob = new Blob([mergedPdfBytes], {type: 'application/pdf'});
  //   const link = document.createElement('a');
  //   link.href = URL.createObjectURL(blob);
  //   link.download = `down.pdf`;
  //   link.click();
  // }

  // loadCustomStyles()
  //
  // function loadCustomStyles() {
  //   // document.body.parentElement.classList.add('deep-min-moom');
  //   document.body.classList.add('deep-min-moom');
  // }
  //
  // function unloadCustomStyles() {
  //   // const link = document.getElementById('custom-styles');
  //   // if (link) {
  //   //   link.parentNode.removeChild(link);
  //   // }
  //   document.body.classList.remove('deep-min-moom')
  // }
}


addZoomBtn();

// 向页面中增加一个缩小文字的按钮
function addZoomBtn() {
  const zoomBtn = document.createElement('button');
  zoomBtn.className = 'ds-zoom-moom ds-moom-btn';
  zoomBtn.textContent = '缩小';

  zoomBtn.addEventListener('click', handleZoom);
  document.body.appendChild(zoomBtn);
}

function handleZoom() {
  let isAdd = document.querySelector('.deep-min-moom');
  let zoomBtn = document.querySelector('.ds-zoom-moom');
  if (isAdd) {
    document.body.classList.remove('deep-min-moom');
    zoomBtn.textContent = '缩小';
  } else {
    document.body.classList.add('deep-min-moom');
    zoomBtn.textContent = '恢复';
  }
}
