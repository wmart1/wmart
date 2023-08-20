import { API } from './'

export const signupUser = payload => {
  return API.post('api/v1/users/', payload)
}

export const loginUser = payload => {
  return API.post('api/v1/users/login/', payload)
}

export const resetEmail = payload => {
  return API.post('api/v1/users/reset/', payload)
}

export const setPassword = (payload, token) => {
  return API.post('api/v1/users/password/', payload, token)
}

export const updateProfile = async (payload, user_id, token) => {
  return API.patch(`api/v1/users/${user_id}/`, payload, token)
}

export const editProfile = (id, payload, token) => {
  return API.patch(`api/v1/users/${id}/`, payload, token)
}

export const deleteAccount = (id, token) => {
  return API.delete(`api/v1/users/${id}/`, {}, token)
}

export const forgotpasswordCode = payload => {
  return API.post('api/v1/forgotpasswordcode', payload)
}

export const forgotpassword = payload => {
  return API.post('api/v1/users/otp/', payload)
}

export const getProfile = (id, token) => {
  return API.get(`api/v1/users/${id}/`, token)
}

export const getMyReviews = token => {
  return API.get('api/v1/my-reviews/', token)
}

export const getFoodtrucks = token => {
  return API.get('api/v1/foodtrucks/', token)
}

export const getFavoriteFoodtruck = token => {
  return API.get('api/v1/customers/favorite/', token)
}

export const addFavoriteFoodtruck = (body, token) => {
  return API.post('api/v1/customers/favorite/', body, token)
}

export const removeFavoriteFoodtruck = (body, token) => {
  return API.delete('api/v1/customers/favorite/', body, token)
}

export const getTerms = token => {
  return API.get('modules/terms-and-conditions/', token)
}

export const getPrivacyPolicy = token => {
  return API.get('modules/privacy-policy/', token)
}

export const createSupport = (body, token) => {
  return API.post('api/v1/disputes/', body, token)
}

export const getExtraServices = () => {
  return API.get('api/v1/extra-services/')
}
