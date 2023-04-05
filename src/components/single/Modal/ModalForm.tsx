import { Modal } from "antd";
import "./ModalForm.css";

interface props {
    title: string;
    okText?: string,
    visible: boolean;
    onCancel: any;
    onOk: any;
    htmlType?: "button" | "submit" | "reset" | undefined;
    modalType? : "single" | "many" | undefined;
    children?: any;
    okLoading?: boolean;
  }
  
  const ModalForm = ({
    title,
    visible,
    children,
    onCancel,
    onOk,
    okLoading,
    okText,
    htmlType = "button",
    modalType = "many",
  }: props) => {
    return (
      <Modal
        cancelText="Cancelar"
        centered
        className="personal-modal confirm-personal-modal"
        okText={ okText? okText : "Aceptar"}
        onCancel={onCancel}
        onOk={onOk}
        cancelButtonProps={{ disabled: okLoading, className:'btn-modal-cancel', style: modalType==="single"?{ display: 'none' }: {} }}
        okButtonProps={{ className:'btn-modal-accept', loading: okLoading, htmlType: htmlType }}
        title={title}
        visible={visible}
      >
        {children}
      </Modal>
    );
  };
  
  export default ModalForm;