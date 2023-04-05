import {
  Col,
  Row,
  Form,
  Select,
  Input as AntInput,
  Image,
  Spin,
  Checkbox,
} from "antd";
import Title from "components/templates/title/Title";
import Input from "components/single/Input/Input";
import Collapse from "components/single/collapse/Collapse";
import FormFooter from "components/templates/footer/FormFooter";
import Modal from "components/single/Modal/Modal";
import ModalIcon, { IconList } from "../ModalIcon";
import { RenderInputConfig } from "../InputConfig";
import Unauthorized from "pages/Unauthorized";
import useAuth from "hooks/useAuth";
import requestService from "services/requestService";
import { PATH_ROUTES } from "routes/config/Paths";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ServiceType,
  IServiceTypeConfigParam,
  IStringOrBooleanOrArrayRecord,
} from "types/ServiceType";
import {
  NotificationError,
  NotificationSuccess,
} from "components/single/notification/notifications";
import { Category } from "types/Category";
import { SecurityLevel, SecurityLevels } from "types/SecurityLeves";
import { availability, availabilities, allService } from "types/Disponibility";

/**Configuración de los parametros provenientes del tipo de servicio elegido */
export interface IConfig {
  key: string;
  value:
    | string
    | boolean
    | IStringOrBooleanOrArrayRecord
    | Array<IStringOrBooleanOrArrayRecord>;
}

interface IConfigFromTypeService {
  [key: string]:
    | "array"
    | "string"
    | "boolean"
    | { [key: string]: "array" | "boolean" | "string" };
}

export interface ChangeArrayItemParams {
  key: string;
  index: number;
  value: string;
}

export function Label({ value }: { value?: string }) {
  return <label>{value}</label>;
}

function RenderIcon({ value }: { value?: string }) {
  if (value === undefined) return <></>;

  const IconItem = IconList.find((t) => t.assetName === value);
  if (IconItem !== undefined)
    return (
      <Image
        src={require(`assets/icons-modal/${IconItem.assetName}`)}
        preview={false}
      />
    );

  return <></>;
}

function CreateEdit() {
  const itemId = useParams().id;
  const isEditing = itemId !== undefined;

  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [categorys, setCategorys] = useState<Category[]>([]);
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel[]>([]);
  const [aviabilities, setaviabilities] = useState<availability[]>([]);
  const [visibleModal, setVisibleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const navigate = useNavigate();

  /**
   * @description Use at store/update
   */
  function mapConfigToString(config: IConfig[] | undefined): string {
    if (config === undefined) return "{}";

    const nextObject: any = {};

    config.forEach(({ key, value }) => {
      if (typeof value === "boolean") {
        nextObject[key] = value;
        return;
      }

      if (typeof value === "object") {
        const nextObjectValue: IStringOrBooleanOrArrayRecord = {};

        Object.keys(value).forEach((key) => {
          if (Array.isArray(value)) return;

          const val = value[key];

          if (typeof val === "boolean") nextObjectValue[key] = val;

          if (typeof val === "string")
            if (val.length > 0) nextObjectValue[key] = val;

          if (Array.isArray(val)) {
            nextObjectValue[key] = val;
          }
        });

        if (Object.values(nextObjectValue).length > 0)
          nextObject[key] = nextObjectValue;
      }

      if (Array.isArray(value)) {
        if (value.length === 0) return;
        const nextValues = value.filter((item) => {
          const keys = Object.keys(item);
          const key = keys[0];
          const itemValue = item[keys[0]];

          if (typeof itemValue === "string")
            if (key.length > 0 && itemValue.length > 0) return true;

          return typeof itemValue === "boolean";
        });

        if (nextValues.length > 0) nextObject[key] = nextValues;
        return;
      }

      if (value.length > 0) {
        nextObject[key] = value;
        return;
      }
    });

    return JSON.stringify(nextObject);
  }

  /**
   *
   * @param config
   * @returns
   * @description use when fetch data to form
   */
  function mapConfigStringToArray(
    config: string,
    typeService?: ServiceType
  ): IConfig[] {
    const configOb = JSON.parse(config);

    const output: IConfig[] = [];

    Object.keys(configOb).forEach((key) => {
      output.push({
        key,
        value: configOb[key],
      });
    });

    if (typeService !== undefined) {
      const TypeServiceConfig: IConfigFromTypeService = JSON.parse(
        typeService.config
      );
      Object.keys(TypeServiceConfig).forEach((key: string) => {
        const configIndex = output.findIndex((t) => t.key === key);
        const config = output[configIndex];
        const hasKey = configIndex > -1;

        //Reconstruir la configuración que no se guardo vacia desde el tipo de servicio
        const serviceConfig = TypeServiceConfig[key];

        if (
          hasKey &&
          (serviceConfig === "array" ||
            serviceConfig === "boolean" ||
            serviceConfig === "string")
        )
          return;

        if (serviceConfig === "array") {
          output.push({
            key: key,
            value: [],
          });
        }

        if (serviceConfig === "string") {
          output.push({
            key: key,
            value: "",
          });
        }

        if (serviceConfig === "boolean") {
          output.push({
            key: key,
            value: false,
          });
        }

        if (typeof serviceConfig === "object") {
          const nextValue: { [key: string]: string | boolean | [] } = {};

          Object.keys(serviceConfig).forEach((key) => {
            //@ts-ignore
            const _value = config.value[key];
            //@ts-ignore
            if (_value !== undefined) {
              nextValue[key] = _value;
              return;
            }

            const value = serviceConfig[key];

            if (value === "string") nextValue[key] = "";

            if (value === "boolean") nextValue[key] = false;

            if (value === "array") {
              nextValue[key] = [];
            }
          });

          output[configIndex] = {
            key: key,
            value: nextValue,
          };
        }
      });
    }

    ////sort based on typeServiceConfiguration
    if (typeService !== undefined) {
      const TypeServiceConfig: IConfigFromTypeService = JSON.parse(
        typeService.config
      );

      const sorted: IConfig[] = [];

      const sortedHasKey = (key: string) => {
        return sorted.find((t) => t.key === key) !== undefined;
      };

      Object.keys(TypeServiceConfig).forEach((key) => {
        const nextConfig = output.find((t) => t.key === key);

        if (nextConfig !== undefined) sorted.push(nextConfig);
      });

      output.forEach(({ key }, index) => {
        if (sortedHasKey(key)) return;

        sorted.push(output[index]);
      });

      output.splice(0, output.length);
      output.push(...sorted);
    }

    return output;
  }

  function getConfigurationFromServiceType(
    serviceType: ServiceType | undefined
  ): IConfig[] {
    if (serviceType === undefined || serviceType === null) return [];

    const { config } = serviceType;

    const parsedConfig: IServiceTypeConfigParam = JSON.parse(config);

    const configOb: IConfig[] = [];

    Object.keys(parsedConfig).forEach((key) => {
      const item = parsedConfig[key];
      if (item === "string") {
        configOb.push({
          key,
          value: "",
        });
        return;
      }

      if (item === "boolean") {
        configOb.push({
          key,
          value: false,
        });
        return;
      }

      if (item === "array") {
        configOb.push({
          key,
          value: [],
        });
        return;
      }

      if (typeof item === "object") {
        const nextValue: { [key: string]: string | boolean | [] } = {};

        Object.keys(item).forEach((_key) => {
          if (typeof parsedConfig[key] === "object") {
            Object.keys(item).forEach((__key) => {
              const value = item[__key];

              if (value === "string") nextValue[__key] = "";

              if (value === "boolean") nextValue[__key] = false;

              if (value === "array") nextValue[__key] = [];
            });
          }
        });

        configOb.push({
          key,
          value: nextValue,
        });

        return;
      }
    });

    return configOb;
  }

  function onSelectServiceType(serviceType: ServiceType | undefined) {
    const config = getConfigurationFromServiceType(serviceType);
    form.setFieldsValue({ config });
  }

  //#region configFunctions
  //@todo Especificar el tipo
  function onAddItemToValue({ key }: { key: string }) {
    const config: IConfig[] = form.getFieldValue("config");

    if (Array.isArray(config)) {
      const index = config.findIndex((t) => t.key === key);

      if (index === -1) return;

      const { value } = config[index];

      if (Array.isArray(value)) {
        const nextValue = [...value, { "": "" }];

        config[index].value = nextValue;
        form.setFieldsValue({
          config: config,
        });
      }
    }
  }

  function onRemoveItem({ key, index }: { key: string; index: number }) {
    const config: IConfig[] = form.getFieldValue("config");

    if (Array.isArray(config)) {
      const mainIndex = config.findIndex((t) => t.key === key);
      const { value } = config[mainIndex];

      if (Array.isArray(value)) {
        value.splice(index, 1);
        config[mainIndex].value = value;

        form.setFieldsValue({
          config: config,
        });
      }
    }
  }

  /**
   *
   * @param param0
   * value Valor nuevo de la llave del objeto en el arreglo
   */
  function onChangeArrayKey({ key, index, value }: ChangeArrayItemParams) {
    const config: IConfig[] = form.getFieldValue("config");

    if (Array.isArray(config)) {
      const mainIndex = config.findIndex((t) => t.key === key);
      const currentValue = config[mainIndex].value;

      if (Array.isArray(currentValue)) {
        const item = currentValue[index];
        const internalValue = item[Object.keys(item)[0]];
        currentValue[index] = { [value]: internalValue };
        config[mainIndex].value = currentValue;

        form.setFieldsValue({
          config: config,
        });
      }
    }
  }

  function onChangeArrayItem({ key, index, value }: ChangeArrayItemParams) {
    const config: IConfig[] = form.getFieldValue("config");

    if (Array.isArray(config)) {
      const mainIndex = config.findIndex((t) => t.key === key);
      const currentValue = config[mainIndex].value;

      if (Array.isArray(currentValue)) {
        const currentOb = currentValue[index];
        const _key = Object.keys(currentOb)[0];

        currentValue[index][_key] = value;

        config[mainIndex].value = currentValue;

        form.setFieldsValue({
          config: config,
        });
      }
    }
  }

  function onChangeConfig({
    key,
    value,
  }: {
    key: string;
    value: string | boolean;
  }) {
    const config: IConfig[] = form.getFieldValue("config");

    if (Array.isArray(config)) {
      const mainIndex = config.findIndex((t) => t.key === key);
      const nextConfig = [...config];
      nextConfig[mainIndex].value = value;
      form.setFieldsValue({ config: nextConfig });
    }
  }

  function onChangeIArrayOrStringOrBooleanRecord({
    key,
    type,
    elementKey,
    value,
    elementSubKey,
    index,
  }: {
    key: string;
    type: "string" | "boolean" | "array";
    elementKey: string;
    value: string | boolean;
    elementSubKey?: string;
    index?: number;
  }) {
    const config: IConfig[] = form.getFieldValue("config");
    const nextConfig = [...config];

    if (Array.isArray(config)) {
      const mainIndex = config.findIndex((t) => t.key === key);
      const currentConfig: IConfig = nextConfig[mainIndex];

      if (type === "string" || type === "boolean") {
        //@ts-ignore
        currentConfig.value[elementKey] = value;
        nextConfig[mainIndex] = currentConfig;
        form.setFieldsValue({ config: nextConfig });
      }

      if (type === "array") {
        //@ts-ignore
        const _value = currentConfig.value[elementKey];

        //@ts-ignore
        const _key = Object.keys(_value[index]);

        if (elementSubKey !== undefined && _key[0] !== elementSubKey) {
          //@ts-ignore
          currentConfig.value[elementKey][index] = {};
        }

        //@ts-ignore
        currentConfig.value[elementKey][index][elementSubKey] = value;

        nextConfig[mainIndex] = currentConfig;
        form.setFieldsValue({ config: nextConfig });
      }
    }
  }

  function onAddToIArrayRecord({
    key,
    elementKey,
    type,
  }: {
    key: string;
    elementKey: string;
    type: "string" | "boolean";
  }) {
    const config: IConfig[] = form.getFieldValue("config");
    const nextConfig = [...config];
    const mainIndex = config.findIndex((t) => t.key === key);
    const currentConfig: IConfig = nextConfig[mainIndex];

    if (type === "string")
      //@ts-ignore
      currentConfig.value[elementKey].push({ "": "" });

    nextConfig[mainIndex] = currentConfig;
    form.setFieldsValue({ config: nextConfig });
  }

  function onRemoveFromIArrayRecord({
    key,
    elementKey,
    index,
  }: {
    key: string;
    elementKey: string;
    index: number;
  }) {
    Modal.confirm({
      title: "Remover",
      content: "¿Desea remover el elemento?",
      onOk: remove,
    });

    function remove() {
      const config: IConfig[] = form.getFieldValue("config");
      const nextConfig = [...config];

      const mainIndex = config.findIndex((t) => t.key === key);
      const currentConfig: IConfig = nextConfig[mainIndex];

      //@ts-ignore
      const _value: Array<IStringOrBooleanOrArrayRecord> = currentConfig.value[elementKey];

      _value.splice(index, 1);

      //@ts-ignore
      currentConfig.value[elementKey] = _value;

      nextConfig[mainIndex] = currentConfig;
      form.setFieldsValue({ config: nextConfig });
    }
  }
  //#endregion

  function onSelectIcon(icon: string) {
    form.setFieldsValue({ icon: icon });
  }

  function onSubmit() {
    Modal.confirm({
      title: isEditing ? "Actualizar" : "Guardar",
      content: isEditing
        ? "¿Desea actualizar el servicio?"
        : "¿Desea guardar el nuevo servicio?",
      onOk: () => onConfirmSubmit(),
    });
  }

  async function onConfirmSubmit() {
    try {
      const values = form.getFieldsValue();
      const { config, icon, isPublic, categories, ...rest } = values;
      await requestService({
        url: isEditing ? `/services/${itemId}` : "/services",
        method: isEditing ? "PUT" : "POST",
        payload: {
          definition: mapConfigToString(config),
          iconUrl: icon,
          isPublic: isPublic === undefined ? false : isPublic,
          categories,
          ...rest,
        },
      });

      NotificationSuccess({
        title: isEditing ? "Actualizado" : "Creado",
        description: isEditing
          ? "El servicio ha sido actualizado"
          : "El servicio ha sido creado",
      });
      navigate(PATH_ROUTES.SERVICES);
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

  async function getServiceTypes() {
    try {
      const res = await requestService({
        url: "types-service",
      });

      setServiceTypes(res);
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

  async function getCategorys() {
    try {
       const res = await requestService({
        url: "/category",
      });
      setCategorys(res);
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

  async function getSecurityLeves() {
    try {
      const res = SecurityLevels;
      setSecurityLevel(res);
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

  async function getAviability() {
    try {
      const res = availabilities;
      setaviabilities(res);
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
    getCategorys();
    getAviability();
    getServiceTypes();
    getSecurityLeves();
  }, []);

  useEffect(() => {
    async function getService() {
      try {
        setLoading(true);
        const res = await requestService({
          url: `/services/${itemId}`,
        });

        const {
          definition,
          description,
          typeService,
          name,
          isPublic,
          iconUrl,
          securityLevel,
          aviability,
          categories,
        } = res;
        form.setFieldsValue({
          config: mapConfigStringToArray(definition, typeService),
          typeService: typeService?._id,
          description,
          name,
          isPublic,
          icon: iconUrl,
          securityLevel,
          aviability: !aviability.includes(allService)?aviability:[],
          categories: categories.map((category : Category) => category._id),
        });

        setTimeout(() => {
          form.setFieldsValue({
            non_valid_key: "",
          });
        }, 200);
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
      getService();
      return;
    }
  }, [isEditing]);

  return (
    <Spin spinning={loading}>
      <Row>
        <Col span={1} />
        <Col span={22}>
          <Title
            type="form"
            text={isEditing ? "Actualizar servicio" : "Nuevo servicio"}
            backButton={{
              isRedirect: true,
              url: PATH_ROUTES.SERVICES,
            }}
          />

          <Form form={form} layout="vertical" onFinish={onSubmit}>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Nombre del servicio"
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
                  name="typeService"
                  label="Tipo de servicio"
                  rules={[
                    {
                      required: true,
                      message: "Campo requerido",
                    },
                  ]}
                >
                  <Select
                    showSearch={true}
                    optionFilterProp="children"
                    onSelect={(e: string) =>
                      onSelectServiceType(serviceTypes.find((t) => t._id === e))
                    }
                    placeholder="Seleccione un tipo de servicio"
                  >
                    {serviceTypes.map(({ _id, name }) => (
                      <Select.Option key={_id} value={_id}>
                        {name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

{/*               <Col span={12}>
                <Form.Item
                  name="isPublic"
                  label="Publicado"
                  valuePropName="checked"
                >
                  <Checkbox defaultChecked={false} />
                </Form.Item>
              </Col> */}

              <Col span={12}>
                <Form.Item
                  label="Icono"
                  name="icon"
                  rules={[{ required: true, message: "Campo requerido" }]}
                >
                  <Select
                    onClick={() => setVisibleModal(true)}
                    placeholder="Seleccione un ícono prediseñado"
                  />
                </Form.Item>

                <Form.Item name="icon">
                  <RenderIcon />
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
                  <AntInput.TextArea
                    placeholder="Inserte un texto descriptivo"
                    rows={5}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="categories"
                  label="Categoria"
                  rules={[
                    {
                      required: true,
                      message: "Campo requerido",
                    },
                  ]}
                >
                  <Select
                    mode="multiple"
                  >
                    {categorys.map(({_id,name}) => (
                      <Select.Option key={_id} value={_id}>
                        {name}
                      </Select.Option>
                    ))
                    }
                  </Select>
                </Form.Item>
                <Form.Item
                  name="securityLevel"
                  label="Nivel de Seguridad"
                  rules={[
                    {
                      required: true,
                      message: "Campo requerido",
                    },
                  ]}
                >
                  <Select>
                    {securityLevel.map(({code,name}) => (
                      <Select.Option key={code} value={code}>
                        {name}
                      </Select.Option>
                    ))
                    }
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
              <Form.Item
                  name="aviability"
                  label="Disponibilidad"
                >
                  <Select mode="multiple" allowClear>
                    {aviabilities.map(({code,name}) => (
                      <Select.Option key={code} value={code}>
                        {name}
                      </Select.Option>
                    ))
                    }
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
                        <Row gutter={24}>
                          {fields.map(({ key, name, ...restField }, index) => {
                            const item = form.getFieldValue("config")[index];
                            const formKey: string = item.key;
                            const requireAuth: boolean = (() => {
                              const definition = form.getFieldValue("config");

                              if (Array.isArray(definition)) {
                                const requireAuthField: IConfig =
                                  definition.find(
                                    (t) => t.key === "requireAuth"
                                  );
                                if (requireAuthField !== undefined)
                                  if (
                                    typeof requireAuthField.value === "boolean"
                                  )
                                    return requireAuthField.value;
                              }

                              return false;
                            })();

                            if (
                              item.key === "configAuth" &&
                              requireAuth === false
                            )
                              return null;

                            return (
                              <Col span={12} key={key}>
                                <Form.Item name={[name, "value"]}>
                                  <RenderInputConfig
                                    key={index}
                                    Key={formKey}
                                    onAddItemToValue={onAddItemToValue}
                                    onRemoveItem={onRemoveItem}
                                    onChangeArrayKey={onChangeArrayKey}
                                    onChangeArrayItem={onChangeArrayItem}
                                    onChangeConfig={onChangeConfig}
                                    onChangeIArrayOrStringOrBooleanRecord={
                                      onChangeIArrayOrStringOrBooleanRecord
                                    }
                                    onAddToIArrayRecord={onAddToIArrayRecord}
                                    onRemoveFromIArrayRecord={
                                      onRemoveFromIArrayRecord
                                    }
                                  />
                                </Form.Item>
                              </Col>
                            );
                          })}
                        </Row>
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
              cancelBackUrl: PATH_ROUTES.SERVICES,
            }}
          />
        </Col>
        <Col span={1} />

        <ModalIcon
          visible={visibleModal}
          onCancel={() => setVisibleModal(false)}
          onSelectIcon={onSelectIcon}
        />
      </Row>
    </Spin>
  );
}

export default function FormWrapper() {
  const itemId = useParams().id;
  const isEditing = itemId !== undefined;

  const { permissions } = useAuth();

  if (
    (isEditing && permissions.updateServices) ||
    (!isEditing && permissions.addServices)
  )
    return <CreateEdit />;

  return <Unauthorized />;
}
