import { API } from './'

export const createOrder = (body, token) => {
  return API.post(`api/v1/orders/`, body, token)
}

export const acceptOrder = (body, token) => {
  return API.post(`api/v1/orders/accept/`, body, token)
}

export const skipOrder = (body, token) => {
  return API.post(`api/v1/orders/skip/`, body, token)
}

export const removeOrderFromCart = (order_id, token) => {
  return API.delete(`api/v1/orders/${order_id}/`, {}, token)
}

export const getOrder = (payload, token) => {
  return API.get(`api/v1/orders/${payload}`, token)
}

export const getOrderByID = (id, token) => {
  return API.get(`api/v1/orders/${id}/`, token)
}

export const deleteOrder = (id, token) => {
  return API.delete(`api/v1/orders/${id}/`, {}, token)
}

export const updateOrder = (id, body, token) => {
  return API.patch(`api/v1/orders/${id}/`, body, token)
}

export const getItems = token => {
  return API.get(`api/v1/items/`, token)
}

export const getNotification = token => {
  return API.get(`api/v1/notifications/`, token)
}

export const notificationRead = (body, token) => {
  return API.post(`api/v1/notifications/read/`, body, token)
}

export const allNotificationRead = token => {
  return API.get(`api/v1/notifications/read/`, token)
}

export const leaveReview = (body, token) => {
  return API.post(`api/v1/reviews/`, body, token)
}

export const leaveCustomerReview = (body, token) => {
  return API.post(`api/v1/customer-reviews/`, body, token)
}

export const leaveReport = (body, token) => {
  return API.post(`api/v1/problems/`, body, token)
}
