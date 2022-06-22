/*
 * @Author: Kanata You 
 * @Date: 2022-06-21 19:14:50 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-06-22 23:47:47
 */

import React from 'react';
import styled from 'styled-components';
import { Button, Input, Popconfirm, Checkbox, Collapse } from 'antd';

import Menu, { Plate, PlateGroup } from '@utils/menu';
import CoverPic from './cover-pic';

import 'antd/dist/antd.css';

const { Panel } = Collapse;


const GroupListContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'center',
  color: '#4a4a4a',
  paddingBlock: '1.2rem',
  overflowX: 'hidden',
  '> label': {
    width: '100%',
    paddingBlock: '0.8em',
    fontSize: '1.05rem',
    fontWeight: 550,
  },
  '> div': {
    flexGrow: 1,
    flexShrink: 1,
    display: 'flex',
    flexDirection: 'column',
  },
});

const PlateItem = styled.div({
  flexGrow: 1,
  flexShrink: 1,
  marginBlock: '0.4em',
  border: '1px solid #aaa',
  borderRadius: '0.2em',
  paddingBlock: '0.3em',
  paddingInline: '0.7em',
  overflow: 'hidden',
  '> div': {
    marginBlock: '0.2em',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    '> label': {
      marginInlineEnd: '2em',
    },
  },
});

interface PlateEditorProps {
  idx: number;
  data: Readonly<Plate>;
  onChange: (value: Readonly<Plate>) => void;
  onRemove: () => void;
}

const PlateEditor: React.FC<PlateEditorProps> = React.memo(function PlateEditor ({
  idx,
  data,
  onChange,
  onRemove,
}) {
  return (
    <PlateItem>
      <div>
        <label>菜品名称</label>
        <Input
          placeholder={`菜品${idx + 1}`}
          value={data.name}
          status={data.name.trim().length === 0 ? 'error' : ''}
          onChange={e => onChange({
            ...data,
            name: e.target.value
          })}
        />
      </div>
      <div>
        <label>菜品图片（可选）</label>
        <CoverPic
          dataUrl={data.pic ?? ''}
          setDataUrl={d => onChange({
            ...data,
            pic: d || undefined
          })}
        />
        {data.pic && (
          <Popconfirm
            title="移除这张图片吗？"
            onConfirm={() => onChange({
              ...data,
              pic: undefined
            })}
            okText={'是'}
            cancelText={'否'}
          >
            <Button>
              重置
            </Button>
          </Popconfirm>
        )}
      </div>
      {/* <div>
        <label>菜品描述（可选）</label>
        <Input
          value={data.describe ?? ''}
          onChange={e => onChange({
            ...data,
            describe: e.target.value || undefined
          })}
        />
      </div> */}
      <div>
        <label>菜品价格（整数，单位：分）</label>
        <Input
          value={data.price}
          status={data.price <= 0 ? 'error' : ''}
          onChange={e => {
            const isValid = /^[1-9][0-9]*$/.test(e.target.value);

            if (isValid) {
              onChange({
                ...data,
                price: parseInt(e.target.value)
              });
            }
          }}
        />
      </div>
      <div>
        <label>菜品口味选择（可选）</label>
        <div>
          {
            data.preference?.labels.map((p, i) => (
              <div key={i}>
                <Input
                  value={p}
                  status={p.trim().length === 0 ? 'error' : ''}
                  onChange={e => onChange({
                    ...data,
                    preference: {
                      labels: [
                        ...data.preference!.labels.slice(0, i),
                        e.target.value.trim(),
                        ...data.preference!.labels.slice(i + 1),
                      ],
                      supposedIdx: data.preference?.supposedIdx
                    }
                  })}
                />
                <Checkbox
                  checked={data.preference?.supposedIdx === i}
                  onChange={e => onChange({
                    ...data,
                    preference: {
                      labels: data.preference!.labels,
                      supposedIdx: e.target.checked ? i : undefined
                    }
                  })}
                >
                  {'推荐'}
                </Checkbox>
                <Popconfirm
                  title="移除这个选项吗？"
                  onConfirm={() => onChange({
                    ...data,
                    preference: {
                      labels: [
                        ...data.preference!.labels.slice(0, i),
                        ...data.preference!.labels.slice(i + 1),
                      ],
                      supposedIdx: data.preference?.supposedIdx
                    }
                  })}
                  okText={'是'}
                  cancelText={'否'}
                >
                  <Button danger>
                    移除
                  </Button>
                </Popconfirm>
              </div>
            ))
          }
          <div>
            <Button
              onClick={() => onChange({
                ...data,
                preference: {
                  labels: [
                    ...data.preference?.labels ?? [],
                    '(未定义)'
                  ],
                  supposedIdx: data.preference?.supposedIdx
                }
              })}
            >
              新增
            </Button>
          </div>
        </div>
      </div>
      <div>
        <Popconfirm
          title="确认删除这个菜品吗？"
          onConfirm={onRemove}
          okText={'是'}
          cancelText={'否'}
        >
          <Button danger>
            删除
          </Button>
        </Popconfirm>
      </div>
    </PlateItem>
  );
});

const GroupItem = styled.div({
  flexGrow: 1,
  flexShrink: 1,
  display: 'flex',
  flexDirection: 'column',
  marginBlock: '0.6em',
  border: '1px solid #888',
  borderRadius: '0.2em',
  paddingBlock: '0.7em',
  paddingInline: '1em',
  '> div': {
    flexGrow: 1,
    flexShrink: 1,
    display: 'flex',
    flexDirection: 'column',
  },
});

interface GroupEditorProps {
  label: string;
  setLabel: (value: string) => void;
  plates: Readonly<Plate[]>;
  setPlate: (idx: number, value: Readonly<Plate>) => void;
  addPlate: (value: Readonly<Plate>) => void;
  delPlate: (idx: number) => void;
  onRemove: () => void;
}

const GroupEditor: React.FC<GroupEditorProps> = React.memo(function GroupEditor ({
  label,
  setLabel,
  plates,
  setPlate,
  addPlate,
  delPlate,
  onRemove,
}) {
  return (
    <GroupItem>
      <div>
        <label>
          分组名称
        </label>
        <Input
          placeholder="类别标题"
          value={label}
          onChange={e => setLabel(e.target.value)}
        />
      </div>
      <div>
        {
          plates.map((p, i) => (
            <PlateEditor
              key={i}
              idx={i}
              data={p}
              onChange={s => setPlate(i, s)}
              onRemove={() => delPlate(i)}
            />
          ))
        }
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end'
          }}
        >
          <Button
            type="primary"
            onClick={() => addPlate({
              name: '(新菜品)',
              price: 990,
            })}
          >
            新菜品
          </Button>
          <Popconfirm
            title="删除这个分组和所有菜品吗？"
            onConfirm={onRemove}
            okText={'是'}
            cancelText={'否'}
          >
            <Button danger>
              删除
            </Button>
          </Popconfirm>
        </div>
      </div>
    </GroupItem>
  );
});

export interface GroupListProps {
  data: Readonly<PlateGroup[]>;
  setData: (
    forward: (d: Readonly<Menu>) => Partial<Menu>,
    backward: (d: Readonly<Menu>) => Partial<Menu>
  ) => void;
  setGroupOrder: (target: number, nextIdx: number) => void;
}

const GroupList: React.FC<GroupListProps> = React.memo(function GroupList ({
  data,
  setData,
  setGroupOrder,
}) {
  const [dragging, setDragging] = React.useState<number | null>(null);

  return (
    <GroupListContainer>
      <label>
        菜单内容
      </label>
      <Collapse accordion>
      {
        data.map((grp, i) => {
          const label = grp.label;

          const setLabel = (value: string) => {
            setData(
              s => ({
                ...s,
                groups: [
                  ...s.groups.slice(0, i),
                  {
                    ...s.groups[i],
                    label: value
                  } as PlateGroup,
                  ...s.groups.slice(i + 1),
                ]
              }),
              s => ({
                ...s,
                groups: [
                  ...s.groups.slice(0, i),
                  {
                    ...s.groups[i],
                    label
                  } as PlateGroup,
                  ...s.groups.slice(i + 1),
                ]
              })
            )
          };

          const setPlate = (idx: number, value: Readonly<Plate>) => {
            const origin: Plate = {
              ...grp.plates[idx] as Plate,
              preference: grp.plates[idx]?.preference ? {
                labels: [...grp.plates[idx]!.preference!.labels],
                supposedIdx: grp.plates[idx]?.preference?.supposedIdx
              } : undefined,
              recommendations: grp.plates[idx]?.recommendations ? [
                ...grp.plates[idx]!.recommendations!
              ] : undefined,
            };
            const next: Plate = {
              ...value,
              preference: value.preference ? {
                labels: [...value.preference.labels],
                supposedIdx: value.preference?.supposedIdx
              } : undefined,
              recommendations: value.recommendations ? [
                ...value.recommendations!
              ] : undefined,
            };

            setData(
              s => ({
                ...s,
                groups: [
                  ...s.groups.slice(0, i),
                  {
                    ...s.groups[i],
                    plates: [
                      ...(s.groups[i] as PlateGroup).plates.slice(0, idx),
                      next,
                      ...(s.groups[i] as PlateGroup).plates.slice(idx + 1)
                    ]
                  } as PlateGroup,
                  ...s.groups.slice(i + 1),
                ]
              }),
              s => ({
                ...s,
                groups: [
                  ...s.groups.slice(0, i),
                  {
                    ...s.groups[i],
                    plates: [
                      ...(s.groups[i] as PlateGroup).plates.slice(0, idx),
                      origin,
                      ...(s.groups[i] as PlateGroup).plates.slice(idx + 1)
                    ]
                  } as PlateGroup,
                  ...s.groups.slice(i + 1),
                ]
              })
            );
          };

          const addPlate = (value: Readonly<Plate>) => {
            const next: Plate = {
              ...value,
              preference: value.preference ? {
                labels: [...value.preference.labels],
                supposedIdx: value.preference?.supposedIdx
              } : undefined,
              recommendations: value.recommendations ? [
                ...value.recommendations!
              ] : undefined,
            };

            setData(
              s => ({
                ...s,
                groups: [
                  ...s.groups.slice(0, i),
                  {
                    ...s.groups[i],
                    plates: [
                      ...(s.groups[i] as PlateGroup).plates,
                      next
                    ]
                  } as PlateGroup,
                  ...s.groups.slice(i + 1),
                ]
              }),
              s => ({
                ...s,
                groups: [
                  ...s.groups.slice(0, i),
                  {
                    ...s.groups[i],
                    plates: (s.groups[i] as PlateGroup).plates.slice(0, -1)
                  } as PlateGroup,
                  ...s.groups.slice(i + 1),
                ]
              })
            );
          };

          const delPlate = (idx: number) => {
            const origin: Plate = {
              ...grp.plates[idx] as Plate,
              preference: grp.plates[idx]?.preference ? {
                labels: [...grp.plates[idx]!.preference!.labels],
                supposedIdx: grp.plates[idx]?.preference?.supposedIdx
              } : undefined,
              recommendations: grp.plates[idx]?.recommendations ? [
                ...grp.plates[idx]!.recommendations!
              ] : undefined,
            };

            setData(
              s => ({
                ...s,
                groups: [
                  ...s.groups.slice(0, i),
                  {
                    ...s.groups[i],
                    plates: (s.groups[i] as PlateGroup).plates.slice(0, -1)
                  } as PlateGroup,
                  ...s.groups.slice(i + 1),
                ]
              }),
              s => ({
                ...s,
                groups: [
                  ...s.groups.slice(0, i),
                  {
                    ...s.groups[i],
                    plates: [
                      ...(s.groups[i] as PlateGroup).plates,
                      origin
                    ]
                  } as PlateGroup,
                  ...s.groups.slice(i + 1),
                ]
              })
            );
          };

          return (
            <React.Fragment key={i}>
              {
                typeof dragging === 'number' && (
                  <div
                    style={{
                      backgroundColor: '#8888',
                      cursor: 'grabbing',
                      textAlign: 'center',
                      userSelect: 'none',
                    }}
                    onMouseUp={() => {
                      if (typeof dragging === 'number') {
                        const idx = i > dragging ? i - 1 : i;

                        if (dragging !== idx) {
                          setGroupOrder(dragging, idx);
                        }
                      }
                    }}
                  >
                    移动到这里
                  </div>
                )
              }
              <Panel
                key={`${i}-item`}
                header={label}
                extra={dragging === null && (
                  <span
                    style={{
                      userSelect: 'none',
                      cursor: 'grab',
                    }}
                    onMouseDown={() => {
                      setDragging(i);

                      const cb = () => {
                        setDragging(null);
                        document.body.removeEventListener('mouseup', cb);
                      };

                      document.body.addEventListener('mouseup', cb);
                    }}
                  >
                    移动
                  </span>
                )}
              >
                <GroupEditor
                  key={i}
                  label={label}
                  setLabel={setLabel}
                  plates={grp.plates}
                  setPlate={setPlate}
                  addPlate={addPlate}
                  delPlate={delPlate}
                  onRemove={() => setData(
                    s => ({
                      groups: s.groups.slice(0, -1)
                    }),
                    s => ({
                      groups: [
                        ...s.groups,
                        grp,
                      ]
                    })
                  )}
                />
              </Panel>
            </React.Fragment>
          );
        })
      }
      {
        typeof dragging === 'number' && (
          <div
            style={{
              backgroundColor: '#8888',
              cursor: 'grabbing',
              userSelect: 'none',
              textAlign: 'center',
            }}
            onMouseUp={() => {
              if (typeof dragging === 'number' && dragging !== data.length - 1) {
                setGroupOrder(dragging, data.length - 1);
              }
            }}
          >
            移动到这里
          </div>
        )
      }
      </Collapse>
      <div>
        <Button
          type="primary"
          onClick={() => setData(
            s => ({
              groups: [
                ...s.groups,
                {
                  label: '(新的类别)',
                  plates: [],
                }
              ]
            }),
            s => ({
              groups: s.groups.slice(0, -1)
            })
          )}
        >
          新的分类
        </Button>
      </div>
    </GroupListContainer>
  );
});


export default GroupList;
