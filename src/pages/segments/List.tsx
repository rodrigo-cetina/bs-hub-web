import Grid from "components/single/Grid/Grid";
import Modal from "components/single/Modal/Modal";
import { ButtonAnt } from "components/single/button/Button";
import { Col, Row, Switch, Tooltip } from "antd";
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
import { useState, useEffect } from "react";
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
import { Role } from "types/Role";

interface ActiveParams {
  _id: string;
  name: string;
  isActive: boolean;
}

interface ArchiveParams {
  _id: string;
  name: string;
}

interface DeleteParams {
  _id: string;
  name: string;
}

function getTypes(authUser: any) {
  const types: any[] = [];
  authUser?.roles.forEach((rol: Role) => {
    if (rol._id === "7b4af2fb-3e48-443f-85ce-b95a53c0ab7d") {
    }
    rol.userTypes.forEach((t: UserType) => {
      types.push(t._id);
    });
  });
  const uniqueTypes = ConverToUnique(types);
  return uniqueTypes;
}

function validSuperUser(authUser: any) {
  let isSuperUser = false;
  if (authUser.isDefault) isSuperUser = true;
  return isSuperUser;
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

function renderDimensionValues(values: string[]) {
  return values.map((value, index) => (
    <>
      {value}
      {index < values.length - 1 ? " / " : ""}
    </>
  ));
}

function renderDimensionObject(
  object?: SegmentDimensionObj,
  userType?: UserType
): React.ReactNode {
  if (typeof object === "string") {
    return <>{renderDimensionObject(JSON.parse(object), userType)}</>;
  }

  if (object === undefined) return <></>;

  const keys = Object.keys(object);

  const labels: elementKeyValue = {};
  if (userType !== undefined) {
    const catDimensions: elementKeyValue = JSON.parse(userType.catDimensions);
    Object.keys(catDimensions).forEach((key) => {
      labels[key] = catDimensions[key];
    });
  }

  return (
    <>
      {keys.map((key, index) => {
        const nextLabel: string | undefined = labels[key];
        return (
          <>
            <b>{nextLabel !== undefined ? nextLabel : key}</b>
            <br></br>
            {renderDimensionValues(object[key])}
            {index < keys.length - 1 ? <br /> : null}
          </>
        );
      })}
    </>
  );
}

function List() {
  const [data, setData] = useState<Segment[]>([]);
  const [showingDetails, , isShowingDetail, onClickShowDetail] =
    GetSelectList<string>();
  const [archived, setArchived] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);

  const { permissions, authUser } = useAuth();
  const listTypes = getTypes(authUser);
  const isSuperUser = validSuperUser(authUser);
  /* const isSuperUser = false */

  function onClickActive({ _id, name, isActive }: ActiveParams) {
    Modal.confirm({
      title: isActive ? "Desactivar" : "Activar",
      content: `¿Desea ${
        isActive ? "desactivar" : "activar"
      } el segmento ${name}?`,
      onOk: () => onConfirmActive({ _id, name, isActive }),
    });
  }

  async function onConfirmActive({ _id, name, isActive }: ActiveParams) {
    try {
      await requestService({
        url: `/segments/${_id}/set-active`,
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

      Modal.success({
        title: isActive ? "Desactivado" : "Activado",
        content: `El segmento ha sido ${isActive ? "desactivado" : "activado"}`,
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
      content: `¿Desea ${
        archived ? "recuperar" : "archivar"
      } el segmento ${name}?`,
      onOk: () => onConfirmArchive({ _id, name }),
    });
  }

  async function onConfirmArchive({ _id, name }: ArchiveParams) {
    try {
      await requestService({
        url: `/segments/${_id}/set-archived`,
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

      Modal.success({
        title: archived ? "Recuperado" : "Archivado",
        content: `El segmento ${name} ha sido ${
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

  function onClickDelete({ _id, name }: DeleteParams) {
    Modal.confirm({
      title: "Eliminar",
      content: `¿Desea eliminar el segmento ${name}?`,
      onOk: () => onConfirmDelete({ _id, name }),
    });
  }

  async function onConfirmDelete({ _id, name }: DeleteParams) {
    try {
      await requestService({
        url: `/segments/${_id}`,
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
        description: `El segmento ${name} ha eliminado`,
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
      title: "Nombre",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Tipo de Usuario",
      dataIndex: "userType",
      key: "userType",
      render: function (value: any) {
        return value?.name;
      },
    },
    {
      title: "Acciones",
      render: function (value: Segment) {
        const { _id, isActive, dimensions } = value;
        const dim = String(dimensions);
        const showingDetail = isShowingDetail(_id);
        if (archived)
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

        return (
          <>
            <Tooltip title="Activar/Desactivar">
              <Switch
                checked={isActive}
                onClick={() => onClickActive(value)}
                disabled={!permissions.setActiveSegments}
              />
            </Tooltip>

            <ButtonAnt
              icon={showingDetail ? <UpOutlined /> : <DownOutlined />}
              tooltip={showingDetail ? "Ocultar detalle" : "Mostrar detalle"}
              disabled={dim.length > 2 ? false : true}
              isRedirect={false}
              onClick={() => onClickShowDetail(_id)}
            />

            <ButtonAnt
              icon={<FormOutlined />}
              tooltip="Editar"
              isRedirect={true}
              url={PATH_ROUTES.UPDATE_SEGMENT.replace(":id", value._id)}
              disabled={!permissions.updateSegments}
            />
            <ButtonAnt
              icon={<FolderAddOutlined />}
              tooltip="Archivar"
              isRedirect={false}
              onClick={() => onClickArchive(value)}
              disabled={!permissions.archiveSegments}
            />
            <ButtonAnt
              icon={<DeleteFilled />}
              tooltip="Eliminar"
              isRedirect={false}
              onClick={() => onClickDelete(value)}
              disabled={!permissions.deleteSegments}
            />
          </>
        );
      },
    },
  ];

  const validUsers = (res: any[]) => {
    let rest: any[] = [];
    if (listTypes.length !== 0 || isSuperUser) {
      res.forEach((user: Segment, index: any, array: any) => {
        let validation = 0;
        if (user.userType === undefined && isSuperUser) {
          validation++;
        } else {
          if (listTypes.includes(user.userType._id) || isSuperUser) {
            validation++;
          }
        }
        if (validation !== 0) {
          rest.push(user);
        }
      });
    } else {
      rest = res;
    }
    return rest;
  };

  const getSegments = async (params?: { name?: string }) => {
    try {
      setLoadingTable(true);
      if (params?.name) {
        params.name = params.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
      }
      let rest: any[] = [];
      const res = await requestService({
        url: archived ? "segments/archived" : "segments",
        params: params,
      });
      rest = validUsers(res);
      setData(rest);
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
    getSegments();
  }, [archived]);

  return (
    <Row>
      <Col span={1} />
      <Col span={22}>
        <Title
          text={
            archived
              ? "Segmentación de usuarios(archivados)"
              : "Segmentación de usuarios"
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
          onSearch={(name) => getSegments({ name: name })}
          loading={loadingTable}
          addButton={
            archived
              ? undefined
              : {
                  isRedirect: true,
                  url: PATH_ROUTES.CREATE_SEGMENT,
                  disabled: !permissions.addSegments,
                  tooltip: "Crear Segmentos",
                }
          }
          additionalButtons={
            archived
              ? []
              : [
                  {
                    tooltip: "Archivados",
                    icon: <FolderViewOutlined />,
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
            locale: { items_per_page: "/ pag" },
          }}
          expandable={{
            expandedRowRender: (record: Segment) =>
              renderDimensionObject(record.dimensions, record.userType),
            rowExpandable: (record: Segment) => true,
            showExpandColumn: false,
          }}
          expandedRowKeys={showingDetails}
          rowKey={"_id"}
        />
      </Col>

      <Col span={1} />
    </Row>
  );
}

export default function Wrapper() {
  const { permissions, authUser } = useAuth();

  if (permissions.watchSegments) return <List />;

  return <Unauthorized />;
}
