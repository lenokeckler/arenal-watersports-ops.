export type FormValues = {
  name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string;
  country_code: string;
};
export interface FormProps {
  contact_section: {
    title: string;
    name: string;
    last_name: string;
    email: string;
    code_country: string;
    phone: string;
    message: string;
    not_robot: string;
    send_button: string;
    success_send_email: string;
    error_msg: {
      complete_data: string;
      check_robot: string;
      incorrect_email_format: string;
      incorrect_phone_format: string;
      choose_country: string;
      error_send_email: string;
    };
  };
  contactInfo: {
    email: string;
    phone: string;
  };
}
