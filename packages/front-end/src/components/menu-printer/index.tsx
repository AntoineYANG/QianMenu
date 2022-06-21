/*
 * @Author: Kanata You 
 * @Date: 2022-06-19 16:08:42 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-06-21 23:51:05
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
  height: '40px',
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

export const PAPER_WIDTH = 210;
const PAPER_HEIGHT = 297;
const PAPER_PADDING_TOP = 20;
const PAPER_PADDING_BOTTOM = 10;

export const headerPicHeight = 70;
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
export const coverWidth = plateWidth;
export const coverHeight = 36;
const coverMarginBlockStart = 1;
const coverMarginBlockEnd = 0.4;
const textIndent = 2;

/** 展示菜单生成效果的组件 */
const MenuPrinter: React.FC<MenuPrinterProps> = React.memo(function MenuPrinter ({
  data,
}) {
  const doc = new jsPDF();

  doc.setFont('simhei');

  let y = 0;

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
    const dy = PAPER_HEIGHT - y - titleLineHeight - grp.plates.slice(0, 2).reduce<number>((prev, p) => {
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
      y = PAPER_PADDING_TOP;
    }
    // 标题背景
    // doc.setDrawColor(0);
    // doc.setFillColor(3, 3, 3);
    // doc.rect(titleMarginInline, y, 100, titleLineHeight, "F");
    doc.addImage(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAecAAAAvCAYAAADZwQI5AAAAAXNSR0IArs4c6QAAHF1JREFUeF7tnQtvHbcOhOv2///lptgCNMbjeVDHjh/xXuCiyVmtRFIUv6FO4jw9PT39+sv879evX389PT39//T69fW/6/f8OX/G43H6eRfn4Od///33X//+++/z2jOfWwdtVGOUe+iPm1/57OyeNVRseH01R5rX2Xr5esVq/J9f4++vtfnzf/7553kvr7Hu/9d7s+ez1vwe1533Z7z6L66BNuH8M0atybYov9gPNbeaJ8UAbXI2jC1qvdmL7RocS7WXaR3ea1xfPUt2nfiz3Q+Vr7xO2iPOHR7rzoKKK+ckjsE6otbAz/BMvEcucDzcPuCZVGfKxVH5o86eqpv3Zx8XgYu8vyahE0RO4TEJhXMymBk6DLh5jnOdCAYVRvYD15h10E6eA4sdv3uNZZuTj7geroP74eK+KfY8hqHp4K7gqOZ6xIZZ8/LLiQk1bypQqSCPz1g0U0Fv65zCFtdSBb3BkUWQKsJuDoZGgtEJiDciyEHKgSHFPQG5wbDZevJ+yyEFuEf2hudROdzyRj3n/HNiTdXuj0PSvdJE4Gk659YRtpA56I0CZcA6MClAbmA1YJyxqTvljpjXTHM5+Lo52E8lhJI9HDeEAxd+fqYOuQJZOsipG1agwAOPRWWg7N4ZWG/gk6DD/nHxxfkdaNuYTUFvc5wU8vcYm2y+9gnjP+vh566wY36qYs9gcfmbcrXlsQJ7g32CWxNRmxzFPNza4m5mkiB0eZY6+w3YW72/n//+CMjOOV05K3iimSdwTO7hPFMk1Phr3HUFjkWC4crvKSGB6ykgqivuWWfmHyGi/ss2NTGUbEyAVd2xAiMXjyms7lBvDjQWZyzwqTjhvAm6rcC5LsCB7b275w2Muaina8ckHHA/OX7Yaauue95NwGeQn8QqwZhzaJsXLPJO5znZm02e4RiMlTt76rxyjNs5SONxL9v5V/nCPv9+7NwrbCLwf+fsvltFEDtgOSApYCeD1He1rfudtU/EAUO82aSgj3HBIqpEAkJZdd1KFKir8PksHT4uAlyU+BAr4KpCzAUfDzN3765YMWzUOsp+ZeNJoeJ1kwBIRd91Na6YM4hx7u1cG1txjAO6AvHGhg2klchTxV7lbcsBlWcqv1yOOBHT4pSEC76rcl+tmeLBtk8j4sQmi2eMK++FAr6KFfu7Acc95vdH4PlaGyHifu3gkq6001wKTDOeAejgzaJhA+rWOaNdzsZZpwkbHJdArETAjMcYpoKjDnoCnoMuFwbVEau1GCau+KoC57qz8VcVkNSppDW4qPKVuiqmaIcTBwrUrjtGfzZ+cBeshEQb48DCtjR4bcTRBgwuXnM+Z44E8QZgBS8VOwfVTUwbzFvcU7zx1sAB28W6xc3F4fdj515hEwELZwdJnDR1u/MsXQdfyYHjGIoJfGMHzsHAZMCjT/xs5mH/GP5qPQ70ydcCbZNwLgQtgpA/38CUCwYf1FYY3cGfPwk+BVzZhsWdxzk71OequDewbAppGsMCBIs6FnJnm5o7iRjnz3RYuE8490lc0VbuzNg/5Rd/luZw+5vihd1k2nMH0k0smohyZ8/FgwUg7+NW4LhxKg/TGWniF+tcq0n384+JwIvvnBmUCpwIwEk4hB4CdsbyZwxhBzfX4SY7GbpjG9uqhAADGkHs1kTfeW0lUFz88HM8KHhbsYFu68K4mPMhT0XlkY4aCwau1QDIdmARxILFRYfB0MDXYM7gSuMfAccWVgleLpYKOCke27hyDFR3t7VXAVXZoYCPwqHFMYHbQa11qgh9BW+eNwE1QZjPdBIS7fynffkY5NyrbCPwP5wVDBTMuFNOIFRdNRrlvk9moPM7DoBunPocP0M/FTidH48IF/TNfa+MguAaj1d86mApmGKh4KKBRcrBvgENC0BT6wwOp+Dbmg7yGFMUHipWDFrM+5P1G9CT8FB+JDhwQWcgNJHjoIU+MIQ20Gm52GDJObqJaQP+BnApHm3fMC4Nci2fXC7yvuD+z9cvGzHmYqHeRXG1Bcc97vdH4NW1NsNxYDGg4OcJwq3bZDDyNTYWT4asg5iDsVrLfZa+k8Y4zPsMWtcx8+fsH3bJ84zhvOmeWwHadseqgLa5NzC4xlzX30p4NOXfCmgqPtzhKQix/a0I4/htF4g2slji9VSRdQIHxYmCHYN+4+u11kAhxYLHpX1sMVX+cefMAlHN2da5/HcdNedRgi3GFePuPldnxO07nsEkPjgPcb4UB/Tz9+PmXuEkAi/gPOBB6DDAcEy7XmaQ87sMoI0A2Di37XbTd8PJbyUAUCwouOM7aeyM4zkYqHhQVYG/PmvqHYt5K7yq2Kv3XSevoMnFZgOqVNhUjHD8tkg1AeKK5AZ2bt/YTvzunuOMfrQ9VkUfoZT2dWx1oN+CzcVT7X+zl31vwiH5sMkl9b6LOe/t2OpsSPO4s7nJveazmmNTV+8xHxuB52ttBGWD6sCFx7mrXnWFixDCtVkYbLrv0yt01xmnzr3ZwT448LvtVd33zNkKMBeZ1Bm7sQxGhgV3KgpE265e+eXA2bpEZ2cSHg1ursg6+CpRgAUS4dY6QAfCDUiUzxzXDVianxuoOHtbR32S62ofG5hQJPK+4bXxJkdQ5Kj83YA0iSPcT7xlaoJz/GqxQPs+Fjv3apsIxM6ZAZqgjWMH3gjaBH91navgzWtcv3ff3TaxkYLD9qDf6hn7i3Mz8CcmYzsKHRU31zHzoT4BI451xXBTJBWwuSC17mrbufE4B78pmLP/rUAlEYL7rsQLr/EexVgV+Wbj+HzlGv/cdAcNjhMWdAedmcvtqRMeCtQIyd/x/GTfnXja2Mjr4NnC/Eggx7jyrxm0aqwSUycCagOKe8zHR+DFHwhL33kiCDHpXLfJ3ewW7BiCDdwfucJu1/EDySvB5x/gSP7gfEoU4GcJ5Az1VLQeeZZAyc/m965zvT4/AXsCFwJkIwpat+GAxHO7eCR7NsXYdTYulgzKDRRa96QKtsqZrRhwMd+CZdZOOeO6w1m75UYCF+dfyuu23iZm7Xy687DtelOOOBHlfP547NwrbiLw4ieEIXTn5XTdygtsukSE/ByC+UyBa9sZ41zKLpzb+eQg6q6o3fX4tdb8tDCO6SaeOIa7UwcHPpBOTbciuX2O83PX3kCsuotWzLgYcRwU4LiIJji29U8KfwJjA8ym6DpbGzQasFVu8Zy4t0nspXidiISNT22M8sEJIiV6kohTz9IeK1sx7iyCrrn4ur3lcRMemGMbSNxjPicCr661GZ7YTU/ibL7jRSg5wDJQFQTTd70IdRYTKpwN/q2jVuIF11ViA+M5Y5OQQJ8SMLZFXoGwdZAsCBq42vMNJCcmrbvk4uVg9mgB2/rS4t+AkfxFH9+6zhYGbp3mh4NwEmhOAKp3WAygPW2PHxUxzvaNT5iPDG6MlYIw1hcXI/687U8Te5+DnXvVTQTkTwhL3wHzpAw0hiQmofsuV8GbwauulR3cnU04ZxICDMhrrBIpczDc1bcSM84vNT8eRCzmrvNIUG1F3hUyLDAO6s6eZic+57m56OPz6SYaSB3IUwFlMDaItjVScWT7ExRULqi5OU6q4Kd1N3mSIKWeTQ5NB3gClCQanK+bmI+dmxim63aXHy4O7Hsbh3Zu476N2QYQ95jPi4CFM4JPdcoME/7edRIJ/zEIdz2sgDVJrK7K3XUyz7MJq7pmRqjOHAMEt3byzdnFMbvWdYWAi0kDE4JaFSJ3HYfzujWvz+cPHrUrPF4HxzOA2aeJeQMGznMCU55fxcTFGYusK/Tsa/PjWkvFp9mghE3zBQt9s4sBwUBz76OIYpCyqOE13sO+JBpdzBiAs8/ux9I2oZPEG66lzhqDfCsEWXwqQYD1fVMn7zEfH4Hn75x5sx7pVE/MT2DCedy1+owZoCHMEa7q1zy/Gz9zzvhNR44gVsLCxYhFAndKfOAanPEg85/gVRBMoJxCj+Bz3Ykq1A5eJ8VTFUH8TIHQ2ag+byIDwbkRO1ufVQFue6uKLcLY7QHmlJsDP3cxbTYz4NCfBF0nAvh9t+8NSriHeD6ckElnAs+Ci4d7f/w8EWInucxjWVic1Ol77OdF4NUfCHNA2kDFXRUjOHl+nldBm4HngNzgyUCfefi/OA7BjLa7a+7UiStwq3i04pyKExdmLtpcVNTztj6Dx41vRbwVnPScuzI1thV7B1AH6gQdZyvbkMDJIiiJFwfaBD+2sXXMDkAqrilmDMWNXxsBtd2PjZ8tF1Mutzxz4oTj4PJRiY7x6VSItfr7eSi6V+YIPF9rq6trBpOCrAKi+wwXZ8DiWlMU1PpoA4/jOZpP+L67pk92IWxVauGcCuzKTwavOphT7NrhbpBtz7kAOPBz8dkU302nyvOoTqPNM8+5kPM1KxffjbDgMarT3ABk8mAjcpw/KRfGzhYrzj3M2ZYrDPIGDQUsjAN3s0508DrO1y1AN+LmBLYqh+e79yQIGqi3Nqg1bgx+jwi8+nvODnjJHXd9y3A6AZSD3dinvuNG4LMQSPNxt4vQbZ18EgRqnvmMY9EK9KY4IrQVXBRccZy63pufgY1dXbIFi2OD9hYaDFIsblx0p6PedKEMFAe4Zqcq/A7UCcAnNs88DoLp8+Y3Pld5uQVHEjgqT+YscR7yz2F39jXxoZ5jvih7kw8qX5JIcjB+JJ5KlLj84fz8Hmi6rbTfOTuYTbK276Qd1DaQbxBXMOV53R/cQpjiOgqaOOfmO3K3phIpGzg7mDIo+XA3kLsixaB2gFcdTir4rcCN/W0cr8vjN++nOZy/uFcY25MCyUDheHFH7ADk9ijdBDjoKDG2FV4skEYYJsCNjakrVuszXBqEW/47IewgqfZmK1rSDQLGQYk5XiPNlcQaznMj7/tE4MW/54zgmg3dfIfKkGOoze9xzvm1A+D1nK/H3TWxArODn5qTbWlgd9ubvnPHd3A9fGdTVBQcUmHmApDAigecVf41jyuKqltNBbABQIkP984WyGyPEzQsFJxwUGDeAIr9GPsTcNSeJQi2PGoxc8/VPqe5Gqgxx9rcDK8EI9wzF1e3r04c8N46weDyouUvChcXU/4c31FiCddMNfr74OpnWfriO2cGiPvO1nXNm89VeNN3w9d41ykrGM74BP+tDe26mxNe+dF8Y+HSCqsDF19pcXfC76l1XIHggqNs2MDFKX+2VQFsU7xYUKSCqIqo62QcUF0MZ8+bCGl77cDd4MPg2K7j4u6Elvp84qpsSDnSYImxYLHC0NrCLeXZSe5g3qkreIZkyrMWh00uuv3/WWj7/t4+d86b740T8LbdplsHQ5mAxtfLcxBVV93Gjj/cTaMgQHiy7SxmnDBwduB4Ljhc5Br8sJNwRVMpaQfaVtA3xasV4w28HND5Xe6slFiZ/VJi4FQ4uAKo7HCQnX1S4kcBPomY7Ro8B/vR8mwDDwdHBdXTHFFzc8yvddJ+os9O0DUfmqBUQFZzun1LIkedGyfYcM3vj6uf5YH8ISQIjU136uB2JZGC9iTMhHozxo1lIF5rzk/s4mdOQCj7XRokkCt/XSy5K+fDjsVFFRrsJLHIu8I0Y9rfecaDr7pVZ4sqcpsCl6CSOrbTrscVr20RVf45QZD8VoDCuVlUOD8bVBTw8dxNnqgY854oEDlxMvPONWsaxz6cgjrtSRJ1/EzlhrPF7S1+3gQOx1zFSNmozmYSyZzbPwtt39/bF985c4fHsGkdIIZjElDBXa2D725hyR02Q5+Bjt01+rbp5hn0bG9ae8a6eHJxcAdOfa4AioB2HSQW5wQHfD/Z1YC0AS3GgddS3ZGyJ0FYQUfZrT5rBRfnHjBxcVS/d/s38WrAesv7yT4X2xRz3uMEuATPlv8pTxzwT/IHz0/zt/m8PRet028xSefr+2PqZ3rw4oeQJHgw6Fy41NUvghoh5q6vXbeeAInPttfiDtDJ13aTkMQIzouHlg8wd818MBEEDZgI19RNbQ7/jMFO6rQAO19UQdwUNixKClSukDOok//XvAhcZ5daSwmv9D7a4To8FlNJYJwWffah2cBQmPcdtLZg5RxT8NnO1WDrchJ9SfBrIudknhZ/ZUfr8n8m2r6/1/Faew696zjZfQXmK3H4n09MnaqDG9sySYo2JCirceyXgjKOQWHhAO6uzkc8zHupqJ2AcgqPghQWJQQXF3dVnK7xrVtMoHVzNrCNH1icnb1byHHxbN0mihAHPhZQs68bqKj95XVm/gagjchwcTrZvwSnBBQUNs5H3F8nTlwcHunANzHl/GPAuvPmxIkDeDtj7byo9TB3VJ38/tj6GR7EzlkB6NpsBhZ/fzogUmNTsrR5+N1Nh51gycBGAYBrOYg7mI/fTUBsiyN2v1yM+ZmCQ4NNEgOqi8eCgaDD7xmVaGDIqmLN31WmQrotsm8BGL6rAJXAl6CFIoQLv/NL+aHeTfBnYZI6Y+Xb5hahxRv9exRODEfeG16jiQt3RlwM+POUB1swb+Zo+Tbnbsb9DIz9mV4+/4SwcW+SuF1PI3gbNFVHm8CqoDfAT3Y2WCJ8OXlVN+8+Q/imMZgySngw5FJHpwquKmwKpqqQcYfC17YIfV67XaNt4KCESbqCRbCrYsf2qiLG0HBgemuRdN1igxKDloGC9m5sTDFTNxNOpLm1FIRVTBkYLe6P5JfLCRaMSYi6ePHc7ZwqwYSfuXjyvNs95jrCNfLPRNef79WrPxCGAGMIMYQbfBjKDo6tY1YqcOZ2IkJ1zE2AKOiqeLTkT8IGY9YKhbsidZ+j+sdCw+Bq3YoqPviZ6kIU+NCGBia2NxUmV+gYXq3Is5BpEHKCYuLRxEUSDAiwrR/KHhZduCbuwSMCysFr7N0ASOVOsuVROzEfcU0FzpM8Ueeq+a3i3t5xYuMkR/98fP3ZHsp/+OJymeHHYFVhQbgxuBXYG7x5jZmjfa+7EREO+E6cvDUN2FfV6aVuVRUpp+C5K9p2SWn9y3/+a1hcKFxHlAoydpkO+qlTacBp3ZDqRhNkHWC3oG9wakWbRVASeE3gjCBIYqvBvgnM5i/vj4s9ipcmSt4jJimv+BnncPNZ7SHOmcTzVly8tV7d739+BF79hDAGm7uOVaarPzzlPkPQOlAq2LM96vfz3hbuM25z/d6EAa6JsWQ7VTF3Bd51racwTwWOCxoXiGbv+Nq68gZLLGybQr0FqRIOLR4JbtzZJAGRfMI1WuyaPe75SeEfvxogOHbNtravHM8G2EdixXFgm/irHYwFnmWOUcpBBrUTsE4MbPZOvfv5aLkteGsE5M/WRljNoWPI4ucMdAc7B8vrc9dFJwexu1ewR5uTGOB5+D0lMNBm9T6up+LDB1+pb1egWmGawsnv8yFunbJ7vinEXJTeAkJXuCYOyZ55V9lzAgQnKtr8aOMp8HDN2YsWe7SHfW7vunio24UGT9zvBq/t3rj4jV9NzJ2AUp0dJ1weBSiugec/iax0jvC9t4Lhfv/zI1D/PecETfdd8SQJuscdJwOcv6e9kjBBcd6fcQhAtxaHW3XKSlgMiHFNtXUqVkrEpMLGB5YPvgMuf85QaGu64s8dc4PUW0DZQLcp4q2DnTk2Asetp+xs4HBxOwWK2ke2ZwML9E3dipwKgwZ+JbBSF5nyfLNWy3eXB2ynEiYoWhmI6hylPXZ2nuwhr/n5WLkteI8IvPp7zghWB0eGLv5+kt6B++Q5AjfBUHXQDv5KOCj48nfuCf7qqtut04oGF4M5eOqA46Hk53xgEVpcmJsaRxvGV+4ilBjAwrWFFxfNk45RCRR3VYljW7FvQFfgUTBWezR52sQCAvg9BFLzmZ+fCKeWi04YYJydjwramL8KpunMnYiGJNbUGToRHykfU+yVv+8BhnuOz4/Ai7/nzOZcCZMg5cxXYGagK/Cm7nreZ7izMGhQxXnS98cI9ylUJ9fX7saBD7HqTB3UXBfLBzv9/GwHgQZvV5hSUXm0Y1AF2IGN108wV8IHRZTriNJ7s5+YzxjLUwg6+CjANPEzz1NMmn1q3x10ElA36yhhhuLFiST0M62jniWAnvjJ4qnZlJ63fW0g/3ys3Ba8RwSe4cwgvhJzILv57laBVV1VX0a7sVjg0ve+YysWVoSpEhUMWLTDQTd15PO+soE3hrtN1SGozlOpcS7SrvC67oXXxqJy/Xr+yTsEVSoGJzBJxXsD5BMQI1Q2XambOwFBxYgBwIWWIe6gqzqiUz843ko0OOExAg/t51xRtm9yZebhWJ10vTyHOwdqP5wIw3idCKzNGXCxSzFFH5PAwlx/Dyjcc3yNCMhrbQQZQ61d4XLn6t5XQETQue+DlVBwMMTPWSgoWG+Fg1uPbww4VqqYcRFoBdhBc+YeUeXGtfnRRhyb3uMCqDogB+Z593T+TUHkmDjfsLgl4LCtyuYtwFTMlKBwcVFwUiBVIEQbne8MBhYZbq2NyHKCwMV+kyNORKXP3f5d76S4uzxKcXXxSza4WCoRgaLva6DltuKtEbB/z5nBdm2+u3aesQqADHqcdxKqddjuuYLkfDb2JghfBwP/eUmEs7oed8IjiQPsmvnwts4jAct1QarAY7FRYkDZ4Wx1UOGOaVt0tuNSoRqblM0NghsguAKvwOdimYRBEgebNd5rjMud5NMWYgmSm9xRQHId8DYec0uk1nd7guJ3u07qejdzpPzAZ2+Fwf3+14rA81+lch2p6gaxGCLQnGvqiprhyfPwuvOcYeuunrcgxXmTX1uBoACPgHDFzB1gLkAJrhuYc6HF+TZg4SKJvx8RcMVKzcugTKCfIjhzbgsUCpEkOtTam0KZYL+9aVCgOYEXg55jk/xIMWdxk2LE+z6/f0Rsob3z/qytAJwAie/zmUrnowkTjkWaK+W5i08CuBMmuM7XwsptzXtE4MW19kzorpR5QQXQDazVOji3A/McIAbqvDvA53H4e+XDPG/X0s5fFg7oHxc8BQwGyvYdBVouMqroMDg3RbkVX9fFsI0KHPzZtvBtQMBj0Fcsbq6ot84wPd8WXJcTSgiNzewHroXCxokbFReGPhf/JHxwviQAmghx7yKsHxENKQ8ndnjLhX/2Ivmj8lkJFxZuSsDi3jaRif68BwjuOb5eBF79wxcIOoao6oAnodSVd+t+GWo8h+uKGX4DZUzumRufsW/qtkB1yO46X13jszBwxTt9PnNwgeAC7Ir65ef8gZ7WLSB0N90DQpgLLQOO4YexQYHQip/y80RQJEGgCqkq5EoIMbw41gwsBWuMWSrICk5JnKhnToBsYsAwYNi4GLtYciycLy1PGhw3+d/yj8+dEwdq/5wIcmdFiSwVA86tr4eW26K3RuDVTwhzcMKFsMgiBHGM+s5WwZ7nUuBN7zHAt91vAvkAXf2X44CAV7Yw/BxQT5QyHlYEqgKI6xi4IKsCtFkHIcmFUgFUAQoh7/zhdVIcU8HegmhbgFPxT/G43sNOze1TA8cJ0BUolNg6ESfoY9tbFmvsW9u3BmL+DjmJF44b+9FymcWKE6otT/F5A7kTqW+FwP3+14yA/fGdCXoKvK4LdYBLImASXYF2wojzMtAZvAz3Nr51z66jH5vQxrElFXEskK5IuIPJAE2HPRUKLFZb4LSupBVTtnXiugFGK4YJaqqwpk6zrZUEUhIDrntye91A3PaD/d7ucxMOIzQ2Yq7ZoESYs1OdFRaEvHdtfdxLPpcuDpv8UHngbHXnVJ2nr4mV26r3iMB/sq3eRm1EM9MAAAAASUVORK5CYII=',
      'PNG',
      titleMarginInline,
      y,
      178,
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
        + (p.pic ? (
          coverMarginBlockStart + coverHeight + coverMarginBlockEnd
        ) : 0)
        + plateNameLineHeight
        // + (p.describe ? plateNameLineHeight * 0.85 : 0)
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
