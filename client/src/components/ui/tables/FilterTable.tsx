import { Button, Form, GetRef, Modal, Table, TableProps } from 'antd'
import React, { useEffect, useState, createContext, useContext, JSX, useRef } from 'react'
import getAllData from '../../../hooks/getAllData'
import { ColumnsType } from 'antd/es/table'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { RootState } from '@/redux/store'
import { closeModal, openModal } from '@/redux/reducers/diaglogReducer'
import type { DragEndEvent, DragOverEvent, UniqueIdentifier } from '@dnd-kit/core'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import CreateUser from '../forms/CreateUser'
import type { FormInstance, InputRef } from 'antd'
import FormModal from '../forms/FormModal'

interface IFilterTable<T> {
  url: string
  columns: ColumnsType<T>
  createMode?: boolean
  handleShowModal?: () => void
}

// type FormInstance<T> = GetRef<typeof Form<T>>

const Row: React.FC<Readonly<RowProps>> = (props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  })

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: 'move',
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  }

  return <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />
}

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string
}

// Drag Column sorting
interface HeaderCellProps extends React.HtmlHTMLAttributes<HTMLTableCellElement> {
  id: string
}

interface BodyCellProps extends React.HtmlHTMLAttributes<HTMLTableCellElement> {
  id: string
}

interface DragIndexState {
  active: UniqueIdentifier
  over: UniqueIdentifier | undefined
  direction?: 'left' | 'right'
}

const DragIndexContext = createContext<DragIndexState>({ active: -1, over: -1 })

const dragActiveStyle = (dragState: DragIndexState, id: string) => {
  const { active, over } = dragState
  let style: React.CSSProperties = {}
  if (active && active === id) {
    style = { backgroundColor: 'gray', opacity: 0.5 }
  } else if (over && id === over && active !== over) {
    style = { borderInlineStart: '1px dashed gray' }
  }
  return style
}

const TableHeaderCell: React.FC<HeaderCellProps> = (props) => {
  const dragState = useContext(DragIndexContext)
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id: props.id })
  const style: React.CSSProperties = {
    ...props.style,
    cursor: 'move',
    ...(isDragging ? { position: 'relative', zIndex: 9999, userSelect: 'none' } : {}),
    ...dragActiveStyle(dragState, props.id),
  }
  return <th {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />
}

const TableBodyCell: React.FC<BodyCellProps> = (props) => {
  const dragState = useContext<DragIndexState>(DragIndexContext)
  return <td {...props} style={{ ...props.style, ...dragActiveStyle(dragState, props.id) }} />
}

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps<T> {
  title: React.ReactNode;
  editable: boolean;
  dataIndex: keyof T;
  record: T;
  handleSave: (record: T) => void;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps<T>>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[{ required: true, message: `${title} is required.` }]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingInlineEnd: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const EditableContext = React.createContext<FormInstance<any> | null>(null)

type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection']

function FilterTable<T extends { key: React.Key }>({ url, columns, createMode, handleShowModal }: IFilterTable<T>) {
  const { data, isLoading, error } = getAllData({ url, limit: 10, order: 'asc' })
  const [dataSource, setDataSource] = useState<any[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [dragIndex, setDragIndex] = useState<DragIndexState>({ active: -1, over: -1 })
  const [columnData, setColumnData] = useState(() =>
    columns.map((e: any, index: number) => ({
      ...e,
      key: `${index}`,
      onHeaderCell: () => ({ id: `${index}` }),
      onCell: () => ({ id: `${index}` }),
    })),
  )
  const { title, modalType, isOpen, pathApi } = useAppSelector((state: RootState) => state.modal.createUser)

  const dispatch = useAppDispatch()

  const [count, setCount] = useState(2);

  const handleDelete = (key: React.Key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
  )

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return

    if (columnData.some((c) => c.key === active.id)) {
      if (active.id !== over?.id) {
        setColumnData((prevState: any) => {
          const activeIndex = prevState.findIndex((i: any) => i.key === active.id)
          const overIndex = prevState.findIndex((i: any) => i.key === over?.id)
          return arrayMove(prevState, activeIndex, overIndex)
        })
      }
    }

    if (dataSource.some((a) => a.key === active.id)) {
      if (active.id !== over?.id) {
        setDataSource((prev) => {
          const activeIndex = prev.findIndex((i) => i.key === active.id)
          const overIndex = prev.findIndex((i) => i.key === over?.id)
          return arrayMove(prev, activeIndex, overIndex)
        })
      }
    }

    setDragIndex({ active: -1, over: -1 })
  }

  const onDragOver = ({ active, over }: DragOverEvent) => {
    console.log('click')
    const activeIndex = columnData.findIndex((i: any) => i?.key === active?.id)
    const overIndex = columnData.findIndex((i: any) => i?.key === over?.id)
    setDragIndex({
      active: active.id,
      over: over?.id,
      direction: overIndex > activeIndex ? 'right' : 'left',
    })
  }

  const handleSelection = (newSelectedRowKeys: React.Key[]) => {
    console.log(`selectedRowKeys changed: `, newSelectedRowKeys)
    setSelectedRowKeys(newSelectedRowKeys)
  }

  const handleFilterandSorter: TableProps<T>['onChange'] = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra)
  }

  const rowSelection: TableRowSelection<T> = {
    selectedRowKeys,
    onChange: handleSelection,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: 'odd',
        text: `Select Odd Row`,
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = []
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return false
            }
            return true
          })
          setSelectedRowKeys(newSelectedRowKeys)
        },
      },
      {
        key: 'even',
        text: 'Select Even Row',
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = []
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            if (index % 2 !== 0) {
              return true
            }
            return false
          })
          setSelectedRowKeys(newSelectedRowKeys)
        },
      },
    ],
  }

  useEffect(() => {
    if (data) {
      const rows = Array.isArray(data.data)
        ? data?.data.map((item: any, index: any) => ({ ...item, key: item.id ?? index }))
        : []
      setDataSource(rows)
    }
  }, [data])

  if (isLoading) {
    return <h2>This website have been loading</h2>
  }

  if (error) {
    return <h2>Error: {error.message}</h2>
  }



  return (
    <div>
      {createMode === true && (
        <>
          <div className="flex justify-end">
            <Button onClick={handleShowModal} type="primary">
              Create
            </Button>
          </div>
          <FormModal<T> title={title} open={isOpen}>
            {modalType === 'createUser' && <CreateUser />}
          </FormModal>
        </>
      )}

      <DndContext
        sensors={sensors}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        collisionDetection={closestCenter}
      >
        <SortableContext
          items={columnData.map((col: any) => col.key)}
          strategy={horizontalListSortingStrategy}
        >
          <SortableContext
            items={dataSource.map((col: any) => col.key)}
            strategy={verticalListSortingStrategy}
          >
            <DragIndexContext.Provider value={dragIndex}>
              <Table<T>
                components={{
                  header: { cell: TableHeaderCell },
                  body: { cell: TableBodyCell, row: Row },
                }}
                rowKey={'key'}
                columns={columnData}
                dataSource={dataSource ?? []}
                rowSelection={rowSelection}
                onChange={handleFilterandSorter}
                showSorterTooltip={{ target: 'sorter-icon' }}
                pagination={{ pageSize: 7 }}
              />
            </DragIndexContext.Provider>
          </SortableContext>
        </SortableContext>
        <DragOverlay>
          <th style={{ backgroundColor: 'gray', padding: 16 }}>
            {
              columnData[columnData.findIndex((col: any) => col.key === dragIndex.active)]
                ?.title as React.ReactNode
            }
          </th>
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default FilterTable
