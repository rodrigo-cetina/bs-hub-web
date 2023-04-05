import { Col, Form, Input, Row, Select, Spin } from "antd";
import Collapse from "components/single/collapse/Collapse";
import Title from "components/templates/title/Title";
import ItemForm from "components/single/itemForm/ItemForm";
import modal from "components/single/Modal/Modal";
import FormFooter from "components/templates/footer/FormFooter";
import Unauthorized from "pages/Unauthorized";
import { PATH_ROUTES } from "routes/config/Paths";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import requestService from "services/requestService";
import useAuth from "hooks/useAuth";
import { mapCatDimensionsStringToArray } from "pages/userTypes/CreateEdit";
import { UserType } from "types/UserType";
import { Role } from "types/Role";
import { DimObject, elementKeyValue } from "types/DimensionObject";
import {
  NotificationError,
  NotificationSuccess,
} from "components/single/notification/notifications";
import { Profile } from "types/Profile";
import ListaPerfiles from "pages/profile/List";
import SearchBar from "components/templates/searchbar/SearchBar";
import FormProfile from "pages/profile/CreateEdit";



interface FormProps {
  _id: string;
  names: string;
  lastNames: string;
  email: string;
  password?: string;
  phone: string;
  address: string;
  /* dimensions: DimObject[]; //save as string */
  /* userType: string; */
  createdAt: Date;
  isActive: boolean;
  isArchieved: boolean;
  roles: string[];
}

function getTypes(authUser: any) {
  const types: any[] = []
  authUser?.roles.forEach((rol: Role) => {
    rol.userTypes.forEach((t: UserType) => {
      types.push(t._id)
    })
  })
  const uniqueTypes = ConverToUnique(types)
  return uniqueTypes;
}

function ConverToUnique<T>(array: T[]) {
  const result: T[] = [];
  for (const item of array) {
    if (!result.includes(item)) {
      result.push(item);
    }
  }
  return result;
}


function validSuperUser(authUser: any) {
  let isSuperUser = false
  if (authUser.isDefault)
    isSuperUser = true
  return isSuperUser;
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

function CreateEdit(props: any) {
  const itemId = useParams().id;
  const isEditing = itemId !== undefined;
  const { authUser } = useAuth();
  const [form] = Form.useForm();
  const listTypes = getTypes(authUser);
  const superUser = validSuperUser(authUser);
  const [isDefault, setIsDefault] = useState(false)

  /* const [userTypes, setUserTypes] = useState<UserType[]>([]); */
  const [roles, setRoles] = useState<Role[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: FormProps) => {
    modal.confirm({
      title: `${isEditing ? "Actualizar" : "Guardar"}`,
      content: `¿Desea ${isEditing ? "actualizar" : "guardar"} el usuario?`,
      onOk: () => onConfirmSumbit(values),
    });
  };



  const onConfirmSumbit = async (values: FormProps, id: string = "") => {
    try {
      const { ...rest } = values;

      const obDimensions: elementKeyValue = {};

      /* dimensions.forEach(({ dimName, value }) => {
        obDimensions[dimName] = value;
      }); */

      await requestService({
        url: isEditing ? `/users/${itemId}` : "/users",
        payload: {
          ...rest,
        },
        method: isEditing ? "PUT" : "POST",
      });

      NotificationSuccess({
        title: isEditing ? "Actualizado" : "Creado",
        description: isEditing
          ? "El usuario ha sido actualizado"
          : "El usuario ha sido registrado",
      });
      navigate(PATH_ROUTES.USERS);
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        NotificationError({
          title: `Error al ${isEditing ? "actualizar" : "guardar"}`,
          description: error.response.data.message,
        });
      }
    }
  };

  /*  function onSelectUserType(userTypeId: string) {
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
   } */

  /*   async function getUserTypes() {
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
    } */

  async function getRoles() {
    try {
      const res = await requestService({
        url: "roles",
      });

      setRoles(res);
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


  async function getUser() {
    try {
      setLoading(true);
      const res = await requestService({
        url: `users/${itemId}`,
      });

      const { /* dimensions */ /* userType, */ roles, isDefault, ...rest } = res;

      /*       if (dimensions === null) {
              if (userType === null) {
                form.setFieldsValue({ dimensions: [] });
              }
      
              if (userType !== null) {
                onSelectUserType(userType._id);
              }
            } */

      /*  if (userType !== null)
         form.setFieldsValue({
           userType: userType._id,
         }); */
      setIsDefault(isDefault)
      if (!isDefault) {
        form.setFieldsValue({
          /*  dimensions:
             dimensions === null ? [] : mapDimensionsToDimObjectArray(dimensions), */
          roles: roles.map((role: Role) => role._id),
          profiles: profiles.map((profile: Profile) => profile._id),
          ...rest,
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
    getRoles();
  }, []);

  useEffect(() => {
    if (isEditing) getUser();
  }, [isEditing]);

  /**Etiqueta para mostrar el nombre del campo de dimension DimN */
  /*  function Label({ value }: { value?: string }) {
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
  */

  return (
    <Row>
      <Col span={1} />
      <Col span={22}>
        <Spin spinning={loading}>
          <Title
            text={isEditing ? "Actualizar usuario" : "Registrar nuevo usuario"}
            type="form"
            backButton={{
              isRedirect: true,
              url: PATH_ROUTES.USERS,
            }}
          />

          <Form
            name="normal_login"
            layout="vertical"
            onFinish={handleSubmit}
            form={form}
          >
            <Row gutter={24}>
{/*               <Col span={12}>
                <ItemForm
                  name="idOrigen"
                  label="Id origen"
                  rules={[
                    { required: true, message: "Escriba el id de origen" },
                    {
                      whitespace: true,
                      message: "El id de origen no puede ser un espacio",
                    },
                  ]}
                >
                  <Input placeholder="ID de origen" />
                </ItemForm>
              </Col> */}
              <Col span={12}>
                <ItemForm
                  name="names"
                  label="Nombres"
                  rules={[
                    { required: true, message: "Escriba los nombres" },
                    {
                      whitespace: true,
                      message: "Los nombres no pueden ser un espacio",
                    },
                  ]}
                >
                  <Input placeholder="Nombres" />
                </ItemForm>
              </Col>

              <Col span={12}>
                <ItemForm
                  name="lastNames"
                  label="Apellidos"
                  rules={[
                    { required: true, message: "Escriba los apellidos" },
                    {
                      whitespace: true,
                      message: "Los apellidos no pueden ser un espacio",
                    },
                  ]}
                >
                  <Input placeholder="Apellidos" />
                </ItemForm>
              </Col>

              <Col span={12}>
                <ItemForm
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Escriba el correo" },
                    {
                      whitespace: true,
                      message: "El correo no pueden ser un espacio",
                    },
                    {
                      type: "email",
                      message: "No es un correo",
                    },
                  ]}
                >
                  <Input placeholder="Correo" />
                </ItemForm>
              </Col>

              <Col span={12}>
                <ItemForm
                  name="phone"
                  label="Teléfono"
                  rules={[{ required: true, message: "Escriba el teléfono" }]}
                >
                  <Input placeholder="Teléfono" />
                </ItemForm>
              </Col>

              <Col span={12}>
                <ItemForm
                  name="address"
                  label="Dirección"
                  rules={[{ required: true, message: "Escriba la dirección" }]}
                >
                  <Input placeholder="Dirección" />
                </ItemForm>
              </Col>
              <Col span={12}>
                <ItemForm name="roles" label="Roles">
                  <Select mode="multiple" >
                    {roles.map(({ _id, name }) => (
                      <Select.Option key={_id} value={_id}>
                        {name}
                      </Select.Option>
                    ))}
                  </Select>
                </ItemForm>
              </Col>
            </Row>
            <Row gutter={24}>
              
              {/* <Col span={12}>
                <ItemForm
                  name="userType"
                  label="Tipos de usuario"
                  rules={[{ required: true, message: "Seleccione" }]}
                >
                  <Select onSelect={onSelectUserType}>
                    {userTypes.map(({ _id, name }) => (
                      <Select.Option key={_id} value={_id}>
                        {name}
                      </Select.Option>
                    ))}
                  </Select>
                </ItemForm>
              </Col>  */}


            </Row>
            <br />

           {/*  <Row gutter={24}>
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

                                <Col span={6}>
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
            </Row> */}
            <br />
          </Form>
        </Spin>
      </Col>
      <Col span={1} />
      <Col span={24}>
        <ListaPerfiles userId={itemId?itemId:""} userTypes={listTypes} isSuperUser={superUser} />
      </Col>
      <Col span={24}>
      <FormFooter
            cancelButton={{
              isCancelRedirect: true,
              cancelBackUrl: PATH_ROUTES.USERS,
              cancelText: "Cancelar",
            }}
            okButton={{
              onOk: form.submit,
              okText: isEditing ? "Actualizar" : "Guardar",
            }}
          />
      </Col>
    </Row>
  );
}

export default function FormWrapper(props: any) {
  const { permissions, authUser } = useAuth();
  const itemId = useParams().id;
  const isEditing = itemId !== undefined;

  if (
    (isEditing && permissions.updateUsers) ||
    (!isEditing && permissions.addUsers)
  )
    return CreateEdit(props);

  return <Unauthorized />;
}
