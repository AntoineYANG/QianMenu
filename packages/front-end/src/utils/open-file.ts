/*
 * @Author: Kanata You 
 * @Date: 2022-06-19 20:06:46 
 * @Last Modified by:   Kanata You 
 * @Last Modified time: 2022-06-19 20:06:46 
 */

/**
 * 调起文件对话框，导入文件.
 */
const openFile = async (accept: string[]): Promise<File | null> => {
  const element = document.createElement('input');
  element.type = 'file';
  element.accept = accept.join(',');
  element.multiple = false;

  element.style.display = 'none';
  element.ariaHidden = 'true';

  const p = await new Promise<{
    file: File | null;
    handler: () => void;
  }>(resolve => {
    document.body.appendChild(element);

    const onDialogClose = () => {
      resolve({
        file: element.files?.[0] ?? null,
        handler: onDialogClose
      });

      element.remove();
    };

    element.onchange = onDialogClose;
    
    element.click();

    window.addEventListener('click', onDialogClose, {
      capture: true
    });
  });

  window.removeEventListener('click', p.handler);

  return p.file;
};


export default openFile;
