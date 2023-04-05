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

export interface CreateAndUpdateProps {
    isUpdate: boolean,
    form: any,
    categoryId?: string,
}

interface FormProps {
    _id: string;
    idOrigen: string;
    name: string;
    dimensions: DimObject[]; //save as string
    userType: string;
    createdAt: Date;
    isActive: boolean;
    isArchieved: boolean;
    roles: string[];
    profiles: string[];
}

interface FormProps {
    _id: string;
    name: string;
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
    const itemId = props.categoryId;
    const isUpdate = props.isUpdate;
    const form = props.form;
    const [loading, setLoading] = useState(false);

    const getSecurityLevel =  (code : number) => {
        try{
          const res = SecurityLevels.find((obj):any => {
            if(obj.code === code){
              return obj; 
            }
          })
          return res;
        }
        catch(error: any){
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

    async function getCategory() {
        try {
            setLoading(true);
            const res = await requestService({
                url: `/category/${itemId}`,
              });
            if (res != null) {
                const { name } = res;
                form.setFieldsValue({
                    name,
                });
            }
            setLoading(false);
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
        if(isUpdate){
            getCategory();
        }
        else{
            form.resetFields();
        }
    }, [itemId]);


    return (
        <Row style={{padding: 20, marginTop: -65}}>
            <Col span={24}>
            <Spin spinning={loading}>
                <Title
                    text={isUpdate ? "Editar Categoria" : "Nueva Categoria"}
                    type="form"
                />
                <Form layout="vertical" form={form}>
                    <Row gutter={24}>
                        <Col span={24}>
                            <Row gutter={24}>
                                <Col span={24}>
                                    <Form.Item
                                        label="Nombre de la Categoria"
                                        name="name"
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
    const itemId = props.categoryId;
    const isEditing = props.isUpdate;
    const form = props.form
    return <CreateEdit isUpdate={isEditing} categoryId={itemId} form={form} />
}