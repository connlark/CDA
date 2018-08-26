export const RECIEVE_NOTIFICATION = 'RECIEVE_NOTIFICATION'
export const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION'

export function recieveNotification(data) {
  return {
    type: RECIEVE_NOTIFICATION,
    data
  }
}

export function removeNotificationFromPending(_id) {
  return {
    type: REMOVE_NOTIFICATION,
    _id
  }
}

