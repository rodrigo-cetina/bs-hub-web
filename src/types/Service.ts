export interface Service {
  _id: string
  name: string
  description: string
  isPublic: boolean
  typeService: string
  definition: IDefinition
  config: string
  createdAt: string
  isActive: boolean
  isArchived: boolean
}

export interface IStringOrBooleanOrArrayRecord {
  [key: string]: string | boolean | Array<IStringOrBooleanOrArrayRecord>
}

export interface IArrayOrStringOrBooleanRecord {
  [key: string]: string | boolean | Array<IStringOrBooleanOrArrayRecord>
}

export interface IDefinition {
  [key: string]:
  | string
  | boolean
  | Array<IStringOrBooleanOrArrayRecord> //array of key values, 1 key per object
  | IArrayOrStringOrBooleanRecord //object
  | null
}