import { Col, Row, Form, List, Spin, Select } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { ButtonAnt } from "components/single/button/Button";
import Title from "components/templates/title/Title";
import Input from "components/single/Input/Input";
import FormFooter from "components/templates/footer/FormFooter";
import Modal from "components/single/Modal/Modal";
import Unauthorized from "pages/Unauthorized";
import requestService from "services/requestService";
import { groupPermissions } from "./groupPermissions";
import { PATH_ROUTES } from "routes/config/Paths";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "hooks/useAuth";
import { useState, useEffect } from "react";
import GetSelectList from "utils/array/getSelectList";
import { Role } from "types/Role";
import { Permission } from "types/Permission";
import "./RolesForm.css";
import {
  NotificationError,
  NotificationSuccess,
} from "components/single/notification/notifications";
import { UserType } from "types/UserType";
import { mapCatDimensionsStringToArray } from "pages/userTypes/CreateEdit";
import { DimObject, SegmentDimensionObj } from "types/DimensionObject";



function CreateEdit() {
  const itemId = useParams().id;
  const isEditing = itemId !== undefined;
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [, , isExpandedModule, onClickModule] = GetSelectList<string>();
  const [
    selectedPermissions,
    setSelectedPermissions,
    isSelectedPermission,
    onSelectPermission,
  ] = GetSelectList<string>();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isDefault, setIsDefault] = useState(false)


  const navigate = useNavigate();

  function onSubmit() {
    Modal.confirm({
      title: isEditing ? "Actualizar" : "Guardar",
      content: isEditing
        ? "¿Desea actualizar el rol?"
        : "¿Desea guardar el nuevo rol?",
      onOk: () => onConfirmSubmit(),
    });
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

  async function onConfirmSubmit() {
    try {
      const { name, userTypes } = form.getFieldsValue();

      const _permissions: Permission[] = [];

      selectedPermissions.forEach((permissionId) => {
        const permission = permissions.find((t) => t._id === permissionId);

        if (permission !== undefined) _permissions.push(permission);
      });
      await requestService({
        url: isEditing ? `/roles/${itemId}` : "/roles",
        method: isEditing ? "PUT" : "POST",
        payload: {
          name,
          permissions: _permissions,
          isDefault: false,
          userTypes,
        },
      });

      NotificationSuccess({
        title: isEditing ? "Actualizado" : "Creado",
        description: isEditing
          ? "El rol ha sido actualizado"
          : "El rol ha sido creado",
        // onOk: ()=>
      });
      navigate(PATH_ROUTES.ROLES);
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        NotificationError({
          title: isEditing ? "Error al actualizar" : "Error al guardar",
          description: error.response.data.message,
        });
      }
    }
  }

  async function getPermissions() {
    try {
      const res = await requestService({
        url: "permissions",
      });

      setPermissions(res);
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

  async function getUserTypes() {
    try {
        const res = await requestService({
            url: "user-type",
        });
        setUserTypes(res);
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

  useEffect(() => {
    getPermissions();
    getUserTypes();
  }, []);

  useEffect(() => {
    async function getServiceType() {
      try {
        setLoading(true);
        const res: Role = await requestService({
          url: `/roles/${itemId}`,
        });

        const { name, permissions, userTypes, isDefault } = res;
        setIsDefault(isDefault)
        if(!isDefault){
          form.setFieldsValue({
            name,
            userTypes: userTypes.map((type : UserType) => type._id),
          });
          setSelectedPermissions(permissions.map(({ _id }) => _id));
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

    if (isEditing) getServiceType();
  }, [isEditing]);

  return (
    <>
    {!isDefault ? (
    <Row>
      <Col span={1} />
      <Col span={22}>
        <Spin spinning={loading}>
          <Title
            type="form"
            text={isEditing ? "Actualizar Rol" : "Nuevo Rol"}
            backButton={{
              isRedirect: true,
              url: PATH_ROUTES.ROLES,
            }}
          />

          <Form form={form} layout="vertical" onFinish={onSubmit}>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Nombre del rol"
                  rules={[
                    {
                      required: true,
                      message: "Campo requerido",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                    name="userTypes"
                    label="Tipo de usuario"
                    rules={[
                        {
                            required: false,
                            message: "Campo requerido",
                        },
                    ]}
                >
                    <Select
                      mode="multiple"
                    >
                        {userTypes.map(({_id, name}) => (
                            <Select.Option key={_id} value={_id} >
                                {name}
                            </Select.Option>
                        ))}
                    </Select>
                                    </Form.Item>
              </Col>

              <Col span={12}>
                <List
                  className="permissionList"
                  header={
                    <span className="ant-form-item-label">
                      <label>Permisos</label>
                    </span>
                  }
                  dataSource={groupPermissions(permissions)}
                  renderItem={({ module, permissions }) => {
                    const expanded = isExpandedModule(module);
                    const { length } = permissions;
                    const expandedHeight = length * 30 + length + 1;
                    return (
                      <>
                        <List.Item onClick={() => onClickModule(module)}>
                          {module}
                          <ButtonAnt
                            icon={
                              expanded ? <MinusOutlined /> : <PlusOutlined />
                            }
                          />
                        </List.Item>
                        <ul
                          className={`permission-list-item ${
                            expanded ? "expanded" : ""
                          }`}
                          style={{
                            height: expanded ? `${expandedHeight}px` : "0px",
                          }}
                        >
                          {permissions.map(({ description, _id }, index) => (
                            <List.Item
                              key={_id}
                              className="permission-list-sub-item"
                            >
                              <span>{description}</span>
                              <input
                                type="checkbox"
                                checked={isSelectedPermission(_id)}
                                onClick={() => onSelectPermission(_id)}
                              />
                            </List.Item>
                          ))}
                        </ul>
                      </>
                    );
                  }}
                />
              </Col>
            </Row>
          </Form>
          <FormFooter
            okButton={{
              okText: "Aceptar",
              onOk: form.submit,
            }}
            cancelButton={{
              cancelText: "Cancelar",
              isCancelRedirect: true,
              cancelBackUrl: PATH_ROUTES.ROLES,
            }}
          />
        </Spin>
      </Col>
      <Col span={1} />
    </Row>
    ):(
      <Unauthorized />
    )}
    </>
  );
}

export default function FormWrapper() {
  const { permissions } = useAuth();

  const itemId = useParams().id;
  const isEditing = itemId !== undefined;

  if (
    (isEditing && permissions.updateRolesAndPermissions) ||
    (!isEditing && permissions.addRoles)
  )
    return <CreateEdit />;

  return <Unauthorized />;
}
