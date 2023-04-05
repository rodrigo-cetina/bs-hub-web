import { Dispatch, SetStateAction } from 'react'

export interface RemoveParams {
  data: any[]
  setData: Dispatch<SetStateAction<any[]>>
  id: string
  idField: string
}

export default function remove({
  data,
  setData,
  id,
  idField,
}: RemoveParams) {
  const nextData = data.filter(t => t[idField] !== id)
  setData(nextData)
}