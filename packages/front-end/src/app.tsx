/*
 * @Author: Kanata You 
 * @Date: 2022-06-19 17:30:10 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-06-22 23:58:40
 */

import React from 'react';
import styled from 'styled-components';

import MenuPrinter from '@components/menu-printer';
import Menu from '@utils/menu';
import MenuForm from '@components/menu-form';
import { Button } from 'antd';


const AppBody = styled.main({
  width: '100vw',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'stretch',
  backgroundColor: 'rgb(225,225,225)',
  color: 'rgb(20,20,20)',
});

const App: React.FC = React.memo(function App () {
  const [menu, setMenu] = React.useState<Menu>({
    headerPic: '',
    // groups: [],
    groups: new Array<0>(4).fill(0).map(() => ({
      label: '',
      plates: new Array<0>(Math.floor(Math.random() * 10) + 2).fill(0).map(_ => ({
        name: '',
        price: Math.floor(Math.random() * 120) * 50 + 1200,
      }))
    })),
    // groups: [{
    //   label: '荤菜',
    //   plates: [{
    //     name: '炸鸡',
    //     price: 1800
    //   }, {
    //     name: '烤鱼',
    //     price: 2400,
    //     preference: {
    //       labels: ['五香', '麻辣']
    //     }
    //   }, {
    //     name: '薯条',
    //     price: 850
    //   }, {
    //     name: '汤',
    //     price: 500
    //   }, {
    //     name: '不知道',
    //     price: 1500
    //   }]
    // }, {
    //   label: '什么',
    //   plates: [{
    //     name: '薯条',
    //     price: 850
    //   }, {
    //     name: '汤',
    //     price: 500
    //   }]
    // }]
  });

  const actionsRef = React.useRef<{
    forward: (d: Readonly<Menu>) => Partial<Menu>;
    backward: (d: Readonly<Menu>) => Partial<Menu>;
  }[]>([]);
  
  const actionFlagRef = React.useRef<number>(0);

  const actionForward = React.useCallback(() => {
    if (actionFlagRef.current >= actionsRef.current.length) {
      actionFlagRef.current = actionsRef.current.length;

      return;
    }

    // 前进一步
    const next = {
      ...menu,
      ...actionsRef.current[actionFlagRef.current]?.forward(menu),
    };
    actionFlagRef.current += 1;
    setMenu(next);
  }, [menu, setMenu, actionsRef, actionFlagRef]);

  const actionBackward = React.useCallback(() => {
    if (actionFlagRef.current <= 0) {
      actionFlagRef.current = 0;

      return;
    }

    // 后退一步
    actionFlagRef.current -= 1;
    const next = {
      ...menu,
      ...actionsRef.current[actionFlagRef.current]?.backward(menu),
    };
    setMenu(next);
  }, [menu, setMenu, actionsRef, actionFlagRef]);

  const pushAction = React.useCallback(
    (forward: (d: Readonly<Menu>) => Partial<Menu>, backward: (d: Readonly<Menu>) => Partial<Menu>) => {
      // 清除被撤销的操作记录
      actionsRef.current = actionsRef.current.slice(0, actionFlagRef.current);
      // 增加新的记录
      actionsRef.current.push({ forward, backward });
      // 最多记录 20 条
      actionsRef.current = actionsRef.current.slice(actionsRef.current.length - 20);
      // 立即执行
      actionForward();
    },
    [actionsRef, actionForward]
  );

  return (
    <AppBody>
      {/* form */}
      <MenuForm
        data={menu}
        pushAction={pushAction}
      />
      <MenuPrinter
        data={menu}
      />
      <Button
        type="primary"
        disabled={actionFlagRef.current <= 0}
        style={{
          position: 'fixed',
          right: '7em',
          bottom: '2em',
          zIndex: 99,
        }}
        onClick={actionBackward}
      >
        撤销
      </Button>
      <Button
        type="primary"
        disabled={actionFlagRef.current >= actionsRef.current.length}
        style={{
          position: 'fixed',
          right: '2em',
          bottom: '2em',
          zIndex: 99,
        }}
        onClick={actionForward}
      >
        重做
      </Button>
    </AppBody>
  );
});

export default App;
