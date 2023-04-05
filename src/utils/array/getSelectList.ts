import { useState, Dispatch, SetStateAction } from 'react'

export default function GetSelectList<RecordType> ():
  [
    RecordType[],
    Dispatch<SetStateAction<RecordType[]>>,
    (id: RecordType)=>boolean,
    (id: RecordType)=>void,
  ]
{
  const [stateArray, setStateArray] = useState<RecordType[]>([])

  function isSelected (id: RecordType) {
    return stateArray.find(t => t === id) !== undefined
  }

  function onSelect (id: RecordType) {
    if(isSelected(id)) {
      const nextState = ([...stateArray]).filter(t => t !== id)
      setStateArray([...nextState])
      return
    }

    setStateArray([...stateArray, id])
  }

  return [stateArray, setStateArray, isSelected, onSelect]
}