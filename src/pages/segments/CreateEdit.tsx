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
import React, { Fragment, useState, useEffect } from "react";
import useAuth from "hooks/useAuth";
import requestService from "services/requestService";
import { useParams, useNavigate } from "react-router-dom";
import { SegmentDimensionObj } from "types/DimensionObject";
import { UserType } from "types/UserType";
import { Service } from "types/Service";
import { PATH_ROUTES } from "routes/config/Paths";
import GetSelectList from "utils/array/getSelectList";
import { Segment } from "types/Segment";
import {
  NotificationError,
  NotificationSuccess,
} from "components/single/notification/notifications";

interface CatDimensionWithValues {
  /**Nombre del DimN (Dim1, Dim2...) */
  name: string;

  /**Campo que representa el DimN */
  value: string;

  /**Arreglo de valores en el campo/dim */
  values: string[];
}

/**
 *
 * @param dimensions from userType
 * @description Use when select userType
 * @returns
 */
function mapCatDimensionsStringToArray(
  dimensions: string
): CatDimensionWithValues[] {
  const ob = JSON.parse(dimensions);

  const keys = Object.keys(ob);

  const output: CatDimensionWithValues[] = [];

  keys.forEach((key) => {
    output.push({
      name: key,
      value: ob[key],
      values: [],
    });
  });

  return output;
}

/**
 * @description Use at store/update
 */
function mapCatDimensionWithValuesToString(
  dimensions: CatDimensionWithValues[]
): string {
  const object: any = {};

  dimensions
    .filter((t) => t.values.length > 0)
    .forEach((dimension) => {
      const { name, values } = dimension;
      object[name] = values.filter((t) => t.length > 0);
    });

  return JSON.stringify(object);
}

/**
 *
 * @param dimensions Objeto que viene en del segmento
 * @param catDimensions JSON en un string vienen del tipo de usuario asignado al segmento
 * @description Use at fetch(retrieve to edit/update)
 * @returns
 */
function mapDimensionsToCatDimensions(
  dimensions: SegmentDimensionObj | string,
  catDimensions: string
): CatDimensionWithValues[] {
  if (typeof dimensions === "string" && dimensions.length > 0) {
    return mapDimensionsToCatDimensions(JSON.parse(dimensions), catDimensions);
  }

  const catDimensionWithValues = mapCatDimensionsStringToArray(catDimensions);

  catDimensionWithValues.forEach((catDim, index) => {
    const { name } = catDim;

    const field = (dimensions as SegmentDimensionObj)[name];

    if (field !== undefined) {
      catDimensionWithValues[index].values = field;
    }
  });

  return catDimensionWithValues;
}

function CreateEdit() {
  const itemId = useParams().id;
  const isEditing = itemId !== undefined;

  const [form] = Form.useForm();

  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [selectedServices, setSelectedServices, , onClickService] =
    GetSelectList<string>();
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  //#region fetchData
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

  async function getServices() {
    try {
      const res = await requestService({
        url: "services",
      });
      setServices(res);
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
    getUserTypes();
    getServices();
  }, []);
  //#endregion

  function onChangeUserType(value: string) {
    const userType: UserType | undefined = userTypes.find(
      (t) => t._id === value
    );

    if (userType !== undefined) {
      form.setFieldsValue({
        dimensions: mapCatDimensionsStringToArray(userType.catDimensions),
      });
    }
  }

  //#region dimensionEvents
  function onAddDimensionField(index: number) {
    const _dimensions: CatDimensionWithValues[] =
      form.getFieldValue("dimensions");
    _dimensions[index].values.push("");
    form.setFieldsValue({ dimensions: _dimensions });
  }

  function onRemoveDimensionField({
    index,
    subIndex,
  }: {
    index: number;
    subIndex: number;
  }) {
    Modal.confirm({
      title: "Remover",
      content: `¿Desea remover el elemento?`,
      onOk: () => onConfirmRemoveDimensionField({ index, subIndex }),
    });
  }

  function onConfirmRemoveDimensionField({
    index,
    subIndex,
  }: {
    index: number;
    subIndex: number;
  }) {
    const _dimensions: CatDimensionWithValues[] =
      form.getFieldValue("dimensions");
    const holder = _dimensions[index];
    const values = [...holder.values];
    const nextValues = [];

    for (let i = 0; i < values.length; i++) {
      if (i !== subIndex) {
        nextValues.push(values[i]);
      }
    }

    holder.values = nextValues;
    _dimensions[index] = holder;

    form.setFieldsValue({ dimensions: _dimensions });
  }

  function onChangeDimensionField({
    index,
    subIndex,
    value,
  }: {
    index: number;
    subIndex: number;
    value: string;
  }) {
    const _dimensions: CatDimensionWithValues[] =
      form.getFieldValue("dimensions");
    const holder = _dimensions[index];
    holder.values[subIndex] = value;
    _dimensions[index] = holder;
    form.setFieldsValue({ dimensions: _dimensions });
  }
  //#endregion

  useEffect(() => {
    async function getSegment() {
      try {
        setLoading(true);
        const res = await requestService({
          url: `segments/${itemId}`,
        });

        const { name, description, userType, dimensions, services } = res;

        form.setFieldsValue({
          name,
          description,
          userType: userType._id,
          dimensions: mapDimensionsToCatDimensions(
            dimensions,
            userType.catDimensions
          ),
        });
        setSelectedServices(services.map((t: Service) => t._id));
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

    if (isEditing) getSegment();
  }, [isEditing]);

  async function storeOrUpdate() {
    try {
      const { name, description, userType, dimensions } = form.getFieldsValue();

      await requestService({
        url: isEditing ? `segments/${itemId}` : "segments",
        method: isEditing ? "PUT" : "POST",
        payload: {
          name,
          description,
          userType,
          dimensions: isEditing
            ? mapCatDimensionWithValuesToString(dimensions)
            : JSON.stringify("{}"),
          services: isEditing ? selectedServices : [],
        },
      });
      const res: Segment[] = await requestService({
        url: "segments",
      });
      const segment = res.find(
        (x: Segment) =>
          x.name === name &&
          x.userType._id === userType &&
          x.description === description
      );

      NotificationSuccess({
        title: isEditing ? "Actualizado" : "Creado",
        description: `El segmento ha sido ${
          isEditing ? "actualizado" : "creado"
        }`,
      });
      navigate(
        segment && !isEditing
          ? PATH_ROUTES.UPDATE_SEGMENT.replace(":id", segment?._id)
          : PATH_ROUTES.SEGMENTS
      );
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        NotificationError({
          title: `Error al ${isEditing ? "actualizar" : "crear"}`,
          description: error.response.data.message,
        });
      }
    }
  }

  function onSubmit() {
    Modal.confirm({
      title: isEditing ? "Actualizar" : "Guardar",
      content: `¿Desea ${isEditing ? "actualizar" : "guardar"} el segmento?`,
      onOk: () => storeOrUpdate(),
    });
  }

  return (
    <Row>
      <Col span={1} />

      <Col span={22}>
        <Spin spinning={loading}>
          <Title
            text={isEditing ? "Editar segmento" : "Nuevo segmento"}
            type="form"
            backButton={{
              isRedirect: true,
              url: PATH_ROUTES.SEGMENTS,
            }}
          />

          <Form layout="vertical" form={form} onFinish={onSubmit}>
            <Row gutter={24}>
              <Col span={12}>
                {/*Nombre y tipo de usuario*/}
                <Row gutter={24}>
                  <Col span={24}>
                    <Form.Item
                      label="Nombre del segmento"
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

                <Row gutter={24}>
                  <Col span={24}>
                    <Form.Item
                      label="Tipo de usuario"
                      name="userType"
                      rules={[
                        {
                          required: true,
                          message: "Campo requerido",
                        },
                      ]}
                    >
                      <Select
                        onChange={onChangeUserType}
                        showSearch={true}
                        optionFilterProp="children"
                      >
                        {userTypes.map(({ _id, name }) => (
                          <Select.Option key={_id} value={_id}>
                            {name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Descripción del segmento"
                  name="description"
                  rules={[
                    {
                      required: true,
                      message: "Campo requerido",
                    },
                    {
                      whitespace: true,
                      message: "La descripción no puede ser un espacio",
                    },
                  ]}
                >
                  <AntdInput.TextArea rows={5} />
                </Form.Item>
              </Col>
            </Row>

            {isEditing ? (
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="Seleccionar servicios">
                    <Select
                      value={[]}
                      showSearch={true}
                      optionFilterProp="children"
                      dropdownRender={(menu) => {
                        return (
                          <Menu
                            selectedKeys={selectedServices}
                            subMenuCloseDelay={0}
                          >
                            {services
                              .sort(function (a, b) {
                                if (a.name < b.name) return -1;

                                if (a.name > b.name) return 1;

                                return 0;
                              })
                              .map(({ _id, name }) => (
                                <Menu.Item
                                  key={_id}
                                  onClick={() => onClickService(_id)}
                                >
                                  {name}
                                </Menu.Item>
                              ))}
                          </Menu>
                        );
                      }}
                    ></Select>
                  </Form.Item>
                </Col>
              </Row>
            ) : (
              <></>
            )}

            <Row gutter={24}>
              <Col span={12}>
                {(() => {
                  const serviceList: Service[] = [];
                  selectedServices.forEach((serviceId) => {
                    const service = services.find((t) => t._id === serviceId);
                    if (service !== undefined) serviceList.push(service);
                  });

                  return (
                    <>
                      {serviceList.map(({ _id, name }) => (
                        <Tag
                          key={_id}
                          closable={true}
                          onClose={() => onClickService(_id)}
                        >
                          {name}
                        </Tag>
                      ))}
                    </>
                  );
                })()}
              </Col>
            </Row>

            <br />

            {isEditing ? (
              <Row gutter={24}>
                <Col span={24}>
                  <Form.List name="dimensions">
                    {(fields, { add, remove }, { errors }) => (
                      <Collapse>
                        <Collapse.Panel header="Dimensiones" key="dimensiones">
                          {fields.map(({ key, name, ...restField }, index) => {
                            const dimension: CatDimensionWithValues =
                              form.getFieldValue("dimensions")[index];

                            const ButtonAdd = (
                              <ButtonAnt
                                text="Agregar dimensiones"
                                icon={<PlusOutlined />}
                                onClick={() => onAddDimensionField(index)}
                              />
                            );

                            const ButtonRemove = (subIndex: number) => (
                              <ButtonAnt
                                icon={<DeleteOutlined />}
                                onClick={() =>
                                  onRemoveDimensionField({ index, subIndex })
                                }
                                tooltip="Remover"
                              />
                            );

                            return (
                              <Fragment key={index}>
                                <Row gutter={24}>
                                  <Col span={6}>
                                    <Form.Item label={dimension.value} />
                                  </Col>
                                  {dimension.values.length === 0 ? (
                                    <Col span={6}>{ButtonAdd}</Col>
                                  ) : (
                                    <React.Fragment>
                                      <Col span={5}>
                                        <Input
                                          value={dimension.values[0]}
                                          onChange={(e) => {
                                            const { value } = e.target;
                                            onChangeDimensionField({
                                              index,
                                              subIndex: 0,
                                              value,
                                            });
                                          }}
                                        />
                                      </Col>
                                      <Col span={1}>{ButtonRemove(0)}</Col>
                                      {dimension.values.length > 1 && (
                                        <>
                                          <Col span={5}>
                                            <Input
                                              value={dimension.values[1]}
                                              onChange={(e) => {
                                                const { value } = e.target;
                                                onChangeDimensionField({
                                                  index,
                                                  subIndex: 1,
                                                  value,
                                                });
                                              }}
                                            />
                                          </Col>
                                          <Col span={2}>{ButtonRemove(1)}</Col>
                                        </>
                                      )}
                                    </React.Fragment>
                                  )}
                                </Row>

                                <Row gutter={24}>
                                  {dimension.values.map(
                                    (val: string, subIndex: number) => {
                                      if (subIndex === 0 || subIndex === 1)
                                        return <React.Fragment />;

                                      return (
                                        <Col span={12} key={subIndex}>
                                          <Row gutter={24} key={subIndex}>
                                            {subIndex % 2 === 0 && (
                                              <Col span={12} />
                                            )}
                                            <Col span={10}>
                                              <Form.Item>
                                                <Input
                                                  value={val}
                                                  onChange={(e) => {
                                                    const { value } = e.target;
                                                    onChangeDimensionField({
                                                      index,
                                                      subIndex,
                                                      value,
                                                    });
                                                  }}
                                                />
                                              </Form.Item>
                                            </Col>
                                            <Col span={2}>
                                              {ButtonRemove(subIndex)}
                                            </Col>
                                          </Row>
                                        </Col>
                                      );
                                    }
                                  )}
                                </Row>

                                {dimension.values.length > 0 && (
                                  <Row gutter={24}>
                                    <Col span={6} />
                                    <Col span={6}>{ButtonAdd}</Col>
                                  </Row>
                                )}

                                <Divider />
                              </Fragment>
                            );
                          })}
                        </Collapse.Panel>
                      </Collapse>
                    )}
                  </Form.List>
                </Col>
              </Row>
            ) : (
              <></>
            )}
          </Form>

          <FormFooter
            okButton={{
              okText: isEditing ? "Actualizar" : "Guardar",
              onOk: form.submit,
            }}
            cancelButton={{
              cancelText: "Cancelar",
              cancelBackUrl: PATH_ROUTES.SEGMENTS,
              isCancelRedirect: true,
            }}
          />
        </Spin>
      </Col>

      <Col span={1} />
    </Row>
  );
}

export default function FormWrapper() {
  const itemId = useParams().id;
  const isEditing = itemId !== undefined;

  const { permissions } = useAuth();

  if (
    (isEditing && permissions.updateSegments) ||
    (!isEditing && permissions.addSegments)
  )
    return <CreateEdit />;

  return <Unauthorized />;
}
