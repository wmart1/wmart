import { API } from './'

export const createBusinessStripe = token => {
  return API.get(`api/v1/users/account/`, token)
}

export const createMenu = (body, token) => {
  return API.post(`api/v1/items/`, body, token)
}

export const updateMenu = (id, body, token) => {
  return API.patch(`api/v1/items/${id}/`, body, token)
}

export const deleteItem = (id, token) => {
  return API.delete(`api/v1/items/${id}/`, {}, token)
}


export const getSubscription = token => {
  return API.get(`api/v1/payments/plans/`, token)
}

export const AddPayMethod = (body, token) => {
  return API.post(`api/v1/payments/add_payment_method/`, body, token)
}

export const userSubscribe = (body, token) => {
  return API.post(`api/v1/payments/subscribe/`, body, token)
}

export const userChangePlan = (body, token) => {
  return API.patch(`api/v1/payments/change_subscription/`, body, token)
}

export const userUnSubscribe = token => {
  return API.get(`api/v1/payments/unsubscribe/`, token)
}

export const getPayMethod = token => {
  return API.get(`api/v1/payments/my_cards/`, token)
}
