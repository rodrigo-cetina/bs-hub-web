import Grid from "components/single/Grid/Grid";
import Modal from "components/single/Modal/Modal";
import { ButtonAnt } from "components/single/button/Button";
import { Col, Row, Switch, Tooltip } from "antd";
import {
  FormOutlined,
  FolderViewOutlined,
  FolderAddOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import Title from "components/templates/title/Title";
import SearchBar from "components/templates/searchbar/SearchBar";
import Unauthorized from "pages/Unauthorized";
import useAuth from "hooks/useAuth";
import { useState, useEffect } from "react";
import requestService from "services/requestService";
import { PATH_ROUTES } from "routes/config/Paths";
import replace from "utils/array/replace";
import remove from "utils/array/remove";
import { Role } from "types/Role";
import {
  NotificationError,
  NotificationSuccess,
} from "components/single/notification/notifications";

interface ActiveParams {
  _id: string;
  name: string;
  isActive: boolean;
}

interface ArchiveParams {
  _id: string;
  name: string;
}

function List() {
  const [data, setData] = useState<Role[]>([]);
  const [archived, setArchived] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);

  const { permissions } = useAuth();

  function onClickActive({ _id, name, isActive }: ActiveParams) {
    Modal.confirm({
      title: isActive ? "Desactivar" : "Activar",
      content: `¿Desea ${isActive ? "desactivar" : "activar"} el rol ${name}?`,
      onOk: () => onConfirmActive({ _id, name, isActive }),
    });
  }

  async function onConfirmActive({ _id, name, isActive }: ActiveParams) {
    try {
      await requestService({
        url: `/roles/${_id}/set-active`,
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

      NotificationSuccess({
        title: isActive ? "Desactivado" : "Activado",
        description: `El rol ha sido ${isActive ? "desactivado" : "activado"}`,
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

  function onClickArchive({ _id, name }: ArchiveParams) {
    Modal.confirm({
      title: archived ? "Recuperar" : "Archivar",
      content: `¿Desea ${archived ? "recuperar" : "archivar"} el rol ${name}?`,
      onOk: () => onConfirmArchive({ _id, name }),
    });
  }

  async function onConfirmArchive({ _id, name }: ArchiveParams) {
    try {
      await requestService({
        url: `/roles/${_id}/set-archived`,
        payload: {
          isArchived: !archived,
        },
        method: "PATCH",
      });

      remove({
        data,
        setData,
        id: _id,
        idField: "_id",
      });

      NotificationSuccess({
        title: archived ? "Recuperado" : "Archivado",
        description: `El rol ${name} ha sido ${
          archived ? "recuperado" : "archivado"
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

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Acciones",
      key: "actions",
      render: function (value: Role) {
        const { _id, isActive, isDefault } = value;
        /* const isSuperUser = _id === "7b4af2fb-3e48-443f-85ce-b95a53c0ab7d"; */

        if (archived)
          return (
            <>
              <ButtonAnt
                icon={<FolderOpenOutlined />}
                tooltip="Recuperar"
                isRedirect={false}
                onClick={() => onClickArchive(value)}
                disabled={!permissions.recallArchivedRoles}
              />
            </>
          );

        return (
          <>
          <Tooltip title="Activar/Desactivar">
            <Switch
              checked={isActive}
              onClick={() => onClickActive(value)}
              disabled={!permissions.setActiveRoles || isDefault}
            />
          </Tooltip>

            <ButtonAnt
              icon={<FormOutlined />}
              tooltip="Editar"
              isRedirect={true}
              url={PATH_ROUTES.UPDATE_ROLE.replace(":id", _id)}
              disabled={!permissions.updateRolesAndPermissions || isDefault}
            />
            <ButtonAnt
              icon={<FolderAddOutlined />}
              tooltip="Archivar"
              isRedirect={false}
              onClick={() => onClickArchive(value)}
              disabled={!permissions.archiveRoles || isDefault}
            />
          </>
        );
      },
    },
  ];

  const getRoles = async (params?: { name?: string }) => {
    try {
      setLoadingTable(true);
      if(params?.name){
        params.name = params.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      }
      const res = await requestService({
        url: archived ? "roles/archived" : "roles",
        params: params,
      });
      setData(res);
      setLoadingTable(false);
    } catch (error: any) {
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
  };

  useEffect(() => {
    getRoles();
  }, [archived]);

  return (
    <Row>
      <Col span={1} />

      <Col span={22}>
        <Title
          text={archived ? "Roles archivados" : "Roles"}
          backButton={
            archived
              ? {
                  isRedirect: false,
                  onClick: () => setArchived(false),
                }
              : undefined
          }
          type={archived ? "form" : "main"}
        />
        <SearchBar
          loading={loadingTable}
          onSearch={(name: string) => getRoles({ name: name })}
          addButton={
            archived
              ? undefined
              : {
                  isRedirect: true,
                  url: PATH_ROUTES.CREATE_ROLE,
                  disabled: !permissions.addRoles,
                  tooltip: "Crear Rol"
                }
          }
          additionalButtons={
            archived
              ? []
              : [
                  {
                    tooltip: "Archivados",
                    icon: <FolderViewOutlined />,
                    isRedirect: false,
                    onClick: () => setArchived(true),
                  },
                ]
          }
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
          rowKey="_id"
        />
      </Col>

      <Col span={1} />
    </Row>
  );
}

export default function ListWrapper() {
  const { permissions } = useAuth();

  if (permissions.watchRoles) return <List />;

  return <Unauthorized />;
}
