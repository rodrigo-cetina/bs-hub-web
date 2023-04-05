export interface DimObject {
  value: string
  dimName: string
}

export interface DimensionObject {
  [key: string]: DimObject
}

export interface SegmentDimensionObj {
  [key: string]: string[]
}

export interface elementKeyValue {
  [key: string]: string
}