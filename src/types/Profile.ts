import { elementKeyValue } from "./DimensionObject"
import { SecurityLevel } from "./SecurityLeves"
import { UserType } from "./UserType"

export interface Profile{
    _id:string
    idOrigen : string
    userTypeId : string
    userId : string
    userType: UserType
    dimensions: elementKeyValue
    catDimensions : elementKeyValue
    securityLevelId : number
    isActive: boolean
    isArchived: boolean
}

export interface CreateProfile{
    idOrigen : string
    userTypeId : string
    userId : string
    securityLevelId : number
}
