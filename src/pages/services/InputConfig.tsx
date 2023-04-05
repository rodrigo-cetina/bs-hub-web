import { ButtonAnt } from 'components/single/button/Button'
import {Row, Col, Form, Input as AntInput, Menu, Dropdown} from 'antd'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import Modal from 'components/single/Modal/Modal'
import { ChangeArrayItemParams } from './CreateEdit';
import React from 'react'
import { IArrayOrStringOrBooleanRecord, IStringOrBooleanOrArrayRecord } from 'types/Service'
import UserFields from './UserFields'
import './InputConfig.css'

/**
 * @description Muestra un menú con las opciones provenientes de la respuesta
 */
function RenderInputAndMenu ({
  value,
  onChange,
  items,
  label,
}:{
  value?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  items: ItemType[]
  label?: React.ReactNode
}) {

  function getValue():string {
    if(value !== undefined){
      const splitStr = value.split('$')

      if(splitStr[0] === 'entries')
      if(splitStr.length === 2)
      return splitStr[1]

      return value
    }
    return ''
  }

  const menu = (
    <Menu
      items={items}
    />
  )

  if(items.length > 0)
  return (
    <Form.Item
      label={label}
    >
      <Dropdown
        overlay={menu}
      >
        <AntInput
          value={getValue()}
          onChange={onChange}
        />
      </Dropdown>
    </Form.Item>
  )

  return (
    <Form.Item
      label='Valor'
    >
      <AntInput
        value={getValue()}
        onChange={onChange}
      />
    </Form.Item>
  )
}

/**Renderiza el elemento de entrada de configuración */
export function RenderInputConfig ({
    Key,
    value,
    onChangeArrayKey,
    onChangeArrayItem,
    onAddItemToValue,
    onRemoveItem,
    onChange,
    onChangeConfig,
    onChangeIArrayOrStringOrBooleanRecord,
    onAddToIArrayRecord,
    onRemoveFromIArrayRecord,
  }:
  {
    Key: string,
    value?: string | boolean | IStringOrBooleanOrArrayRecord[] | IArrayOrStringOrBooleanRecord,
    onChange?: (e: React.ChangeEvent)=>void,
    onChangeConfig?: ({key, value}:{key: string, value: string | boolean})=>void
    onAddToIArrayRecord?: ({key, elementKey, type}:{
      key: string,
      elementKey: string,
      type: 'string' | 'boolean',
    })=>void,
    onRemoveFromIArrayRecord?: ({key, elementKey, index}:{
      key: string
      elementKey: string
      index: number
    })=>void,
    onChangeIArrayOrStringOrBooleanRecord?: ({
      key,
      type,
      elementKey,
      value,
      elementSubKey,
      index,
    }:{
      key: string,
      type: 'string' | 'boolean' | 'array',
      elementKey: string,
      value: string | boolean,
      elementSubKey?: string,
      index?: number,
    }) => void,
    onChangeArrayKey?: ({key, index, value}: ChangeArrayItemParams)=>void
    onChangeArrayItem?: ({key, index, value}: ChangeArrayItemParams)=>void
    onAddItemToValue?: ({key}: {key:string})=>void
    onRemoveItem?: ({key, index}:{key: string, index: number})=>void
  })
  {
    const addButton = (
      <ButtonAnt
        icon={<PlusOutlined />}
        isRedirect={false}
        onClick={(onAddItemToValue !== undefined) ? (e)=>onAddItemToValue({key: Key}):(e)=>{}}
      />
    )

    function onRemove (index:number) {
      if(onRemoveItem !==undefined)
      Modal.confirm({
        title: 'Remover',
        content: '¿Desea remover el elemento de la lista?',
        onOk: ()=>onRemoveItem({key: Key, index}),
      })      
    }
    
    const RemoveButton = (index:number) => (
      <ButtonAnt
        icon={<DeleteOutlined />}
        isRedirect={false}
        onClick={()=>onRemove(index)}
      />
    )

    const showAddButton = (index:number, value: Array<any>) => (index === value.length -1)

    /**
     * @description Para los arreglos llave valor de raíz
     */
    function mapUserOptions (itemIndex: number):ItemType[] {
      return UserFields.map((userField, index)=>{
        const item:ItemType = {
          label: userField,
          key: userField,
          onClick: (e: any)=>{
            if(onChangeArrayItem !== undefined)
              onChangeArrayItem({
                key: Key,
                index: itemIndex,
                value: `entries$${userField}`,
              })
          },
        }
        return item
      })
    }

    if(Array.isArray(value) && value.length === 0)
    return (
      <>
        <label className='input-config-label'>{Key}</label> 
        <Row gutter={24} className='input-config-bordered'>
          <Col>
            <Form.Item label=' '>
              {addButton}
            </Form.Item>
          </Col>
        </Row>
      </>      
    )
  
    if(Array.isArray(value))
    return (
      <>
        <label className='input-config-label'>{Key}</label> 
        <Row gutter={24} className='input-config-bordered'>
      {
        value.map((val, index)=>{
          const ColSpans = [10, 10, 1,1,1,1]
          const showAdd = showAddButton(index, value) || value.length === 0
          const showRemove = (value.length > 0)

          const _value = val[ Object.keys(val)[0] ]
  
          return (
          <Row gutter={24} key={index}>
            <Col span={ColSpans[0]}>
              <Form.Item label='Nombre'>
                <AntInput
                  value={Object.keys(val)}
                  onChange={(e)=>(onChangeArrayKey !== undefined) ? onChangeArrayKey({key: Key, index, value: e.target.value}) : ((e)=>{})()}
                />
              </Form.Item>
            </Col>
            
            {typeof _value === 'string' &&
            <Col span={ColSpans[1]}>
              {RenderInputAndMenu({
                items: mapUserOptions(index),
                label: 'Valor',
                value: _value,
                onChange: (event) => (onChangeArrayItem !== undefined) ?
                onChangeArrayItem({key: Key, index, value: event.target.value}):undefined
              })}
            </Col>}
  
            {showAdd &&
            <Col span={ColSpans[3]}>
              <Form.Item label=' '>
                {addButton}
              </Form.Item>
            </Col>}
            
            {(showAdd && showRemove) && 
            <Col span={ColSpans[4]} />}
  
            {showRemove &&
            <Col span={ColSpans[5]}>
              <Form.Item label=' '>
                {RemoveButton(index)}
              </Form.Item>
            </Col>}
          </Row>
          )
        })
      }
        </Row>
      </>
    )    

    if(typeof value === 'string')
    return (
      <Row gutter={24} key={Key}>
        <Col span={24}>
          <Form.Item label={Key}>
            <AntInput
              value={value}
              onChange={onChange}
            />
          </Form.Item>
        </Col>
      </Row>
    )

    if(typeof value === 'boolean')
    return (
      <Row gutter={24} key={Key}>
        <Col span={12}>
          <label className='input-config-label'>
            {Key}
          </label>
        </Col>
        <Col span={12}>
          <Form.Item valuePropName='checked'>
            <AntInput type='checkbox'
              checked={value}
              onChange={(e)=>{
                if(onChangeConfig !== undefined){
                  onChangeConfig({key: Key, value: !value})
                }
              }}
            />
          </Form.Item>
        </Col>
      </Row>
    )

    if(typeof value === 'object'){
      //IStringOrBooleanOrArrayRecord | IArrayOrStringOrBooleanOrArrayRecord
      return (
        <React.Fragment key={Key}>
          <Row gutter={24}>
            <Col>
              <label className='input-config-label'>{Key}</label>
            </Col>
          </Row>

          <Row className='input-config-bordered'>
          {Object.keys(value).map((_key, index)=>{
            const val = value[_key]
            if(typeof val === 'string'){
              return (
                  <Col span={24} key={index}>
                    <Form.Item label={_key}>
                      <AntInput
                        value={val}
                        onChange={(e)=>{
                          if(onChangeIArrayOrStringOrBooleanRecord !== undefined)
                          onChangeIArrayOrStringOrBooleanRecord({
                            key: Key,
                            type: 'string',
                            elementKey: _key,
                            value: e.target.value,
                          })
                        }}
                      />
                    </Form.Item>
                  </Col>
              )
            }

            if(typeof val === 'boolean'){
              return (
                  <Col span={24} key={index}>
                    <Form.Item label={_key} valuePropName='checked'>
                      <AntInput type='checkbox'
                        checked={val}
                        onClick={(e)=>{
                          if(onChangeIArrayOrStringOrBooleanRecord !== undefined)
                          onChangeIArrayOrStringOrBooleanRecord({
                            key: Key,
                            type: 'boolean',
                            elementKey: _key,
                            value: !val,
                          })
                        }}
                      />
                    </Form.Item>
                  </Col>
              )
            }

            if(Array.isArray(val)){
              return (
                <Col span={24} key={index}>
                  <Row gutter={24} key={index}>
                    <Col>
                      <label className='input-config-label'>{_key}</label>
                    </Col>
                  </Row>

                  <Row gutter={24} className='input-config-bordered'>
                  {(val.length === 0) && (
                    <Row gutter={24}>
                      <Col span={24}>
                        <ButtonAnt
                          icon={<PlusOutlined />}
                          onClick={e=>{
                            if(onAddToIArrayRecord !== undefined)
                            onAddToIArrayRecord({key: Key, elementKey: _key, type: 'string'})
                          }}
                        />
                      </Col>
                    </Row>
                  )}
                  {
                    val.map((subVal, index)=>{
                      const subKey = Object.keys(subVal)[0]
                      const subValue = subVal[subKey]

                      return (
                        <Row gutter={24} key={index}>
                          <Col span={10}>
                            <Form.Item>
                              <AntInput
                                value={subKey}
                                onChange={(e)=>{
                                  const {value} = e.target
                                  if(onChangeIArrayOrStringOrBooleanRecord !== undefined){
                                    if(typeof subValue === 'string' || typeof subValue === 'boolean')
                                    onChangeIArrayOrStringOrBooleanRecord({
                                      key: Key,
                                      type: 'array',
                                      elementKey: _key,
                                      elementSubKey: value,
                                      value: subValue,
                                      index: index,
                                    })
                                  }
                                }}
                              />
                            </Form.Item>
                          </Col>
                          {(typeof subValue === 'string') &&
                          <Col span={10}>
                            <Form.Item>
                              {/*
                              <AntInput
                                value={subValue}
                                onChange={(e)=>{
                                  if(onChangeIArrayOrStringOrBooleanRecord !== undefined){
                                    onChangeIArrayOrStringOrBooleanRecord({
                                      key: Key,
                                      type: 'array',
                                      elementKey: _key,
                                      elementSubKey: subKey,
                                      value: e.target.value,
                                      index: index,
                                    })
                                  }
                                }}
                              />
                              */}
                              {RenderInputAndMenu({
                                value: subValue,
                                items: UserFields.map((field)=>({
                                  key: field,
                                  label: field,
                                  onClick: (event)=>{
                                    if(onChangeIArrayOrStringOrBooleanRecord !== undefined)
                                    onChangeIArrayOrStringOrBooleanRecord({
                                      key: Key,
                                      type: 'array',
                                      elementKey: _key,
                                      elementSubKey: subKey,
                                      value: field,
                                      index: index,
                                    })
                                  }
                                })),
                                onChange: (e) =>{
                                  if(onChangeIArrayOrStringOrBooleanRecord !== undefined){
                                    onChangeIArrayOrStringOrBooleanRecord({
                                      key: Key,
                                      type: 'array',
                                      elementKey: _key,
                                      elementSubKey: subKey,
                                      value: e.target.value,
                                      index: index,
                                    })
                                  }
                                },
                              })}
                            </Form.Item>
                          </Col>
                          }
                          {(index === (val.length) - 1) && (
                            <Col span={2}>
                              <ButtonAnt
                                icon={<PlusOutlined />}
                                onClick={()=>{
                                  if(onAddToIArrayRecord !== undefined)
                                    onAddToIArrayRecord({
                                      key: Key,
                                      elementKey: _key,
                                      type: 'string',
                                  })}
                                }
                              />
                            </Col>
                          )}
                          <Col span={1}>
                            <ButtonAnt
                              icon={<DeleteOutlined />}
                              onClick={e=>{
                                if(onRemoveFromIArrayRecord !== undefined)
                                onRemoveFromIArrayRecord({
                                  key: Key,
                                  elementKey: _key,
                                  index,
                                })
                              }}
                            />
                          </Col>
                        </Row>
                      )
                    })
                  }
                  </Row>
                </Col>
              )
            }

            return null
          })}
          </Row>
        </React.Fragment>
      )
    }
  
    return <></>
  }