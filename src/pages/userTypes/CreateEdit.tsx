import { Col, Form, Row, Spin } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { ButtonAnt } from "components/single/button/Button";
import ItemForm from "components/single/itemForm/ItemForm";
import Input from "components/single/Input/Input";
import modal from "components/single/Modal/Modal";
import Title from "components/templates/title/Title";
import Collapse from "components/single/collapse/Collapse";
import FormFooter from "components/templates/footer/FormFooter";
import Unauthorized from "pages/Unauthorized";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "hooks/useAuth";
import requestService from "services/requestService";
import { PATH_ROUTES } from "routes/config/Paths";
import {
  NotificationError,
  NotificationSuccess,
} from "components/single/notification/notifications";

interface CatDimension {
  name: string;
  value: string;
}

interface FormProps {
  name: string;
  catDimensions: CatDimension[];
}

/**
 *
 * @param dimensions
 * @returns
 * @description use at store/update
 */
function mapCatDimensionsArrayToString(dimensions: CatDimension[]) {
  const ob: any = {};

  dimensions.forEach(({ name, value }) => {
    ob[name] = value;
  });

  return JSON.stringify(ob);
}

/**
 *
 * @param dimensions
 * @returns
 * @description Use when getting from server to update
 */
export function mapCatDimensionsStringToArray(
  dimensions: string
): CatDimension[] {
  const ob = JSON.parse(dimensions);

  const keys = Object.keys(ob);

  const output: CatDimension[] = [];

  keys.forEach((key) => {
    output.push({
      name: key,
      value: ob[key],
    });
  });

  return output;
}

function CreateEdit() {
  const itemId = useParams().id;
  const isEditing = itemId !== undefined;
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: FormProps) => {
    modal.confirm({
      title: `${isEditing ? "Actualizar" : "Guardar"}`,
      content: `¿Desea ${isEditing ? "actualizar" : "guardar"} el elemento?`,
      onOk: () => onConfirmSumbit(values),
    });
  };

  const onConfirmSumbit = async (values: FormProps) => {
    try {
      await requestService({
        url: isEditing ? `/user-type/${itemId}` : "/user-type",
        payload: {
          name: values.name,
          catDimensions: mapCatDimensionsArrayToString(values.catDimensions),
        },
        method: isEditing ? "PUT" : "POST",
      });

      NotificationSuccess({
        title: isEditing ? "Actualizado" : "Creado",
        description: isEditing
          ? "El tipo de usuario ha sido actualizado"
          : "El tipo de usuario ha sido registrado",
      });
      navigate(PATH_ROUTES.USER_TYPES);
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message)
        NotificationError({
          title: `Error al ${isEditing ? "actualizar" : "guardar"}`,
          description: error.response.data.message,
        });
    }
  };

  function getNextCatDimension(): CatDimension {
    const catDimensions: CatDimension[] | undefined =
      form.getFieldValue("catDimensions");

    const firstCatDimension: CatDimension = {
      name: "Dim1",
      value: "",
    };

    if (catDimensions === undefined) return firstCatDimension;

    if (catDimensions.length === 0) return firstCatDimension;

    function getNumbers(): number[] {
      const numbers: number[] = [];

      catDimensions?.forEach((dim) => {
        const nextNumber = Number(dim.name.substring(3));
        numbers.push(nextNumber);
      });
      return numbers;
    }

    const numbers = getNumbers();
    const sorted = numbers.sort((a, b) => a - b);
    const biggest = sorted[sorted.length - 1];

    return {
      name: `Dim${biggest + 1}`,
      value: "",
    };
  }

  useEffect(() => {
    async function getUserType() {
      try {
        setLoading(true);
        const res = await requestService({
          url: `user-type/${itemId}`,
        });
        const { name, catDimensions } = res;

        form.setFieldsValue({
          name,
          catDimensions: mapCatDimensionsStringToArray(catDimensions),
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

    if (isEditing) {
      getUserType();
      return;
    }

    form.setFieldsValue({
      catDimensions: [],
    });
  }, [isEditing]);

  function Label({ value }: { value?: string }) {
    return <label>{value}</label>;
  }

  return (
    <Row>
      <Col span={1} />

      <Col span={22}>
        <Spin spinning={loading}>
          <Title
            text={
              isEditing ? "Actualizar tipo de usuario" : "Nuevo tipo de usuario"
            }
            type="form"
            backButton={{
              isRedirect: true,
              url: PATH_ROUTES.USER_TYPES,
            }}
          />

          <Form layout="vertical" onFinish={handleSubmit} form={form}>
            <Row>
              <Col span={22}>
                <ItemForm
                  name="name"
                  label="Nombre"
                  rules={[
                    { required: true, message: "Escriba el nombre" },
                    {
                      whitespace: true,
                      message: "El nombre no puede ser un espacio",
                    },
                  ]}
                >
                  <Input placeholder="Nombre" />
                </ItemForm>
              </Col>

              <Col span={24}>
                <Form.List name="catDimensions">
                  {(fields, { add, remove }, { errors }) => (
                    <Collapse defaultActiveKey="dimensiones">
                      <Collapse.Panel header="Dimensiones" key="dimensiones">
                        <Row gutter={24}>
                          {fields.map(({ key, name, ...restField }, index) => {
                            return (
                              <Col span={12}>
                                <Row gutter={24} key={index}>
                                  <Col span={12}>
                                    <Form.Item name={[name, "name"]}>
                                      <Label />
                                    </Form.Item>
                                  </Col>

                                  <Col span={10}>
                                    <Form.Item
                                      name={[name, "value"]}
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
                                  <Col span={2}>
                                    <ButtonAnt
                                      isRedirect={false}
                                      onClick={() => remove(index)}
                                      icon={<DeleteOutlined />}
                                    />
                                  </Col>
                                </Row>
                              </Col>
                            );
                          })}
                        </Row>

                        <ButtonAnt
                          bClassName="btn_primary"
                          text="Añadir dimensión"
                          isRedirect={false}
                          onClick={() => {
                            const next = getNextCatDimension();
                            add(next);
                          }}
                        />
                      </Collapse.Panel>
                    </Collapse>
                  )}
                </Form.List>
              </Col>
            </Row>
          </Form>

          <FormFooter
            cancelButton={{
              isCancelRedirect: true,
              cancelBackUrl: PATH_ROUTES.USER_TYPES,
              cancelText: "Cancelar",
            }}
            okButton={{
              onOk: form.submit,
              okText: isEditing ? "Actualizar" : "Guardar",
            }}
          />
        </Spin>
      </Col>

      <Col span={1} />
    </Row>
  );
}

export default function FormWrapper() {
  const { permissions } = useAuth();

  const itemId = useParams().id;
  const isEditing = itemId !== undefined;

  if (
    (isEditing && permissions.updateUserTypes) ||
    (!isEditing && permissions.addUserTypes)
  )
    return CreateEdit();

  return <Unauthorized />;
}
