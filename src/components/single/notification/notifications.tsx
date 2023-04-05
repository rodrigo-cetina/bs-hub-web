import { notification } from "antd";

export interface NotificationProps {
  title: string;
  description: string;
  onclick?: () => void;
}
/**
 *
 * Notification settings
 *
 */
notification.config({
  placement: "topRight",
  duration: 3,
});
export function NotificationSuccess({
  title,
  description,
  onclick,
}: NotificationProps) {
  notification.success({
    message: title,
    description: description,
    onClick: onclick,
  });
}
export function NotificationError({
  title,
  description,
  onclick,
}: NotificationProps) {
  notification.error({
    message: title,
    description: description,
    onClick: onclick,
  });
}
