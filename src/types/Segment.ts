import { UserType } from './UserType'
import { SegmentDimensionObj } from './DimensionObject'

export interface Segment {
  _id: string
  name: string
  description: string
  dimensions: SegmentDimensionObj
  isActive: boolean
  isArchived: boolean
  services: any[]
  userType: UserType
}