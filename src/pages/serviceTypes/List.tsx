import { Col, Row, Switch, Tooltip } from "antd";
import {
  FormOutlined,
  DeleteFilled,
  FolderAddOutlined,
  FolderOpenOutlined,
  FolderViewOutlined,
} from "@ant-design/icons";
import Title from "components/templates/title/Title";
import SearchBar from "components/templates/searchbar/SearchBar";
import Grid from "components/single/Grid/Grid";
import Modal from "components/single/Modal/Modal";
import { ButtonAnt } from "components/single/button/Button";
import Unauthorized from "pages/Unauthorized";
import { PATH_ROUTES } from "routes/config/Paths";
import requestService from "services/requestService";
import { useState, useEffect } from "react";
import useAuth from "hooks/useAuth";
import remove from "utils/array/remove";
import replace from "utils/array/replace";
import { ServiceType } from "types/ServiceType";
import {
  NotificationError,
  NotificationSuccess,
} from "components/single/notification/notifications";
import { ErrorCodes } from "utils/errosCodes";

interface IRemoveParams {
  _id: string;
  name: string;
}

interface IArchiveParams {
  _id: string;
  name: string;
  isArchived: boolean;
}

interface IActiveParams {
  _id: string;
  name: string;
  isActive: boolean;
}

function List() {
  const [archived, setArchived] = useState(false);
  const [data, setData] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(false);

  const { permissions } = useAuth();

  async function getData(params?: { name?: string }) {
    try {
      setLoading(true);
      if(params?.name){
        params.name = params.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      }
      const res = await requestService({
        url: archived ? "types-service/archived" : "types-service",
        params: params,
      });

      setData(res);
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
    getData();
  }, [archived]);

  function onDelete({ _id, name }: IRemoveParams) {
    Modal.confirm({
      title: "Eliminar",
      content: `¿Desea eliminar el tipo de servicio ${name}?`,
      onOk: () => onConfirmDelete({ _id, name }),
    });
  }

  async function onConfirmDelete({ _id, name }: IRemoveParams) {
    try {
      await requestService({
        url: `/types-service/${_id}`,
        method: "DELETE",
      });

      remove({
        data,
        setData,
        id: _id,
        idField: "_id",
      });

      NotificationSuccess({
        title: "Eliminado",
        description: `El tipo de servicio ${name} fue eliminado`,
      });
    } catch (error: any) {
      if(error.response.data.code){
        const _err = ErrorCodes.find((e) => e.code === error.response.data.code)
        if(_err !== undefined){
          NotificationError({
            title: "Error al eliminar",
            description: _err?.message,
          });
          return;
        }
      }
      NotificationError({
        title: "Error al eliminar",
        description: error.response.data.message,
      });
    }
  }

  function onArchive({ _id, name, isArchived }: IArchiveParams) {
    Modal.confirm({
      title: isArchived ? "Recuperar" : "Archivar",
      content: `¿Desea ${
        isArchived ? "recuperar" : "archivar"
      } el tipo de servicio "${name}"?`,
      onOk: () => onConfirmArchive({ _id, name, isArchived }),
    });
  }

  async function onConfirmArchive({ _id, name, isArchived }: IArchiveParams) {
    try {
      await requestService({
        url: `/types-service/${_id}/set-archived`,
        method: "PATCH",
        payload: {
          isArchived: !isArchived,
        },
      });

      remove({
        data,
        setData,
        id: _id,
        idField: "_id",
      });

      NotificationSuccess({
        title: isArchived ? "Recuperado" : "Archivado",
        description: `El tipo de servicio ${name} fue ${
          isArchived ? "recuperado" : "archivado"
        }`,
      });
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        NotificationError({
          title: `Error al ${isArchived ? "recuperar" : "archivar"}`,
          description: error.response.data.message,
        });
      }
    }
  }

  function onActive({ _id, name, isActive }: IActiveParams) {
    Modal.confirm({
      title: isActive ? "Desactivar" : "Activar",
      content: `¿Desea ${
        isActive ? "desactivar" : "activar"
      } el tipo de servicio ${name}?`,
      onOk: () => onConfirmActive({ _id, name, isActive }),
    });
  }

  async function onConfirmActive({ _id, name, isActive }: IActiveParams) {
    try {
      await requestService({
        url: `/types-service/${_id}/set-active`,
        method: "PATCH",
        payload: {
          isActive: !isActive,
        },
      });

      replace({
        data,
        setData,
        id: _id,
        idField: "_id",
        attributesToReplace: {
          isActive: !isActive,
        },
      });

      NotificationSuccess({
        title: isActive ? "Desactivado" : "Activado",
        description: `El tipo de servicio ${name} fue ${
          isActive ? "desactivado" : "activado"
        }`,
      });
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        NotificationError({
          title: `Error al ${archived ? "desactivar" : "activar"}`,
          description: error.response.data.message,
        });
      }
    }
  }

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
    },
    {
      title: "Descripción",
      dataIndex: "description",
    },
    {
      title: "Acciones",
      render: function (value: ServiceType) {
        const { _id, isActive } = value;

        if (archived)
          return (
            <>
              <ButtonAnt
                isRedirect={false}
                onClick={() => onArchive(value)}
                icon={<FolderOpenOutlined />}
                tooltip="Recuperar"
                disabled={!permissions.recallServiceTypes}
              />
            </>
          );

        return (
          <>
          <Tooltip title="Activar/Desactivar">
            <Switch
              checked={isActive}
              onClick={() => onActive(value)}
              disabled={!permissions.setActiveServiceTypes}
            />
          </Tooltip>

            <ButtonAnt
              isRedirect={true}
              url={PATH_ROUTES.UPDATE_SERVICE_TYPE.replace(":id", _id)}
              icon={<FormOutlined />}
              tooltip="Editar"
              disabled={!permissions.updateServiceTypes}
            />

            <ButtonAnt
              isRedirect={false}
              onClick={() => onArchive(value)}
              icon={<FolderAddOutlined />}
              tooltip="Archivar"
              disabled={!permissions.archiveServiceTypes}
            />

            <ButtonAnt
              isRedirect={false}
              onClick={() => onDelete(value)}
              icon={<DeleteFilled />}
              tooltip="Eliminar"
              disabled={!permissions.deleteServiceTypes}
            />
          </>
        );
      },
    },
  ];

  return (
    <Row gutter={24}>
      <Col span={1} />
      <Col span={22}>
        <Title
          text={archived ? "Tipos de servicio archivados" : "Tipos de servicio"}
          {...(archived
            ? {
                backButton: {
                  isRedirect: false,
                  onClick: () => setArchived(false),
                },
                type: "form",
              }
            : {})}
        />
        <SearchBar
          onSearch={(name) => getData({ name: name })}
          loading={loading}
          addButton={
            archived
              ? undefined
              : {
                  isRedirect: true,
                  url: PATH_ROUTES.CREATE_SERVICE_TYPE,
                  disabled: !permissions.addServiceTypes,
                  tooltip: "Crear Tipos de Servicio"
                }
          }
          additionalButtons={
            archived
              ? []
              : [
                  {
                    isRedirect: false,
                    icon: <FolderViewOutlined />,
                    bClassName: "btn-searchbar-secundary",
                    onClick: () => setArchived(true),
                    tooltip: "Archivados"
                  },
                ]
          }
        />
        <Grid data={data} columns={columns} loading={loading} rowKey="_id" />
      </Col>
      <Col span={1} />
    </Row>
  );
}

export default function ListWrapper() {
  const { permissions } = useAuth();

  if (permissions.watchServiceTypes) return <List />;

  return <Unauthorized />;
}
