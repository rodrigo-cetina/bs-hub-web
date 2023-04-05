import {
    Form,
    Select,
    Col,
    Row,
    Divider,
    Input as AntdInput,
    Menu,
    Spin,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { ButtonAnt } from "components/single/button/Button";
import Modal from "components/single/Modal/Modal";
import Title from "components/templates/title/Title";
import Input from "components/single/Input/Input";
import Collapse from "components/single/collapse/Collapse";
import FormFooter from "components/templates/footer/FormFooter";
import Tag from "components/single/Tag/Tag";
import Unauthorized from "pages/Unauthorized";
import React, { Fragment, useState, useEffect, FC } from "react";
import useAuth from "hooks/useAuth";
import requestService from "services/requestService";
import { DimObject, SegmentDimensionObj } from "types/DimensionObject";
import { UserType } from "types/UserType";
import { Service } from "types/Service";
import { PATH_ROUTES } from "routes/config/Paths";
import GetSelectList from "utils/array/getSelectList";
import { mapCatDimensionsStringToArray } from "pages/userTypes/CreateEdit";
import { Segment } from "types/Segment";
import {
    NotificationError,
    NotificationSuccess,
} from "components/single/notification/notifications";
import { Profile } from "types/Profile"
import { SecurityLevels } from "types/SecurityLeves";
import { elementKeyValue } from "types/ServiceType";

export interface CreateAndUpdateProps {
    isUpdate: boolean,
    profileId?: string,
    form: any,
    listTypes?: string[] | null,
    refreshKey : number,
    userTypes: string[]
    isSuperUser: boolean
}

interface FormProps {
    _id: string;
    idOrigen: string;
    dimensions: DimObject[]; //save as string
    userType: string;
    createdAt: Date;
    isActive: boolean;
    isArchieved: boolean;
    roles: string[];
    profiles: string[];
}

function mapDimensionsToDimObjectArray(dimensions: any) {
    const output: DimObject[] = [];
    const keys = Object.keys(dimensions);
    keys.forEach((key) => {
        output.push({
            dimName: key,
            value: dimensions[key],
        });
    });
    return output;
}

function CreateEdit({ ...props }: CreateAndUpdateProps) {
    const itemId = props.profileId;
    const isUpdate = props.isUpdate;
    const form = props.form;
    const listTypes = props.listTypes;
    const refreshKey = props.refreshKey;
    const types = props.userTypes
    const superUser = props.isSuperUser
    const [userTypes, setUserTypes] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(false);
    const { permissions, authUser } = useAuth()

    const getSecurityLevel = (code: number) => {
        try {
            const res = SecurityLevels.find((obj): any => {
                if (obj.code === code) {
                    return obj;
                }
            })
            return res;
        }
        catch (error: any) {
            NotificationError(
                error.response && error.response.data && error.response.data.message
                    ? {
                        title: error.response.data.title,
                        description: error.response.data.message,
                    }
                    : {
                        title: error.name,
                        description: error.message,
                    }
            );
        }
    }

    function onSelectUserType(userTypeId: string) {
        const userType = userTypes.find((t) => t._id === userTypeId);
        if (userType !== undefined) {
            const nextDimensions: DimObject[] = [];
            mapCatDimensionsStringToArray(userType.catDimensions).forEach(
                ({ name, value }) => {
                    nextDimensions.push({
                        dimName: name,
                        value: "",
                    });
                }
            );

            form.setFieldsValue({
                dimensions: nextDimensions,
            });
        }
    }

    function validateTypes(idUserType? : string, res : any[] = []){
        if(res.length > 0){
            const rest : any[] = []
            if(listTypes?.length !== 0){
                listTypes?.forEach((_types : any) => {
                    res.forEach((type : any, index : any, array : any) => {
                        if(idUserType !== undefined){
                            if(type._id === _types && type._id !== idUserType){
                                array.splice(index, 1)
                            }
                        }
                        else{
                            if(type._id === _types){   
                                array.splice(index, 1)
                            }
                        }
                    })
                });
            }
        }
        return res;
    }

    function validUserTypes(idUserType? : string, res : any[] = []){
        if(!superUser){
            const rest : any[] = []
            if(types.length !== 0){
                const response : any[] = []
                types.forEach((t: any) => {
                    res.forEach((type : any, index : any, array : any) => {
                        if(t === type._id){
                            response.push(type)
                        }
                    })
                })
                rest.length = 0
                res = response
            }
        }
        const response = validateTypes(idUserType, res)
        return response;
    }


    async function getUserTypes(idUserType? : string) {
        try {
            const res = await requestService({
                url: "user-type",
            });
            const rest = validUserTypes(idUserType,res)
            setUserTypes(rest)
        } catch (error: any) {
            NotificationError(
                error.response && error.response.data && error.response.data.message
                    ? {
                        title: error.response.data.title,
                        description: error.response.data.message,
                    }
                    : {
                        title: error.name,
                        description: error.message,
                    }
            );
        }
    }

    async function getProfile() {
        try {
            setLoading(true);
            const res = await requestService({
                url: `/profiles/${itemId}`,
            });
            if (res != null) {
                const { idOrigen, userType, securityLevel, dimensions } = res;
                await getUserTypes(userType._id);
                if (userType !== null) {
                    onSelectUserType(userType._id);
                }
                const level = getSecurityLevel(securityLevel);
                form.setFieldsValue({
                    idOrigen,
                    userType: userType._id,
                    securityLevel: level?.code,
                    dimensions:
                        dimensions === null ? [] : mapDimensionsToDimObjectArray(dimensions)
                });
                setLoading(false);
            }
        } catch (error: any) {
            setLoading(false);
            NotificationError(
                error.response && error.response.data && error.response.data.message
                    ? {
                        title: error.response.data.title,
                        description: error.response.data.message,
                    }
                    : {
                        title: error.name,
                        description: error.message,
                    }
            );
        }
    }


    useEffect(() => {
        if (isUpdate) {
            getProfile();
        }
        else {
            getUserTypes();
            form.resetFields();
        }
    }, [itemId, refreshKey]);

    function Label({ value }: { value?: string }) {
        const userTypeId = form.getFieldValue("userType");

        const userType = userTypes.find((t) => t._id === userTypeId);

        if (userType !== undefined) {
            const { catDimensions } = userType;
            const _catDimensions = mapCatDimensionsStringToArray(catDimensions);

            const catDimension = _catDimensions.find((t) => t.name === value);
            if (catDimension !== undefined)
                return <label>{catDimension.value}</label>;
        }

        return <label>{value}</label>;
    }

    return (
        <Row style={{ padding: 20, marginTop: -65 }}>
            <Col span={24}>
                <Spin spinning={loading}>
                    <Title
                        text={isUpdate ? "Editar Perfil" : "Nuevo Perfil"}
                        type="form"
                    />
                    <Form layout="vertical" form={form}>
                        <Row gutter={24}>
                            <Col span={24}>
                                {/*Nombre y tipo de usuario*/}
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item
                                            label="ID de Origen"
                                            name="idOrigen"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Campo requerido",
                                                },
                                                {
                                                    whitespace: true,
                                                    message: "Nombre no puede ser un espacio",
                                                },
                                            ]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item
                                            name="userType"
                                            label="Tipo de usuario"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Campo requerido",
                                                },
                                            ]}
                                        >
                                            <Select
                                                onChange={onSelectUserType}
                                            >
                                                {userTypes.map(({ _id, name }) => (
                                                    <Select.Option key={_id} value={_id} >
                                                        {name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <br />
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Collapse defaultActiveKey="dimPanel">
                                            <Collapse.Panel key="dimPanel" header="Dimensiones">
                                                <Form.List name="dimensions">
                                                    {(fields, { add, remove }, { errors }) => (
                                                        <>
                                                            {fields.map(({ key, name, ...restField }, index) => {
                                                                return (
                                                                    <Row gutter={22} key={index}>
                                                                        <Col span={6}>
                                                                            <Form.Item name={[name, "dimName"]}>
                                                                                <Label />
                                                                            </Form.Item>
                                                                        </Col>

                                                                        <Col span={15}>
                                                                            <Form.Item name={[name, "value"]}>
                                                                                <Input />
                                                                            </Form.Item>
                                                                        </Col>
                                                                    </Row>
                                                                );
                                                            })}
                                                        </>
                                                    )}
                                                </Form.List>
                                            </Collapse.Panel>
                                        </Collapse>
                                    </Col>
                                </Row>
                                <br />
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item
                                            name="securityLevel"
                                            label="Nivel de seguridad"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Campo requerido",
                                                },
                                            ]}
                                        >
                                            <Select disabled={!permissions.changeProfileSecurityLevel}>
                                                {SecurityLevels.map(({ code, name }) => (
                                                    <Select.Option key={code} value={code} >
                                                        {name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <br />
                            </Col>
                        </Row>
                        <br />
                    </Form>
                </Spin>
            </Col>
        </Row>
    )


}


export default function FormWrapper({ ...props }: CreateAndUpdateProps) {
    const { isSuperUser,form, isUpdate, refreshKey, userTypes, listTypes, profileId } = props
    return <CreateEdit 
            isUpdate={isUpdate} 
            profileId={profileId} 
            form={form} 
            listTypes={listTypes} 
            refreshKey={refreshKey} 
            userTypes={userTypes}
            isSuperUser={isSuperUser}
            />
}