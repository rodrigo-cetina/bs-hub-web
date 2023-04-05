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
import Modal from "components/single/Modal/Modal";
import Grid from "components/single/Grid/Grid";
import { ButtonAnt } from "components/single/button/Button";
import Unauthorized from "pages/Unauthorized";
import { PATH_ROUTES } from "routes/config/Paths";
import requestService from "services/requestService";
import { useState, useEffect } from "react";
import useAuth from "hooks/useAuth";
import replace from "utils/array/replace";
import remove from "utils/array/remove";
import { Service } from "types/Service";
import { ServiceType } from "types/ServiceType";
import {
  NotificationError,
  NotificationSuccess,
} from "components/single/notification/notifications";
import ModalForm from "components/single/Modal/ModalForm";
import ListCategory from "pages/category/List";
import { ErrorCodes } from "utils/errosCodes";

interface ActiveParams {
  _id: string;
  name: string;
  isActive: boolean;
}

interface DeleteParams {
  _id: string;
  name: string;
}

interface ArchiveParams {
  _id: string;
  name: string;
  isArchived: boolean;
}

function List() {
  const [data, setData] = useState<Service[]>([]);
  const [archived, setArchived] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ViewListCategory, setViewListCategory] = useState(false);

  const { permissions } = useAuth();

  function ViewCategory(){
    setViewListCategory(true);
  }

  function CloseCategory(){
    setViewListCategory(false);
  }

  async function getData(params?: { name?: string }) {
    try {
      setLoading(true);
      if(params?.name){
        params.name = params.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      }
      const res = await requestService({
        url: archived ? "services/archived" : "services",
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

  function onChangeActive({ _id, name, isActive }: ActiveParams) {
    Modal.confirm({
      title: isActive ? "Desactivar" : "Activar",
      content: `¿Desea ${
        isActive ? "desactivar" : "activar"
      } al servicio ${name}?`,
      onOk: () => onConfirmChangeActive({ _id, name, isActive }),
    });
  }

  async function onConfirmChangeActive({ _id, name, isActive }: ActiveParams) {
    try {
      await requestService({
        url: `services/${_id}/set-active`,
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
        attributesToReplace: { isActive: !isActive },
      });

      NotificationSuccess({
        title: isActive ? "Desactivado" : "Activado",
        description: `El servicio ${name} ha sido ${
          isActive ? "desactivado" : "activado"
        }`,
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

  function onArchive({ _id, name, isArchived }: ArchiveParams) {
    Modal.confirm({
      title: isArchived ? "Recuperar" : "Archivar",
      content: `¿Desea ${
        isArchived ? "recuperar" : "archivar"
      } el servicio "${name}"?`,
      onOk: () => onConfirmArchive({ _id, name, isArchived }),
    });
  }

  async function onConfirmArchive({ _id, name, isArchived }: ArchiveParams) {
    try {
      await requestService({
        url: `services/${_id}/set-archived`,
        method: "PATCH",
        payload: {
          isArchived: !isArchived,
        },
      });

      Modal.success({
        title: isArchived ? "Recuperado" : "Archivado",
        content: `El servicio "${name}" ha sido ${
          isArchived ? "recuperado" : "archivado"
        }`,
      });

      remove({
        data,
        setData,
        id: _id,
        idField: "_id",
      });
    } catch (error: any) {
      Modal.error(
        error.response && error.response.data && error.response.data.message
          ? {
              title: error.response.data.title,
              content: error.response.data.message,
            }
          : {
              title: error.name,
              content: error.message,
            }
      );
    }
  }

  function onDelete({ _id, name }: DeleteParams) {
    Modal.confirm({
      title: "Eliminar",
      content: `¿Desea eliminar el servicio "${name}"?`,
      onOk: () => onConfirmDelete({ _id, name }),
    });
  }

  async function onConfirmDelete({ _id, name }: DeleteParams) {
    try {
      await requestService({
        url: `services/${_id}`,
        method: "DELETE",
      });

      NotificationSuccess({
        title: "Eliminado",
        description: `El servicio "${name}" ha sido eliminado`,
      });

      remove({
        data,
        setData,
        id: _id,
        idField: "_id",
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

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
    },
    {
      title: "Tipo",
      dataIndex: "typeService",
      render: function (value: ServiceType) {
        return value?.name;
      },
    },
    {
      title: "Descripción",
      dataIndex: "description",
    },
    {
      title: "Acciones",
      render: function (value: Service) {
        const { _id, isActive } = value;

        if (archived)
          return (
            <ButtonAnt
              icon={<FolderOpenOutlined />}
              tooltip="Recuperar"
              isRedirect={false}
              onClick={() => onArchive(value)}
            />
          );

        return (
          <>
          <Tooltip title="Activar/Desactivar">
            <Switch
              checked={isActive}
              onClick={() => onChangeActive(value)}
              disabled={!permissions.setActiveServices}
            />
          </Tooltip>

            <ButtonAnt
              icon={<FormOutlined />}
              tooltip="Editar"
              isRedirect={true}
              url={PATH_ROUTES.UPDATE_SERVICE.replace(":id", _id)}
              disabled={!permissions.updateServices}
            />

            <ButtonAnt
              icon={<FolderAddOutlined />}
              tooltip="Archivar"
              isRedirect={false}
              onClick={() => onArchive(value)}
            />

            <ButtonAnt
              icon={<DeleteFilled />}
              tooltip="Eliminar"
              isRedirect={false}
              onClick={() => onDelete(value)}
              disabled={!permissions.deleteServices}
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
          text={archived ? "Servicios archivados" : "Servicios"}
          {...(archived
            ? {
                backButton: {
                  isRedirect: false,
                  onClick: () => setArchived(false),
                },
                type: "form",
              }
            : null)}
        />
        <SearchBar
          onSearch={(name) => getData({ name: name })}
          loading={loading}
          addButton={{
            isRedirect: true,
            url: PATH_ROUTES.CREATE_SERVICE,
            disabled: !permissions.addServices,
            tooltip:"Crear Servicios"
          }}
          additionalButtons={
            archived
              ? []
              : [
                  {
                    bClassName: "searchbar-btn-secundary",
                    tooltip: "Archivados",
                    icon: <FolderViewOutlined />,
                    onClick: () => setArchived(true),
                  },
                  {
                    text: "Tipo de servicios",
                    bClassName: "ant-btn-primary",
                    isRedirect: true,
                    url: PATH_ROUTES.SERVICE_TYPES,
                  },
                  {
                    text: "Categorias",
                    bClassName: "ant-btn-primary",
                    onClick: () =>  ViewCategory(),
                    disabled: !permissions.watchCategory
                  }
                ]
          }
        />
        <Grid data={data} columns={columns} loading={loading} rowKey="_id" />
      </Col>
      <Col span={1} />
      <ModalForm
        visible={ViewListCategory}
        onCancel={CloseCategory}
        onOk={CloseCategory}
        title="Categorias"
        children={<ListCategory closeModal={CloseCategory} openModal={ViewCategory} />}
        okText="Cerrar"
        htmlType="button"
        modalType="single"
      />
    </Row>
  );
}

export default function ListWrapper() {
  const { permissions } = useAuth();

  if (permissions.watchServices) return <List />;

  return <Unauthorized />;
}
