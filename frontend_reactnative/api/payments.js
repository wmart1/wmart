import { API } from './'

export const addPaymentMethod = (body, token) => {
  return API.post(`api/v1/payments/add_payment_method/`, body, token)
}

export const getPaymentMethod = token => {
  return API.get(`api/v1/payments/my_cards/`, token)
}

export const deletePayMethod = (payload, token) => {
  return API.post(`api/v1/payments/revoke_payment_method/`, payload, token)
}

export const leaveTip = (payload, token) => {
  return API.post(`api/v1/payments/tip/`, payload, token)
}
