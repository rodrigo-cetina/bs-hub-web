import Grid from "components/single/Grid/Grid";
import ModalCustome from "components/single/Modal/Modal";
import ModalForm from "components/single/Modal/ModalForm";
import { Modal, Button, Select } from "antd"
import { ButtonAnt } from "components/single/button/Button";
import { Col, Form, Row, Switch } from "antd";
import {
  FormOutlined,
  FolderAddOutlined,
  FolderViewOutlined,
  FolderOpenOutlined,
  UpOutlined,
  DownOutlined,
  DeleteFilled,
} from "@ant-design/icons";
import Title from "components/templates/title/Title";
import SearchBar from "components/templates/searchbar/SearchBar";
import Unauthorized from "pages/Unauthorized";
import { useState, useEffect, useReducer } from "react";
import requestService from "services/requestService";
import { PATH_ROUTES } from "routes/config/Paths";
import replace from "utils/array/replace";
import remove from "utils/array/remove";
import GetSelectList from "utils/array/getSelectList";
import useAuth from "hooks/useAuth";
import { Segment } from "types/Segment";
import { SegmentDimensionObj, elementKeyValue } from "types/DimensionObject";
import { UserType } from "types/UserType";
import {
  NotificationError,
  NotificationSuccess,
} from "components/single/notification/notifications";
import { Profile } from "types/Profile";
import Input from "components/single/Input/Input";
import FormFooter from "components/templates/footer/FormFooter";
import FormProfile from "pages/profile/CreateEdit";
import { SecurityLevel, SecurityLevels } from "types/SecurityLeves";
import { useNavigate } from "react-router-dom";

const { Option } = Select;


interface ActiveParams {
  _id: string;
  isActive: boolean;
}

interface ArchiveParams {
  _id: string;
  isArchived: boolean
}

interface DeleteParams {
  _id: string;
}

interface CreateParams {
  userId: string
  userTypes: string[]
  isSuperUser: boolean
}

interface CatDimensionWithValues {
  /**Nombre del DimN (Dim1, Dim2...) */
  name: string;

  /**Campo que representa el DimN */
  value: string;

  /**Arreglo de valores en el campo/dim */
  values: string[];
}

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


function List({ ...props }: CreateParams) {
  const [data, setData] = useState<Profile[]>([]);
  const [showingDetails, , isShowingDetail, onClickShowDetail] =
    GetSelectList<string>();
  const [archived, setArchived] = useState(false);
  const [profileId, setProfileId] = useState("");
  const [loadingTable, setLoadingTable] = useState(false);
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const { permissions } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [IsUpdate, setIsUpdate] = useState(false)
  const [listTypes, setListTypes] = useState<string[]>([])
  const [form] = Form.useForm();
  const [refreshKey, setRefreshKey] = useState(0)
  const [modalKey, setModalKey] = useState(0)
  const types : string[] = props.userTypes
  const superUser = props.isSuperUser
  const userId = props.userId;
  const navigate = useNavigate();

  const showModal = (_id?: string) => {
    setModalKey(oldKey => oldKey + 1);
    if (_id) {
      setProfileId(_id);
      setIsUpdate(true);
    }
    else {
      setProfileId("")
      setIsUpdate(false)
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  function onClickActive({ _id, isActive }: ActiveParams) {
    ModalCustome.confirm({
      title: isActive ? "Desactivar" : "Activar",
      content: `¿Desea ${isActive ? "desactivar" : "activar"
        } el perfil?`,
      onOk: () => onConfirmActive({ _id, isActive }),
    });
  }

  function onSubmit(_id?: string) {
    Modal.confirm({
      title: IsUpdate ? "Actualizar" : "Guardar",
      content: `¿Desea ${IsUpdate ? "actualizar" : "guardar"} el perfil?`,
      onOk: () => storeOrUpdate(profileId)
    });
  }

  async function storeOrUpdate(_id?: string) {
    try {
      const { idOrigen, userType, dimensions, securityLevel } = form.getFieldsValue();
      const obDimensions: elementKeyValue = {};
      dimensions.forEach(({ dimName, value }: any) => {
        obDimensions[dimName] = value;
      });
      await requestService({
        url: IsUpdate ? `/profiles/${_id}` : "/profiles",
        method: IsUpdate ? "PUT" : "POST",
        payload: {
          userId,
          userTypeId: userType,
          idOrigen,
          dimensions: JSON.stringify(obDimensions),
          securityLevel
        },
      });
      NotificationSuccess({
        title: IsUpdate ? "Actualizado" : "Creado",
        description: `El perfil ha sido ${IsUpdate ? "actualizado" : "creado"
          }`,
      });
      form.resetFields();
      setRefreshKey(oldKey => oldKey + 1);
      setModalKey(oldKey => oldKey + 1);
      handleCancel()
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        NotificationError({
          title: `Error al ${IsUpdate ? "actualizar" : "crear"}`,
          description: error.response.data.message,
        });
      }
      handleCancel();
    }
  }

  async function onConfirmActive({ _id, isActive }: ActiveParams) {
    try {
      await requestService({
        url: `/profiles/${_id}/set-active`,
        payload: {
          isActive: !isActive,
        },
        method: "PATCH",
      });

      replace({
        data,
        setData,
        id: _id,
        idField: "_id",
        attributesToReplace: { isActive: !isActive },
      });
      setRefreshKey(oldKey => oldKey + 1);
      ModalCustome.success({
        title: isActive ? "Desactivado" : "Activado",
        content: `El perfil ha sido ${isActive ? "desactivado" : "activado"}`,
      });
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        NotificationError({
          title: `Error al ${isActive ? "desactivar" : "activar"}`,
          description: error.response.data.message,
        });
      }
    }
  }

  function onClickArchive({ _id, isArchived }: ArchiveParams) {
    ModalCustome.confirm({
      title: archived ? "Recuperar" : "Archivar",
      content: `¿Desea ${archived ? "recuperar" : "archivar"
        } el perfil ?`,
      onOk: () => onConfirmArchive({ _id, isArchived }),
    });
  }

  async function onConfirmArchive({ _id, isArchived }: ArchiveParams) {
    try {
      await requestService({
        url: `/profiles/${_id}/set-archived`,
        payload: {
          isArchived: !isArchived,
        },
        method: "PATCH",
      });
      setRefreshKey(oldKey => oldKey + 1);
      remove({
        data,
        setData,
        id: _id,
        idField: "_id",
      });

      ModalCustome.success({
        title: archived ? "Recuperado" : "Archivado",
        content: `El perfil ha sido ${archived ? "recuperado" : "archivado"
          }`,
      });
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        NotificationError({
          title: `Error al ${archived ? "recuperar" : "archivar"}`,
          description: error.response.data.message,
        });
      }
    }
  }

  function onClickDelete({ _id }: DeleteParams) {
    ModalCustome.confirm({
      title: "Eliminar",
      content: `¿Desea eliminar el perfil?`,
      onOk: () => onConfirmDelete({ _id }),
    });
  }


  const getSecurityLevel = (code: number) => {
    try {
      setLoadingTable(true);
      const res = SecurityLevels.find((obj): any => {
        if (obj.code === code) {
          return obj;
        }
      })
      setLoadingTable(false);
      return res;
    }
    catch (error: any) {
      setLoadingTable(false);
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

  async function onConfirmDelete({ _id }: DeleteParams) {
    try {
      await requestService({
        url: `/profiles/${_id}/delete`,
        method: "DELETE",
      });

      remove({
        data,
        setData,
        id: _id,
        idField: "_id",
      });
      setRefreshKey(oldKey => oldKey + 1);
      NotificationSuccess({
        title: "Eliminado",
        description: `El perfil se ha eliminado`,
      });

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


  const columns = [
    {
      title: "Origen",
      dataIndex: "idOrigen",
      key: "idOrigen"
    },
    {
      title: "Tipo",
      dataIndex: "userType",
      key: "userType",
      render: function (value: any) {
        return value?.name;
      }
    },
    {
      title: "Nivel de seguridad",
      dataIndex: "securityLevel",
      key: "securityLevel",
      render: function (value: any) {
        const level = getSecurityLevel(value);
        return level?.name;
      }
    },
    {
      title: "Acciones",
      render: function (value: Profile) {
        const { _id, isActive } = value;
        const showingDetail = isShowingDetail(_id);

        if (archived) {
          return (
            <>
              <ButtonAnt
                icon={<FolderOpenOutlined />}
                tooltip="Recuperar"
                isRedirect={false}
                onClick={() => onClickArchive(value)}
                disabled={!permissions.recallSegments}
              />
            </>
          );
        }
        return (
          <>
            <Switch
              checked={isActive}
              onClick={() => onClickActive(value)}
              disabled={!permissions.setActiveSegments}
            />
            <ButtonAnt
              icon={<FormOutlined />}
              tooltip="Editar"
              isRedirect={false}
              onClick={() => { showModal(_id) }}
              disabled={!permissions.updateSegments}
            />
            {/* <ButtonAnt
              icon={<FolderAddOutlined />}
              tooltip="Archivar"
              isRedirect={false}
              onClick={() => onClickArchive(value)}
              disabled={!permissions.archiveSegments}
            /> */}
            <ButtonAnt
              icon={<DeleteFilled />}
              tooltip="Eliminar"
              isRedirect={false}
              onClick={() => onClickDelete(value)}
              disabled={!permissions.deleteProfiles}
            />
          </>
        );
      }
    },
    {
      title: "Creado",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Actualizado",
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
  ]

  function validProfiles(res : any[] = []){
    const rest : any[] = []
    if (types.length > 0 || superUser) {
      res.forEach((profile: any, index: any, array: any) => {
        if(types.includes(profile.userType._id) || superUser){
          rest.push(profile)
        }
      });
      return rest;
    }
    return res
  }

  const getProfiles = async () => {
    try {
      const listUserTypes: string[] | null = [];
      setLoadingTable(true);
      /* const res = Profiles; */
      const res = await requestService({
        url: archived ? '/profiles/archived' : '/profiles?userid=' + userId,
      })
/*       if (types.length > 0) {
        res.forEach((profile: any, index: any, array: any) => {
          if(types.includes(profile.userType._id)){
            rest.push(profile)
          }
        });
      } */
      const rest = validProfiles(res);
      rest.forEach((profile: any) => {
        listUserTypes?.push(profile.userType._id)
      });
      setListTypes(listUserTypes);
      setData(rest);
      setLoadingTable(false);
    }
    catch (error: any) {
      setLoadingTable(false);
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
    getProfiles();
  }, [archived, refreshKey])

  return (
    <Row>
      <Col span={1} />
      <Col span={22}>
        <Title
          text={
            archived
              ? "Perfiles (archivados)"
              : "Perfiles"
          }
          type={archived ? "form" : "main"}
          backButton={
            archived
              ? {
                isRedirect: false,
                onClick: () => setArchived(false),
              }
              : undefined
          }
        />
        <SearchBar
          onSearch={() => getProfiles()}
          loading={loadingTable}
          addButton={{
            onClick: () => showModal(),
          }}
         /*  additionalButtons={
            archived
              ? []
              : [
                {
                  tooltip: "Archivados",
                  icon: <FolderViewOutlined />,
                  onClick: () => setArchived(true),
                },
              ]
          } */
        />
        <Grid
          data={data}
          columns={columns}
          loading={loadingTable}
          pagination={{
            position: ["bottomRight"],
            showSizeChanger: true,
            locale:{items_per_page:"/ pag"}
          }}
          expandedRowKeys={showingDetails}
          rowKey={"_id"}
        />
      </Col>

      <Col span={1} />
      <ModalForm
        onCancel={handleCancel}
        onOk={onSubmit}
        title="Crear Perfiles"
        visible={isModalOpen}
        children={<FormProfile
          isUpdate={IsUpdate}
          profileId={profileId}
          form={form}
          listTypes={listTypes}
          refreshKey={modalKey}
          userTypes={types}
          isSuperUser={superUser}
        />}
        htmlType="submit"
        okText={IsUpdate ? "Actualizar Perfil" : "Crear Perfil"}
      />
    </Row>
  );

}

export default function Wrapper({ ...props }: CreateParams) {
  const { userTypes, isSuperUser } = props
  return <List userId={props.userId} userTypes={userTypes} isSuperUser={isSuperUser} />;
}