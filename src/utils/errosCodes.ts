export interface ErrorCode{
    code:string
    message:string
}

export const ErrorCodes:ErrorCode[] = [
    {
        code:'REGISTER_IS_ALREADY_USED',
        message:'El tipo usuario esta siendo usado'
    },
    {
        code:'SERVICE_IS_ALREADY_USED',
        message:'El servicio esta siendo usado'
    },
    {
        code:'TYPESERVICE_IS_ALREADY_USED',
        message:'El tipo de servicio esta siendo usado'
    }
]