/*
 * @Author: Kanata You 
 * @Date: 2022-06-19 20:03:48 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-06-21 23:15:18
 */

import React from 'react';
import styled from 'styled-components';

import openFile from '@utils/open-file';
import asyncEvent from '@utils/async-event';
import { PAPER_WIDTH, headerPicHeight } from '@components/menu-printer';


const HeaderPicContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#4a4a4a',
  paddingBlock: '1.2rem',
  '> label': {
    width: '100%',
    paddingBlock: '0.8em',
    fontSize: '1.05rem',
    fontWeight: 550,
  },
});

const HeaderPicElement = styled.div({
  flexGrow: 0,
  flexShrink: 0,
  position: 'relative',
  width: '40vh',
  height: '25vh',
  overflow: 'hidden',
  color: '#555',
  border: '1px solid',
  userSelect: 'none',
  transform: 'scale(0.97)',
  '&:hover': {
    borderRadius: '12px',
    backgroundColor: '#8883',
    transform: 'scale(1.02)',
  },
  transition: 'color 200ms, border-radius 200ms, transform 200ms',
});

const HeaderPicValue = styled.div<{ data: string | null }>(({ data }) => ({
  display: data ? 'block' : 'none',
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundImage: data ? `url(${data})` : undefined,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center',
  userSelect: 'none',
  pointerEvents: 'none',
}));

const HeaderPicCover = styled.div<{ data: string | null }>(({ data }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  userSelect: 'none',
  cursor: 'pointer',
  outline: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: data ? 0.01 : 0.8,
  backdropFilter: '',
  '&:hover': {
    opacity: 1,
    backgroundColor: '#d2d2d240',
    backdropFilter: 'blur(4px) brightness(1.2)',
  },
  transition: 'opacity 200ms, backdrop-filter 200ms, background-color 200ms',
}));

const ButtonSvg = styled.svg({
  width: '4em',
  height: '4em'
});

const ButtonSvgPath = styled.path({
  stroke: '#4a4a4a',
  strokeWidth: '1px',
  fill: 'none'
});

const ButtonText = styled.span({
  margin: '0.4em 0 0.2em'
});

export interface HeaderPicProps {
  dataUrl: string | null;
  setDataUrl: (url: string) => void;
}

/**
 * ????????????????????????????????????????????????????????????????????????????????????????????????.
 */
const HeaderPic: React.FC<HeaderPicProps> = React.memo(function HeaderPic ({
  dataUrl,
  setDataUrl
}) {
  const buttonRef = React.useRef<HTMLDivElement>();

  React.useEffect(() => {
    buttonRef.current?.blur();
  }, [dataUrl, buttonRef]);

  const handleClick = React.useCallback(
    asyncEvent(async () => {
      const file = await openFile(['image/*']);

      if (file) {
        const url = await new Promise<string>(resolve => {
          const fr = new FileReader();

          fr.readAsDataURL(file);

          fr.onload = () => {
            const u = typeof fr.result === 'string' ? fr.result : '';

            if (!u) {
              return resolve('');
            }

            const img = new Image();
            img.src = u;
            img.onload = () => {
              const [w, h] = [img.width, img.height];
              const cw = w / PAPER_WIDTH;
              const ch = h / headerPicHeight;

              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d')!;
              
              if (ch >= cw) {
                // ???????????????????????????
                const iw = w;
                const ih = w / PAPER_WIDTH * headerPicHeight;
                const oh = 0;
                const ov = (h - ih) / 2;

                canvas.width = iw;
                canvas.height = ih;
                ctx.drawImage(img, oh, ov, iw, ih, 0, 0, iw, ih);
              } else {
                // ???????????????????????????
                const iw = h / headerPicHeight * PAPER_WIDTH;
                const ih = h;
                const oh = (w - iw) / 2;
                const ov = 0;

                canvas.width = iw;
                canvas.height = ih;
                ctx.drawImage(img, oh, ov, iw, ih, 0, 0, iw, ih);
              }
  
              resolve(canvas.toDataURL());
            };
          };
        });
        
        setDataUrl(url);
      }
    }),
    [setDataUrl]
  );

  return (
    <HeaderPicContainer>
      <label>
        ????????????
      </label>
      <HeaderPicElement>
        <HeaderPicValue
          data={dataUrl}
        />
        <HeaderPicCover
          tabIndex={0}
          onClick={handleClick}
          data={dataUrl}
          ref={e => e && (buttonRef.current = e)}
        >
          <ButtonSvg viewBox="0 0 20 20">
            <ButtonSvgPath d="M4,10 H16 M10,4 V16" />
          </ButtonSvg>
          <ButtonText>
            {'????????????'}
          </ButtonText>
        </HeaderPicCover>
      </HeaderPicElement>
    </HeaderPicContainer>
  );
});


export default HeaderPic;
