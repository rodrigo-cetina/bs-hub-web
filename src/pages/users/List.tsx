import { ButtonAnt } from 'components/single/button/Button'
import Grid from 'components/single/Grid/Grid'
import Modal from 'components/single/Modal/Modal'
import { Switch, Col, Row, Tooltip } from 'antd'
import { UpOutlined, DownOutlined, FormOutlined, FolderViewOutlined, FolderAddOutlined, FolderOpenOutlined } from '@ant-design/icons'
import LoadModal from './LoadModal'
import Title from 'components/templates/title/Title'
import SearchBar from 'components/templates/searchbar/SearchBar'
import Unauthorized from 'pages/Unauthorized'
import { useEffect, useState } from 'react'
import requestService from 'services/requestService'
import replace from 'utils/array/replace'
import remove from 'utils/array/remove'
import GetSelectList from 'utils/array/getSelectList'
import { User } from 'types/User'
import { UserType } from 'types/UserType'
import { elementKeyValue } from 'types/DimensionObject'
import { PATH_ROUTES } from 'routes/config/Paths'
import useAuth from 'hooks/useAuth'
import { Role } from 'types/Role'
import { Profile } from 'types/Profile'

interface ActiveParams {
  _id: string
  names: string
  lastNames: string
  isActive: boolean
}

interface ArchiveParams {
  _id: string
  names: string
  lastNames: string
  isArchived: boolean
}

interface ControlParams {
  userTypes: string[]
  isSuperUser: boolean
}

function getTypes(authUser: any) {
  const types: any[] = []
  authUser?.roles.forEach((rol: Role) => {
    if(rol._id === "7b4af2fb-3e48-443f-85ce-b95a53c0ab7d"){
    }
    rol.userTypes.forEach((t: UserType) => {
      types.push(t._id)
    })
  })
  const uniqueTypes = ConverToUnique(types)
  return uniqueTypes;
}

function validSuperUser(authUser: any) {
  let isSuperUser = false
  if (authUser.isDefault) 
      isSuperUser=true
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

function getDimensionsByProfileandRoles(profiles: Profile[], roles: Role[]){
  const render : any[] = profiles.map((p : Profile) => {
    const dimensions = p.dimensions;
    const userType = p.userType;
    let res = renderDimensions(dimensions, userType)
    return res
  });
  return(
    <>
    {roles.length > 1 &&
      <Title type='expand' text={"Roles:"} />
    }
    {roles.length > 1 && roles.map((ro: Role) => {
      return(
        <Col key={ro._id}>
          <b>{ro.name}</b>
        </Col>
      )
    })}
    {render.map((r) => {
      return (
        <>{r}</>
      )
    })}
    </>
  )
}


function renderDimensions (dimensions: any, userType: UserType) {
  const keys = Object.keys( dimensions ? dimensions : {} ) 
  const  {catDimensions } = userType !== null ? userType : { catDimensions: '{}' }
  const parsed = userType !== null ? JSON.parse(catDimensions !== null ? catDimensions : '{}') : {}
  return (
    <>
    <Title type='expand' text={userType.name + ":"} />
      {keys.map((key)=>{
        const value = JSON.parse(dimensions)['Dim'+key]
        const label = parsed['Dim'+key]

        return (
          <Row gutter={24} key={'Dim'+key}>
            <Col span={8}><b>{(label !== undefined && typeof label === 'string') ? label : ''}</b></Col>
            <Col span={8}>{(typeof value === 'string') ? value : ''}</Col>
          </Row>
        )
      })}
    </>
  )

}


function List({ ...props }: ControlParams) {
  const [data, setData] = useState<User[]>([])
  const [dataR, setDataR] = useState<Role[]>([])
  const [dataP, setDataP] = useState<UserType[]>([])
  const [archived, setArchived] = useState(false)
  const [loadingTable, setLoadingTable] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [showingList, , isShowing, onClickShow] = GetSelectList<string>()
  const [total, setTotal] = useState(0)
  const [arg, setArgs] = useState({page:1, take:10})
  const [filters, setfilters] = useState({name:'',usertype:'',role:''})
  const superUser = props.isSuperUser
  const types = props.userTypes

  const { permissions, authUser } = useAuth()
  function toggleLoadModal() {
    setShowLoadModal(!showLoadModal)
  }
  const columns = [
    {
      title: "Nombre(s)",
      dataIndex: "names",
      key: "names",
    },
    {
      title: "Apellido(s)",
      dataIndex: "lastNames",
      key: "lastNames",
    },
    {
      title: "Correo",
      dataIndex: "email",
    },
    {
      title: "Teléfono",
      dataIndex: "phone",
    },
    /*     {
          title: "ID",
          dataIndex: "idOrigen",
        }, */
    {
      title: "Dirección",
      dataIndex: "address",
    },
    /*     {
          title: "Tipo",
          render: (item:User)=>{
            return (
            <>
            {item.userType != null? item.userType.name : 'Tipo de usuario no asignado'}
            </>
          )}
        }, */
    {
      title: "Roles",
      render: (item: User) => {
        let roles = item.roles != null ? item.roles.map(r => " " + r.name ) : ['Sin roles asignados']
        /* let result = ""
        roles.forEach((role : any) =>{
          result+= role;
        }) */
        return (
          <>
          {
            roles[0]
          }
          {
            roles.length > 1 &&
            <b>...</b>
          }
          </>
        )
      }
    },
    {
      title: "Acciones",
      render: (item: User) => 
      {
        const { _id, isActive, isDefault } = item
        const showing = isShowing(_id)
        let viewExpand = false
        if(item.profiles.length !==  0 || item.roles.length > 1){
          viewExpand = true;
        }
        if (archived && !isDefault)
          return (
            <ButtonAnt
              icon={<FolderOpenOutlined />}
              tooltip='Recuperar'
              isRedirect={false}
              onClick={() => onArchive(item)}
            />
          )
        if (!isDefault)
          return {
            props: {
              style: { width: 200 }
            },
            children:(
            <div>
              <Tooltip title="Activar / Desactivar">
                <Switch
                  checked={isActive}
                  onClick={() => onChangeActive(item)}
                  disabled={(() => {
                    // if(isSuperUser(item))
                    // return true
                    if (item._id === authUser?.id) return true;

                    return !permissions.setActiveUsers
                  })()}
                />
              </Tooltip>
              <ButtonAnt
                isRedirect={false}
                icon={showing ? <UpOutlined /> : <DownOutlined />}
                onClick={() => onClickShow(_id)}
                disabled={!viewExpand}
                tooltip='Dimensiones/Roles'
              />
              <ButtonAnt
                icon={<FolderAddOutlined />}
                tooltip='Archivar'
                isRedirect={false}
                onClick={() => onArchive(item)}
                disabled={item._id === authUser?.id}
              />
              <ButtonAnt
                bClassName="btn_icon"
                icon={<FormOutlined />}
                isRedirect={true}
                size="middle"
                url={PATH_ROUTES.UPDATE_USER.replace(':id', item._id)}
                tooltip="Editar"
                disabled={!permissions.updateUsers}
              />
            </div>)
          }
      },
    },
  ]

  function onChangeActive({ _id, names, lastNames, isActive }: ActiveParams) {
    Modal.confirm({
      title: isActive ? 'Desactivar' : 'Activar',
      content: `¿Desea ${isActive ? 'desactivar' : 'activar'} al usuario ${names} ${lastNames}?`,
      onOk: () => onConfirmChangeActive({ _id, names, lastNames, isActive }),
    })
  }

  async function onConfirmChangeActive({ _id, names, lastNames, isActive }: ActiveParams) {
    try {
      await requestService({
        url: `users/${_id}/set-active`,
        method: 'PATCH',
        payload: {
          isActive: !isActive,
        },
      })

      replace({
        data,
        setData,
        id: _id,
        idField: '_id',
        attributesToReplace: { isActive: !isActive },
      })

      Modal.success({
        title: isActive ? 'Desactivado' : 'Activado',
        content: `El usuario ${names} ${lastNames} ha sido ${isActive ? 'desactivado' : 'activado'}`,
      })
    } catch (error: any) {
      Modal.error(
        error.response && error.response.data && error.response.data.message ? {
          title: error.response.data.title,
          content: error.response.data.message,
        } :
          {
            title: error.name,
            content: error.message,
          }
      )
    }
  }

  function onArchive({ _id, names, lastNames, isArchived }: ArchiveParams) {
    Modal.confirm({
      title: isArchived ? 'Recuperar' : 'Archivar',
      content: `¿Desea ${isArchived ? 'recuperar' : 'archivar'} al usuario ${names} ${lastNames}?`,
      onOk: () => onConfirmArchive({ _id, names, lastNames, isArchived }),
    })
  }

  async function onConfirmArchive({ _id, names, lastNames, isArchived }: ArchiveParams) {
    try {
      await requestService({
        url: `users/${_id}/set-archived`,
        method: 'PATCH',
        payload: {
          isArchived: !isArchived,
        },
      })

      remove({
        data,
        setData,
        id: _id,
        idField: '_id',
      })

      Modal.success({
        title: isArchived ? 'Recuperado' : 'Archivado',
        content: `El usuario ${names} ${lastNames} ha sido ${isArchived ? 'recuperado' : 'archivado'}`,
      })
    } catch (error: any) {
      Modal.error(
        error.response && error.response.data && error.response.data.message ? {
          title: error.response.data.title,
          content: error.response.data.message,
        } :
          {
            title: error.name,
            content: error.message,
          }
      )
    }
  }

  function validUsers(res : any[]){
    let rest : any[] = []
    if (types.length !== 0 || superUser) {
      res.forEach((user: any) => {
        let validation = 0;
        if(user.profiles.length === 0 && superUser){
          validation++;
        }
        else{
          user.profiles.forEach((profile: any) => {
            if (types.includes(profile.userType._id) || superUser) {
              validation++
            }
          });
        }
        if (validation !== 0) {
          rest.push(user)
        }
      });
    }
    else{
      rest = res;
    }
    return rest
  }

  async function getUsers() {
    try {
      setLoadingTable(true)
      let {name} = filters
      if(name){
        name = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      }
      let rest : any[] = []
      const {data,total} = await requestService({
        url: archived ? 'users/archived' : `users/filter?take=${arg.take}&page=${arg.page}` ,
        params:filters
      })
      rest = validUsers(data)
      setTotal(total)
      setData(rest)
      setLoadingTable(false)
    } catch (error: any) {
      setLoadingTable(false)
      Modal.error(
        error.response && error.response.data && error.response.data.message ? {
          title: error.response.data.title,
          content: error.response.data.message,
        } :
          {
            title: error.name,
            content: error.message,
          }
      )
    }
  }
  async function getRoles() {
    try {
      setLoadingTable(true)
      const res = await requestService({
        url: `roles`,
      })
      setDataR(res)
      setLoadingTable(false)
    } catch (error: any) {
      setLoadingTable(false)

      Modal.error(
        error.response && error.response.data && error.response.data.message ? {
          title: error.response.data.title,
          content: error.response.data.message,
        } :
          {
            title: error.name,
            content: error.message,
          }
      )
    }
  }
  async function getProfiles() {
    try {
      setLoadingTable(true)
      const res:UserType[] = await requestService({
        url: `user-type`,
      })
      setDataP(res)
      setLoadingTable(false)
    } catch (error: any) {
      setLoadingTable(false)

      Modal.error(
        error.response && error.response.data && error.response.data.message ? {
          title: error.response.data.title,
          content: error.response.data.message,
        } :
          {
            title: error.name,
            content: error.message,
          }
      )
    }
  }
  useEffect(() => {
    getRoles()
    getProfiles()
    getUsers()
    
  }, [archived,arg,filters])

  return (
    <Row>
      <Col span={1} />

      <Col span={22}>

        <Title
          text={archived ? 'Usuarios archivados' : 'Usuarios'}
          type={archived ? 'form' : 'main'}
          backButton={archived ? {
            isRedirect: false,
            onClick: () => setArchived(false),
          } : undefined}
        />
        <SearchBar
          loading={loadingTable}
          onSearch={(name) => setfilters({name, usertype: filters.usertype,role:filters.role })}
          addButton={archived ? undefined : {
            disabled: !permissions.addUsers,
            isRedirect: false,
            tooltip: 'Cargar usuarios',
            onClick: toggleLoadModal,
          }}
          dropdowns={[
            {
              tooltip:'perfil',
              data:dataP,
              onChange:(value)=>{setfilters({name:filters.name, usertype: value,role:filters.role })}
            },
            {
              tooltip:'rol',
              data: dataR,
              onChange:(value)=>{setfilters({name:filters.name, usertype: filters.usertype,role:value })}
            }
          ]}
          additionalButtons={archived ? [] : [
            {
              text: 'Tipo de usuarios',
              bClassName: 'ant-btn-primary',
              isRedirect: true,
              url: PATH_ROUTES.USER_TYPES,
              disabled: !permissions.watchUserTypes,
            },
            {
              tooltip: 'Archivados',
              icon: <FolderViewOutlined />,
              onClick: () => setArchived(true),
              bClassName: 'btn-searchbarbtn-secundary',
            },
          ]}
          
        />
        
        <Grid
          columns={columns}
          data={data}
          loading={loadingTable}

          pagination={{
            position: ['bottomRight'],
            showSizeChanger: true,
            locale:{items_per_page:"/ pag"},
            total: total,
            onChange(page, pageSize) {
                setArgs({page, take:pageSize}) 
            },
          }}
          expandable={{
            expandedRowRender: (record: User) => getDimensionsByProfileandRoles(record.profiles, record.roles),
            rowExpandable: ()=>true,
            showExpandColumn: false,
          }}
          expandedRowKeys={showingList}
          rowKey={'_id'}
        />
        <LoadModal
          visible={showLoadModal}
          toggle={toggleLoadModal}
          onLoadModal={() => getUsers()}
        />
      </Col>

      <Col span={1} />
    </Row>
  )
}

export default function ListWrapper(props: any) {

  const { permissions, authUser } = useAuth()
  const listTypes = getTypes(authUser)
  const isSuperUser = validSuperUser(authUser)
  if (permissions.watchUsers)
    return <List userTypes={listTypes} isSuperUser={isSuperUser} />

  return <Unauthorized />
}