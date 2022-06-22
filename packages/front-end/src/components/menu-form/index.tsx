/*
 * @Author: Kanata You 
 * @Date: 2022-06-19 17:38:48 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-06-22 23:57:32
 */

import React from 'react';
import styled from 'styled-components';

import type Menu from '@utils/menu';
import HeaderPic from './header-pic';
import GroupList from './group-list';


const FormContainer = styled.section({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  paddingBlock: '4vh',
  paddingInline: '30px',
  width: '400px',
  height: '100vh',
  overflow: 'hidden scroll',
});

const FormElement = styled.article({});

export interface MenuFormProps {
  data: Readonly<Menu>;
  pushAction: (
    forward: (d: Readonly<Menu>) => Partial<Menu>,
    backward: (d: Readonly<Menu>) => Partial<Menu>
  ) => void;
}

/** 表单元素 */
const MenuForm: React.FC<MenuFormProps> = React.memo(function MenuForm ({
  data,
  pushAction
}) {
  /** 修改头图 */
  const setHeaderPic = React.useCallback((dataUrl: string) => {
    const prevPic = data.headerPic;
    
    pushAction(
      () => ({
        headerPic: dataUrl
      }),
      () => ({
        headerPic: prevPic
      })
    );
  }, [data, pushAction]);

  /** 拖拽修改分组顺序 */
  const setGroupOrder = React.useCallback((target: number, nextIdx: number) => {
    const prevIdx = target;

    pushAction(
      ({ groups }) => {
        const tgt = groups[prevIdx];

        if (!tgt) {
          return {};
        }

        const others = [
          ...groups.slice(0, prevIdx),
          ...groups.slice(prevIdx + 1)
        ];
        const next = [
          ...others.slice(0, nextIdx),
          tgt,
          ...others.slice(nextIdx),
        ];

        return {
          groups: next
        };
      },
      ({ groups }) => {
        const tgt = groups[nextIdx];

        if (!tgt) {
          return {};
        }
        
        const others = [
          ...groups.slice(0, nextIdx),
          ...groups.slice(nextIdx + 1)
        ];
        const next = [
          ...others.slice(0, prevIdx),
          tgt,
          ...others.slice(prevIdx),
        ];

        return {
          groups: next
        };
      }
    )
  }, [pushAction]);

  return (
    <FormContainer>
      <FormElement>
        <HeaderPic
          dataUrl={data.headerPic || null}
          setDataUrl={setHeaderPic}
        />
        <GroupList
          data={data.groups}
          setData={pushAction}
          setGroupOrder={setGroupOrder}
        />
      </FormElement>
    </FormContainer>
  );
});


export default MenuForm;
