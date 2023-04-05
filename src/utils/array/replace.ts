import { Dispatch, SetStateAction } from 'react'

export interface ReplaceParams {
  data: any[]
  setData: Dispatch<SetStateAction<any[]>>
  id: string
  idField: string
  attributesToReplace: any
}

export default function replace({
  data,
  setData,
  id,
  idField,
  attributesToReplace,
}: ReplaceParams) {
  const index = data.findIndex(t => t[idField] === id)
  const nextData = [...data]

  const keys = Object.keys(attributesToReplace)
  keys.forEach(key => {
    nextData[index][key] = attributesToReplace[key]
  })

  setData([...nextData])
}