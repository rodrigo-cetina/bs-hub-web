import { Col, Row, Switch, Form, Tooltip } from "antd";
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
import { Category} from "types/Category";
import FormCategory from "pages/category/CreateEdit";


interface ActiveParams {
    _id: string;
    name: string;
    isActive: boolean;
}

interface DeleteParams {
    _id: string;
    name: string;
}

interface CategoryParams {
    closeModal: Function;
    openModal: Function;
}

interface ArchiveParams {
    _id: string;
    name: string;
    isArchived: boolean;
}

function List({ closeModal, openModal } :CategoryParams) {
    const [data, setData] = useState<Category[]>([]);
    const [archived, setArchived] = useState(false);
    const [loading, setLoading] = useState(false);
    const [ViewModalForm, setViewModalForm] = useState(false);
    const [IsUpdate, setIsUpdate] = useState(false)
    const [IdCategory, setIdCategory] = useState("");
    const [form] = Form.useForm();
    const [refreshKey, setRefreshKey] = useState(0)
    const { permissions } = useAuth();

    function showForm(_id?: string) {
        closeModal();
        if (_id) {
            setIdCategory(_id);
            setIsUpdate(true);
        }
        else {
            setIdCategory("")
            setIsUpdate(false)
        }
        setViewModalForm(true);
    }

    function closeForm() {
        setViewModalForm(false);
        openModal()
    }

    function onArchive({ _id, name, isArchived }: ArchiveParams) {
        Modal.confirm({
            title: isArchived ? "Recuperar" : "Archivar",
            content: `¿Desea ${isArchived ? "recuperar" : "archivar"
                } la categoria "${name}"?`,
            onOk: () => onConfirmArchive({ _id, name, isArchived }),
        });
    }

    async function onConfirmArchive({ _id, name, isArchived }: ArchiveParams) {
        try {
            await requestService({
                url: `/category/${_id}/set-archived`,
                method: "PATCH",
                payload: {
                    isArchived: !isArchived,
                },
            });

            Modal.success({
                title: isArchived ? "Recuperado" : "Archivado",
                content: `La categoria "${name}" ha sido ${isArchived ? "recuperada" : "archivada"
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

    function onChangeActive({ _id, name, isActive }: ActiveParams) {
        Modal.confirm({
            title: isActive ? "Desactivar" : "Activar",
            content: `¿Desea ${isActive ? "desactivar" : "activar"
                } la categoria ${name}?`,
            onOk: () => onConfirmChangeActive({ _id, name, isActive }),
        });
    }

    function onDelete({ _id, name }: DeleteParams) {
        Modal.confirm({
            title: "Eliminar",
            content: `¿Desea eliminar la categoria "${name}"?`,
            onOk: () => onConfirmDelete({ _id, name }),
        });
    }

    async function onConfirmDelete({ _id, name }: DeleteParams) {
        try {
            await requestService({
                url: `category/${_id}/delete`,
                method: "DELETE",
            });

            NotificationSuccess({
                title: "Eliminado",
                description: `La categoria "${name}" ha sido eliminado`,
            });

            remove({
                data,
                setData,
                id: _id,
                idField: "_id",
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

    async function onConfirmChangeActive({ _id, name, isActive }: ActiveParams) {
        try {
            await requestService({
                url: `/category/${_id}/set-active`,
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
                description: `La categoria ${name} ha sido ${isActive ? "desactivada" : "activada"
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

    function onSubmitSaveCategory() {
        const values = form.getFieldsValue();
        Modal.confirm({
            title: IsUpdate? "Actualizar" : "Guardar",
            content: IsUpdate 
            ? "¿Desea actualizar la categoria?"
            : "¿Desea guardar la nueva categoria?",
            onOk: () => storeOrUpdate(IdCategory),
        });
    }

    async function storeOrUpdate(_id? : string){
        try {
          const { name } = form.getFieldsValue();

          await requestService({
            url: IsUpdate ? `/category/${_id}` : "/category",
            method: IsUpdate ? "PUT" : "POST",
            payload: {
                name
            },
          });
          NotificationSuccess({
            title: IsUpdate ? "Actualizado" : "Creado",
            description: `La categoria ha sido ${
              IsUpdate ? "actualizada" : "creada"
            }`,
          });
          setRefreshKey(oldKey => oldKey + 1);
          form.resetFields();
          closeForm()
          openModal()
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
          closeForm();
        }
      }

    async function onConfirmSubmit() {
        try {
            const values = form.getFieldsValue();
            const { config, icon, isPublic, ...rest } = values;


        } catch (error: any) {
            if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {
                NotificationError({
                    title: "Error al guardar",
                    description: error.response.data.message,
                });
            }
        }
    }


    async function getData(params?: { name?: string }) {
        try {
            setLoading(true);
            /* const res = CategoryProduction */
            let query = "";
            if(params?.name !== undefined){
                query = "?name=" + params?.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            }
            const res = await requestService({
              url: archived ? "/category/archived" + query : "/category" + query,
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
    }, [archived, refreshKey]);


    const columns = [
        {
            title: "Nombre",
            dataIndex: "name",
            key: "name"
        },
        {
            title: "Acciones",
            render: function (value: any) {
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
                            disabled={!permissions.setActiveCategory}
                        />
                        </Tooltip>

                        <ButtonAnt
                            icon={<FormOutlined />}
                            tooltip="Editar"
                            isRedirect={false}
                            disabled={!permissions.updateCategory}
                            onClick={() => { showForm(_id) }}
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
                            disabled={!permissions.deleteCategory}
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
                    text={archived ? "Categorias archivadas" : "Categorias"}
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
                        isRedirect: false,
                        disabled: !permissions.addCategory,
                        onClick: () => showForm(),
                        tooltip:"Crear Categoria"
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
                            ]
                    }
                />
                <Grid data={data} columns={columns} loading={loading} rowKey="_id" />
            </Col>
            <Col span={1} />
            <ModalForm
                visible={ViewModalForm}
                onCancel={closeForm}
                onOk={() => { onSubmitSaveCategory() }}
                title= {IsUpdate? "Actualizar Categoria" : "Agregar Categoria"} 
                children={
                    <FormCategory isUpdate={IsUpdate} categoryId={IdCategory} form={form} />
                }
                okText={ IsUpdate? "Actualizar" : "Agregar"}
                htmlType="submit"
            />
        </Row>
    );
}


export default function ListWrapper({closeModal, openModal} : CategoryParams) {
    return <List closeModal={closeModal} openModal={openModal} />
}