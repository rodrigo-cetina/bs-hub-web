import { Col, Row, Form, Select, Spin } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { ButtonAnt } from "components/single/button/Button";
import Title from "components/templates/title/Title";
import Input from "components/single/Input/Input";
import Collapse from "components/single/collapse/Collapse";
import FormFooter from "components/templates/footer/FormFooter";
import Modal from "components/single/Modal/Modal";
import Unauthorized from "pages/Unauthorized";
import requestService from "services/requestService";
import { PATH_ROUTES } from "routes/config/Paths";
import useAuth from "hooks/useAuth";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { serviceEventType } from "types/ServiceType";
import { elementKeyValue } from "types/DimensionObject";
import {
  NotificationError,
  NotificationSuccess,
} from "components/single/notification/notifications";

interface EventOpt {
  name: string;
  value: serviceEventType;
}

const events: EventOpt[] = [
  {
    name: "Llamada a API",
    value: "Api-call",
  },
  {
    name: "Abrir aplicación",
    value: "Open-app",
  },
  {
    name: "Abrir dirección web",
    value: "Open-web",
  },
  {
    name: "Llamada inicial",
    value: "Boot-call",
  },
];

interface IConfigParam {
  key: string;
  value: "string" | "array";
}

export const dataTypes = ["string", "array",'boolean'];

function CreateEdit() {
  const itemId = useParams().id;
  const isEditing = itemId !== undefined;
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();
  const navigate = useNavigate();

  /**
   * @description Use at store/update
   */
  function mapConfigToString(config: IConfigParam[] | undefined): string {
    if (config === undefined) return "[]";

    const outputConfig: elementKeyValue = {};

    config.forEach(({ key, value }) => {
      outputConfig[key] = value;
    });

    return JSON.stringify(outputConfig);
  }

  /**
   *
   * @param config
   * @returns
   * @description use when fetch data to form
   */
  function mapConfigStringToArray(config: string): IConfigParam[] {
    const parsed = JSON.parse(config);

    const output: IConfigParam[] = [];

    if (typeof parsed === "object") {
      Object.keys(parsed).forEach((key) => {
        const value = parsed[key];
        output.push({
          key,
          value,
        });
      });
    }

    return output;
  }

  function onSubmit() {
    Modal.confirm({
      title: isEditing ? "Actualizar" : "Guardar",
      content: isEditing
        ? "¿Desea actualizar el tipo de servicio?"
        : "¿Desea guardar el nuevo tipo de servicio?",
      onOk: () => onConfirmSubmit(),
    });
  }

  async function onConfirmSubmit() {
    try {
      const { config, ...rest } = form.getFieldsValue();

      await requestService({
        url: isEditing ? `/types-service/${itemId}` : "/types-service",
        method: isEditing ? "PUT" : "POST",
        payload: {
          config: mapConfigToString(config),
          ...rest,
        },
      });

      NotificationSuccess({
        title: isEditing ? "Actualizado" : "Creado",
        description: isEditing
          ? "El tipo de servicio ha sido actualizado"
          : "El tipo de servicio ha sido creado",
      });
      navigate(PATH_ROUTES.SERVICE_TYPES);
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

  useEffect(() => {
    async function getServiceType() {
      try {
        setLoading(true);
        const res = await requestService({
          url: `/types-service/${itemId}`,
        });

        const { config, description, event, name } = res;

        form.setFieldsValue({
          config: mapConfigStringToArray(config),
          description: description,
          event: event,
          name: name,
        });
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
    <Row>
      <Col span={1} />
      <Col span={22}>
        <Spin spinning={loading}>
          <Title
            type="form"
            text={
              isEditing
                ? "Actualizar tipo de servicio"
                : "Nuevo tipo de servicio"
            }
            backButton={{
              isRedirect: true,
              url: PATH_ROUTES.SERVICE_TYPES,
            }}
          />

          <Form form={form} layout="vertical" onFinish={onSubmit}>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Nombre del tipo de servicio"
                  rules={[
                    {
                      required: true,
                      message: "Campo requerido",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="description"
                  label="Descripción"
                  rules={[
                    {
                      required: true,
                      message: "Campo requerido",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="event"
                  label="Evento"
                  rules={[
                    {
                      required: true,
                      message: "Campo requerido",
                    },
                  ]}
                >
                  <Select>
                    {events.map(({ name, value }) => (
                      <Select.Option key={value} value={value}>
                        {name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={24}>
                <Collapse>
                  <Collapse.Panel key="" header="Configuración">
                    <Form.List name="config">
                      {(fields, { add, remove }) => (
                        <>
                          <Row gutter={24}>
                            {fields.map(
                              ({ key, name, ...restField }, index) => {
                                return (
                                  <Col span={12}>
                                    <Row gutter={24} key={key}>
                                      <Col span={10}>
                                        <Form.Item
                                          name={[name, "key"]}
                                          label="Nombre del campo"
                                          rules={[
                                            {
                                              required: true,
                                              message: "Campo requerido",
                                            },
                                          ]}
                                        >
                                          <Input />
                                        </Form.Item>
                                      </Col>

                                      <Col span={10}>
                                        <Form.Item
                                          name={[name, "value"]}
                                          label="Tipo de dato"
                                          rules={[
                                            {
                                              required: true,
                                              message: "Campo requerido",
                                            },
                                          ]}
                                        >
                                          <Select>
                                            {dataTypes.map((data_type) => (
                                              <Select.Option key={data_type}>
                                                {data_type}
                                              </Select.Option>
                                            ))}
                                          </Select>
                                        </Form.Item>
                                      </Col>

                                      <Col span={2}>
                                        <Form.Item label=" ">
                                          <ButtonAnt
                                            icon={<DeleteOutlined />}
                                            onClick={() =>
                                              Modal.confirm({
                                                title: "Remover parametro",
                                                content:
                                                  "¿Desea remover el parametro?",
                                                onOk: () => remove(index),
                                              })
                                            }
                                            tooltip="Remover"
                                          />
                                        </Form.Item>
                                      </Col>
                                    </Row>
                                  </Col>
                                );
                              }
                            )}
                          </Row>

                          <Row gutter={24}>
                            <Col span={24}>
                              <ButtonAnt
                                text="Agregar"
                                onClick={() => {
                                  add("");
                                }}
                              />
                            </Col>
                          </Row>
                        </>
                      )}
                    </Form.List>
                  </Collapse.Panel>
                </Collapse>
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
              cancelBackUrl: PATH_ROUTES.SERVICE_TYPES,
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
    (isEditing && permissions.updateServiceTypes) ||
    (!isEditing && permissions.addServiceTypes)
  )
    return <CreateEdit />;

  return <Unauthorized />;
}
