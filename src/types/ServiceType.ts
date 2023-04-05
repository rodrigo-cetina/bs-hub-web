export interface ServiceType {
  _id: string
  name: string
  description: string
  config: string
  createdAt: string
  isActive: boolean
  isArchived: boolean
}

export interface elementKeyValue {
  [key: string]: string
}

export interface IServiceTypeConfigParam {
  [key: string]: 'string' | 'array' | 'boolean' | IStringOrBooleanOrArrayRecord
}

export interface IStringOrBooleanOrArrayRecord {
  [key: string]: string|boolean|Array<{[key:string]:string|boolean}>
}

export interface config {
  [key: string]: elementKeyValue | elementKeyValue[]
}

export type serviceEventType = 'Api-call' | 'Open-app' | 'Open-web' | 'Boot-call'