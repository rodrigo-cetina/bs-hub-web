import Title from "components/templates/title/Title";
import SearchBar from "components/templates/searchbar/SearchBar";
import Grid from "components/single/Grid/Grid";
import Modal from "components/single/Modal/Modal";
import { ButtonAnt } from "components/single/button/Button";
import { Col, Row } from "antd";
import {
  FormOutlined,
  DeleteFilled,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import Unauthorized from "pages/Unauthorized";
import { PATH_ROUTES } from "routes/config/Paths";
import { useState, useEffect } from "react";
import getSelectList from "utils/array/getSelectList";
import requestService from "services/requestService";
import useAuth from "hooks/useAuth";
import { UserType } from "types/UserType";
import {
  NotificationError,
  NotificationSuccess,
} from "components/single/notification/notifications";
import { ErrorCodes } from "utils/errosCodes";

interface DeleteParams {
  _id: string;
  name: string;
}

function renderCatDimensions(catDimenisions: string) {
  try {
    const object = JSON.parse(catDimenisions);

    const keys = Object.keys(object);

    return keys.map((key, index) => (
      <Row>
        <Col span={6}>
          <b>{key}</b>
        </Col>
        <Col span={6}>{object[key]}</Col>
      </Row>
    ));
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

function List(props: any) {
  const [data, setData] = useState<UserType[]>([]);
  const [showDetailsList, , isShowingDetails, onSelectToShow] =
    getSelectList<string>();
  const [loadingTable, setLoadingTable] = useState(false);

  const { permissions } = useAuth();

  function onDelete({ _id, name }: DeleteParams) {
    Modal.confirm({
      title: "Eliminar",
      content: `¿Desea elminar el tipo "${name}"?`,
      onOk: () => onConfirmDelete({ _id, name }),
    });
  }

  async function onConfirmDelete({ _id, name }: DeleteParams) {
    try {
      await requestService({
        url: `user-type/${_id}`,
        method: "DELETE",
      });

      NotificationSuccess({
        title: "Eliminado",
        description: `El tipo de usuario "${name} ha sido eliminado"`,
      });

      const nextData = data.filter((t) => t._id !== _id);
      setData([...nextData]);
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
      key: "name",
    },
    {
      title: "Acciones",
      key: "Acciones",
      render: function (value: UserType) {
        const { _id } = value;
        const isShowing = isShowingDetails(_id);

        return (
          <>
            <ButtonAnt
              icon={isShowing ? <UpOutlined /> : <DownOutlined />}
              isRedirect={false}
              onClick={() => onSelectToShow(_id)}
            />

            <ButtonAnt
              icon={<FormOutlined />}
              isRedirect={true}
              url={PATH_ROUTES.UPDATE_USER_TYPE.replace(":id", value._id)}
              disabled={!permissions.updateUserTypes}
            />

            <ButtonAnt
              icon={<DeleteFilled />}
              isRedirect={false}
              onClick={() => onDelete(value)}
              disabled={!permissions.deleteUserTypes}
            />
          </>
        );
      },
    },
  ];

  const getUserTypes = async (params?: { name?: string }) => {
    try {
      setLoadingTable(true);
      if(params?.name){
        params.name = params.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      }
      const res = await requestService({
        url: "user-type",
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
    getUserTypes();
  }, []);

  return (
    <Row>
      <Col span={1} />

      <Col span={22}>
        <Title 
          text="Tipo de Usuarios" 
          type="form"
          backButton={{
            isRedirect:true,
            url: PATH_ROUTES.USERS
          }}
        />
        <SearchBar
          addButton={{
            isRedirect: true,
            url: PATH_ROUTES.CREATE_USER_TYPE,
            disabled: !permissions.addUserTypes,
          }}
          onSearch={(name) => getUserTypes({ name: name })}
          loading={loadingTable}
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
          expandable={{
            expandedRowRender: (record: UserType) =>
              renderCatDimensions(record.catDimensions),
            rowExpandable: () => true,
            showExpandColumn: false,
          }}
          expandedRowKeys={showDetailsList}
          rowKey="_id"
        />
      </Col>

      <Col span={1} />
    </Row>
  );
}

export default function ListWrapper(props: any) {
  const { permissions } = useAuth();

  if (permissions.watchUserTypes) return <List />;

  return <Unauthorized />;
}
