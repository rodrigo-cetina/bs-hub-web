import { Table, SpinProps, TablePaginationConfig } from 'antd'
import { ExpandableConfig, GetRowKey } from 'rc-table/lib/interface'
import React from 'react'
import './grid.css'

export interface GridProps<RecordType> {
  pagination?: false | TablePaginationConfig
  loading?: boolean | SpinProps
  columns?: any[]
  data?: any[]
  expandable?: ExpandableConfig<RecordType>
  expandedRowKeys?: React.Key[]
  rowKey?: string | GetRowKey<RecordType>
}

function Grid(props: GridProps<any>): JSX.Element{
  
  const {
    pagination,
    loading,
    columns,
    data,
    expandable,
    expandedRowKeys,
    rowKey,
  } = props
    
  return (
    <div className='grid_content'>
      <Table
        locale={{ emptyText : "Informacion no encontrada" }}
        pagination={pagination}
        loading={loading}
        columns={columns}
        dataSource={data}
        expandable={expandable}
        expandedRowKeys={expandedRowKeys}
        rowKey={rowKey}
        
      />
    </div>
  )
}

/**
 * Expandable
 * 
 *  <Grid
 *    data={[]}
 *    columns={[]} //In some column you put a button to expand
 *    expandable={{
        expandedRowRender: (record: Type) => 'Hello world', //Content to be rendered on the row
        rowExpandable: (record: Type) => true,
        showExpandColumn: false, //show or hide the default expand column
      }}
      expandedRowKeys={[]} //Array of keys, _ids per example
      rowKey='_id' //es la key/llave de cada fila
    />
 */

Grid.defaultProps = {
  columns: [],
  data: [],
  pagination: null,
  loading: false,
}

export default Grid