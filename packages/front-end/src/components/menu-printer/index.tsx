/*
 * @Author: Kanata You 
 * @Date: 2022-06-19 16:08:42 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-06-21 04:40:18
 */

import React from 'react';
import styled from 'styled-components';
import { jsPDF } from 'jspdf';
import { Worker, Viewer } from '@react-pdf-viewer/core';

import type Menu from '@utils/menu';

// import '@react-pdf-viewer/core/lib/styles/index.css';
import './index.css';

import '@public/fonts/simhei-normal';


const formatPrice = (price: number): [string, string] => {
  const tmp = price.toString(10);
  const before = tmp.slice(0, tmp.length - 2);
  const after = tmp.slice(tmp.length - 2);

  return [before, after];
};

const Container = styled.section({
  flexGrow: 1,
  flexShrink: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#aaa',
  paddingBlock: '0',
  paddingInline: '0',
  height: '100vh',
  overflow: 'hidden',
});

const ToolBar = styled.div({
  position: 'relative',
  zIndex: 10,
  flexGrow: 0,
  flexShrink: 0,
  width: '100%',
  height: '72px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#555',
  paddingBlock: '0',
  paddingInline: '0',
  boxShadow: '1px 1px 3px 3px #4448',
});

export interface MenuPrinterProps {
  data: Menu;
}

const PAPER_WIDTH = 210;
const PAPER_HEIGHT = 297;
const PAPER_PADDING_TOP = 20;
const PAPER_PADDING_BOTTOM = 10;

/** 展示菜单生成效果的组件 */
const MenuPrinter: React.FC<MenuPrinterProps> = React.memo(function MenuPrinter ({
  data,
}) {
  const doc = new jsPDF();

  doc.setFont('simhei');

  let y = 0;

  // 顶部头图

  if (data.headerPic) {
    const headerPicHeight = 70;

    doc.addImage(
      data.headerPic,
      'PNG',
      0,
      0,
      PAPER_WIDTH,
      headerPicHeight,
    );

    y += headerPicHeight;
  }

  // 所有菜品

  data.groups.forEach(grp => {
    const groupMarginBlockStart = 4;
    const groupMarginBlockEnd = 4;
    const titleFontSize = 21;
    const titlePaddingBlock = 8;
    const titleLineHeight = 11;
    const titleMarginInline = 6;
    const titlePaddingInline = 1.8;
    const platePaddingInline = 12;
    const plateMarginBlockStart = 3;
    const plateMarginBlockEnd = 2;
    const plateWidth = (PAPER_WIDTH - titleMarginInline * 2) / 2 * 0.67;
    const plateNameFontSize = 16;
    const plateNameLineHeight = 8;
    const plateNamePaddingBlock = 5.95;
    const coverWidth = plateWidth;
    const coverHeight = 36;
    const coverMarginBlockStart = 1;
    const coverMarginBlockEnd = 0.4;

    // 开始
    y += groupMarginBlockStart;
    
    // 标题部分
    // 检查是否需要翻页（标题 + 第一行的两个菜品）
    const dy = PAPER_HEIGHT - y - titleLineHeight - grp.plates.slice(0, 2).reduce<number>((prev, p) => {
      return Math.max(
        prev,
        plateMarginBlockStart
        + (p.pic || data.headerPic ? ( // FIXME:
          coverMarginBlockStart + coverHeight + coverMarginBlockEnd
        ) : 0)
        + plateNameLineHeight
        + (p.describe ? plateNameLineHeight * 0.85 : 0)
        + (p.preference?.labels.length ?? 0) * plateNameLineHeight * 0.82
      );
    }, 0);
    if (dy < PAPER_PADDING_BOTTOM) {
      doc.addPage();
      y = PAPER_PADDING_TOP;
    }
    // 标题背景
    // doc.addImage()
    doc.setDrawColor(0);
    doc.setFillColor(255, 0, 0);
    doc.rect(titleMarginInline, y, 100, titleLineHeight, "F");
    // 类目标题
    doc.setFontSize(titleFontSize);
    doc.setTextColor(240, 240, 240);
    doc.text(
      grp.label,
      titleMarginInline + titlePaddingInline,
      y + titlePaddingBlock
    );
    y += titleLineHeight;

    // 菜品列表
    let yLeft = y;
    let yRight = y;
    grp.plates.forEach((p, i) => {
      const position = i % 2 ? 'right' : 'left';
      const addY = (d: number) => {
        if (position === 'left') {
          yLeft += d;
        } else {
          yRight += d;
        }
      };
      // 检查是否需要翻页
      const dy = PAPER_HEIGHT - (position === 'left' ? yLeft : yRight) - (
        plateMarginBlockStart
        + (p.pic || data.headerPic ? ( // FIXME:
          coverMarginBlockStart + coverHeight + coverMarginBlockEnd
        ) : 0)
        + plateNameLineHeight
        + (p.describe ? plateNameLineHeight * 0.85 : 0)
        + (p.preference?.labels.length ?? 0) * plateNameLineHeight * 0.82
      );
      if (dy < PAPER_PADDING_BOTTOM) {
        doc.addPage();
        y = PAPER_PADDING_TOP;
        yLeft = y;
        yRight = y;
      }
      // 垂直间距
      addY(plateMarginBlockStart);
      const x1 = position === 'left' ? (
        PAPER_WIDTH / 2 - platePaddingInline - plateWidth
      ) : (
        PAPER_WIDTH / 2 + platePaddingInline
      );
      const x2 = x1 + plateWidth;
      doc.setDrawColor(0, 0, 0);
      doc.rect(x1, position === 'left' ? yLeft : yRight, x2 - x1, 0);
      // 菜品图片
      if (p.pic || data.headerPic) { // FIXME:
        addY(coverMarginBlockStart);
        doc.addImage(
          p.pic || data.headerPic, // FIXME:
          'PNG',
          (x1 + x2) / 2 - coverWidth / 2,
          position === 'left' ? yLeft : yRight,
          coverWidth,
          coverHeight,
        );
        addY(coverHeight + coverMarginBlockEnd);
        doc.setDrawColor(80, 80, 80);
        doc.rect(x1, position === 'left' ? yLeft : yRight, x2 - x1, 0);
      }
      // 菜品名称
      doc.setFontSize(plateNameFontSize);
      doc.setTextColor(15, 15, 15);
      doc.text(
        p.name,
        x1,
        (position === 'left' ? yLeft : yRight) + plateNamePaddingBlock,
        undefined,
        undefined,
        // // @ts-ignore
        // 'center'
      );
      // 菜品价格
      const priceFontSizeAdjust = 0.92;
      const contentLeft = `${formatPrice(p.price)[0]}.`;
      const contentRight = formatPrice(p.price)[1];
      doc.setFontSize(plateNameFontSize);
      const widthLeft = doc.getTextWidth(contentLeft) - plateNameFontSize * 0.07;
      doc.setFontSize(plateNameFontSize * priceFontSizeAdjust);
      const widthRight = doc.getTextWidth(contentRight);
      doc.setFontSize(plateNameFontSize);
      doc.setTextColor(200, 120, 80);
      doc.text(
        contentLeft,
        x2 - widthLeft - widthRight,
        (position === 'left' ? yLeft : yRight) + plateNamePaddingBlock
      );
      doc.setFontSize(plateNameFontSize * priceFontSizeAdjust);
      doc.text(
        contentRight,
        x2 - widthRight,
        (position === 'left' ? yLeft : yRight) + plateNamePaddingBlock
      );
      addY(plateNameLineHeight);
      doc.setDrawColor(80, 80, 80);
      doc.rect(x1, position === 'left' ? yLeft : yRight, x2 - x1, 0);
      // 菜品说明
      if (p.describe) {
        doc.setFontSize(plateNameFontSize * 0.9);
        doc.setTextColor(140, 140, 140);
        doc.text(
          p.describe,
          x1,
          (position === 'left' ? yLeft : yRight) + plateNamePaddingBlock * 0.875
        );
        addY(plateNameLineHeight * 0.85);
        doc.setDrawColor(80, 80, 80);
        doc.rect(x1, position === 'left' ? yLeft : yRight, x2 - x1, 0);
      }
      // 菜品定制
      if (p.preference?.labels.length) {
        p.preference.labels.forEach((l, j) => {
          doc.setFontSize(plateNameFontSize * 0.9);
          doc.setTextColor(60, 60, 60);
          doc.setDrawColor(12, j === p.preference?.supposedIdx ? 180 : 12, 12);
          doc.rect(x1 + 1.3, (position === 'left' ? yLeft : yRight) + 1.5, 3.6, 3.6);
          doc.text(
            l,
            x1 + 6.4,
            (position === 'left' ? yLeft : yRight) + plateNamePaddingBlock * 0.85
          );
          addY(plateNameLineHeight * 0.82);
        });
      }
      doc.setDrawColor(0, 0, 0);
      doc.rect(x1, position === 'left' ? yLeft : yRight, x2 - x1, 0);
      // 菜品搭配推荐
      // TODO:
      // 垂直间距
      addY(plateMarginBlockEnd);
      // 对齐两栏垂直位置
      if (position === 'right') {
        y = Math.max(yLeft, yRight);
        yLeft = y;
        yRight = y;
      }
    });
    y = Math.max(yLeft, yRight);

    // 结束
    y += groupMarginBlockEnd;
  });
  
  const output = doc.output('datauristring');
  
  return (
    <Container>
      <ToolBar
        onClick={() => {
          doc.save();
        }}
      />
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.14.305/build/pdf.worker.min.js">
        <Viewer
          fileUrl={output}
          defaultScale={0.8}
        />
      </Worker>
    </Container>
  );
});


export default MenuPrinter;
