/*
 * @Author: Kanata You 
 * @Date: 2022-06-19 16:08:42 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-06-25 18:45:04
 */

import React from 'react';
import styled from 'styled-components';
import { jsPDF } from 'jspdf';
import { Worker, Viewer } from '@react-pdf-viewer/core';

import type Menu from '@utils/menu';

// import '@react-pdf-viewer/core/lib/styles/index.css';
import './index.css';

import '@public/fonts/simhei-normal';
import { Button, /* Checkbox */ } from 'antd';

import background from '@public/images/background.png';
import backgroundShort from '@public/images/cover-s.png';
import header from '@public/images/header-n.png';


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
  height: '52px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  backgroundColor: '#555',
  paddingBlock: '0',
  paddingInline: '20px',
  boxShadow: '1px 1px 3px 3px #4448',
});

export interface MenuPrinterProps {
  data: Menu;
}

export const PAPER_WIDTH = 210;
const PAPER_HEIGHT = 297;
const PAPER_PADDING_TOP = 20;
const PAPER_PADDING_BOTTOM = 18;

export const headerPicHeight = 85;
const groupMarginBlockStart = 4;
const groupMarginBlockEnd = 3;
const groupPaddingBlockStart = 3;
const groupPaddingBlockEnd = 1;
const titleFontSize = 20;
const titlePaddingBlock = 7.7;
const titleLineHeight = 10.5;
const titleMarginInline = 15.6;
const titlePaddingInline = 7.2;
const platePaddingInline = 10;
const plateMarginBlockStart = 2.8;
const plateMarginBlockEnd = 1.8;
const plateWidth = (PAPER_WIDTH - titleMarginInline * 2) / 2 * 0.82;
const plateNameFontSize = 17;
const plateNameLineHeight = 8.2;
const plateNamePaddingBlock = 5.95;
export const coverWidth = plateWidth;
export const coverHeight = plateWidth * 0.618;
const coverMarginBlockStart = 2;
const coverMarginBlockEnd = 1.6;
const textIndent = 2;

const imgBackground = new Image();
imgBackground.src = background;

const imgBackgroundShort = new Image();
imgBackgroundShort.src = backgroundShort;

const imgHeader = new Image();
imgHeader.src = header;

const paintBackground = (doc: jsPDF, short: boolean) => {
  doc.addImage(
    short ? imgBackgroundShort : imgBackground,
    'PNG',
    0,
    0,
    PAPER_WIDTH,
    PAPER_HEIGHT,
  );
};

/** 展示菜单生成效果的组件 */
const MenuPrinter: React.FC<MenuPrinterProps> = React.memo(function MenuPrinter ({
  data,
}) {
  const doc = React.useMemo(() => {
    const doc = new jsPDF();

    paintBackground(doc, Boolean(data.headerPic));
  
    doc.setFont('simhei');
  
    let y = PAPER_PADDING_TOP;
  
    // 顶部头图
  
    if (data.headerPic) {
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
      // 开始
      y += groupMarginBlockStart;
      
      // 标题部分
      // 检查是否需要翻页（标题 + 第一行的两个菜品）
      const dy = PAPER_HEIGHT - y - (
        titleLineHeight + groupMarginBlockStart
      ) - grp.plates.slice(0, 2).reduce<number>((prev, p) => {
        return Math.max(
          prev,
          plateMarginBlockStart
          + (p.pic ? (
            coverMarginBlockStart + coverHeight + coverMarginBlockEnd
          ) : 0)
          + plateNameLineHeight
          // + (p.describe ? plateNameLineHeight * 0.85 : 0)
          + (p.preference?.labels.length ?? 0) * plateNameLineHeight * 0.82
        );
      }, 0);
      if (dy < PAPER_PADDING_BOTTOM) {
        doc.addPage();
        paintBackground(doc, false);
        y = PAPER_PADDING_TOP + groupMarginBlockStart;
      }
      // 标题背景
      // doc.setDrawColor(0);
      // doc.setFillColor(3, 3, 3);
      // doc.rect(titleMarginInline, y, 100, titleLineHeight, "F");
      doc.addImage(
        imgHeader,
        'PNG',
        titleMarginInline,
        y,
        150,
        titleLineHeight
      );
      // 类目标题
      doc.setFontSize(titleFontSize);
      doc.setTextColor(210, 140, 73);
      doc.text(
        grp.label || '(无标题)',
        titleMarginInline + titlePaddingInline,
        y + titlePaddingBlock
      );
      y += titleLineHeight + groupPaddingBlockStart;

      let yStart = y;
  
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
          + (p.pic ? (
            coverMarginBlockStart + coverHeight + coverMarginBlockEnd
          ) : 0)
          + plateNameLineHeight
          // + (p.describe ? plateNameLineHeight * 0.85 : 0)
          + (p.preference?.labels.length ?? 0) * plateNameLineHeight * 0.82
        );
        if (dy < PAPER_PADDING_BOTTOM) {
          const yEnd = y;

          doc.setDrawColor(171, 161, 162);
          doc.line(
            PAPER_WIDTH / 2,
            yStart + 3.8,
            PAPER_WIDTH / 2,
            yEnd - 4.4,
          );
          doc.setFillColor(211, 195, 105);
          doc.rect(
            PAPER_WIDTH / 2 - 1,
            yStart + 2.8,
            2,
            2,
            'F'
          );
          doc.rect(
            PAPER_WIDTH / 2 - 1,
            yEnd - 5.4,
            2,
            2,
            'F'
          );

          doc.addPage();
          paintBackground(doc, false);

          y = PAPER_PADDING_TOP + groupMarginBlockStart;
          yStart = y;
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
        // doc.rect(x1, position === 'left' ? yLeft : yRight, x2 - x1, 0);
        // 菜品图片
        if (p.pic) {
          addY(coverMarginBlockStart);
          doc.addImage(
            p.pic,
            'PNG',
            (x1 + x2) / 2 - coverWidth / 2,
            position === 'left' ? yLeft : yRight,
            coverWidth,
            coverHeight,
          );
          addY(coverHeight + coverMarginBlockEnd);
          doc.setDrawColor(80, 80, 80);
          // doc.rect(x1, position === 'left' ? yLeft : yRight, x2 - x1, 0);
        }
        // 菜品名称
        doc.setFillColor(255, 249, 240);
        doc.rect(
          x1,
          position === 'left' ? yLeft : yRight,
          x2 - x1,
          plateNameLineHeight,
          'F'
        );
        doc.setFontSize(plateNameFontSize);
        doc.setTextColor(15, 15, 15);
        doc.text(
          p.name || '(无标题)',
          x1 + textIndent,
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
        doc.setTextColor(210, 140, 73);
        // doc.setFillColor(255, 249, 240);
        // doc.rect(
        //   x2 - widthLeft - widthRight - textIndent - 4,
        //   position === 'left' ? yLeft : yRight,
        //   widthLeft + widthRight + textIndent + 5,
        //   plateNameLineHeight,
        //   'F'
        // );
        doc.text(
          contentLeft,
          x2 - widthLeft - widthRight - textIndent,
          (position === 'left' ? yLeft : yRight) + plateNamePaddingBlock
        );
        doc.setFontSize(plateNameFontSize * priceFontSizeAdjust);
        doc.setTextColor(210, 140, 73);
        doc.text(
          contentRight,
          x2 - widthRight - textIndent,
          (position === 'left' ? yLeft : yRight) + plateNamePaddingBlock
        );
        addY(plateNameLineHeight);
        doc.setDrawColor(80, 80, 80);
        // doc.rect(x1, position === 'left' ? yLeft : yRight, x2 - x1, 0);
        // // 菜品说明
        // if (p.describe) {
        //   doc.setFontSize(plateNameFontSize * 0.9);
        //   doc.setTextColor(140, 140, 140);
        //   doc.text(
        //     p.describe,
        //     x1,
        //     (position === 'left' ? yLeft : yRight) + plateNamePaddingBlock * 0.875
        //   );
        //   addY(plateNameLineHeight * 0.85);
        //   doc.setDrawColor(80, 80, 80);
        //   // doc.rect(x1, position === 'left' ? yLeft : yRight, x2 - x1, 0);
        // }
        // 菜品定制
        if (p.preference?.labels.length) {
          p.preference.labels.forEach((l, j) => {
            doc.setFillColor(255, 249, 240);
            doc.rect(
              x1,
              position === 'left' ? yLeft : yRight,
              x2 - x1,
              plateNameLineHeight * 0.82,
              'F'
            );
            
            doc.setFontSize(plateNameFontSize * 0.9);
            doc.setTextColor(60, 60, 60);
            doc.setDrawColor(12, 12, 12);
            doc.setFillColor(210, 140, 73);
            doc.rect(
              x1 + textIndent * 2 + 1.3,
              (position === 'left' ? yLeft : yRight) + 1.5,
              3.6,
              3.6,
              j === p.preference?.supposedIdx ? 'F' : undefined
            );
            doc.text(
              l || '(未定义)',
              x1 + textIndent * 2 + 6.4,
              (position === 'left' ? yLeft : yRight) + plateNamePaddingBlock * 0.85
            );
            addY(plateNameLineHeight * 0.82);
          });
        }
        doc.setDrawColor(0, 0, 0);
        // doc.rect(x1, position === 'left' ? yLeft : yRight, x2 - x1, 0);
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

      const yEnd = y;

      doc.setDrawColor(171, 161, 162);
      doc.line(
        PAPER_WIDTH / 2,
        yStart + 3.8,
        PAPER_WIDTH / 2,
        yEnd - 4.4,
      );
      doc.setFillColor(211, 195, 105);
      doc.rect(
        PAPER_WIDTH / 2 - 1,
        yStart + 2.8,
        2,
        2,
        'F'
      );
      doc.rect(
        PAPER_WIDTH / 2 - 1,
        yEnd - 5.4,
        2,
        2,
        'F'
      );
  
      // 结束
      y += groupPaddingBlockEnd + groupMarginBlockEnd;
    });

    return doc;
  }, [data.groups, data.headerPic]);
  
  const output = doc.output('datauristring');
  
  return (
    <Container>
      <ToolBar>
        {/* <Checkbox>
          自动更新预览
        </Checkbox> */}
        <Button
          onClick={() => {
            doc.save();
          }}
        >
          导出 PDF
        </Button>
      </ToolBar>
      <div
        style={{
          flexGrow: 1,
          flexShrink: 1,
          overflow: 'hidden',
        }}
      >
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.14.305/build/pdf.worker.min.js">
          <Viewer
            fileUrl={output}
            defaultScale={0.8}
          />
        </Worker>
      </div>
    </Container>
  );
});


export default MenuPrinter;
