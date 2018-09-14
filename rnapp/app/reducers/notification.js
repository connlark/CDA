import { RECIEVE_NOTIFICATION, REMOVE_NOTIFICATION } from '../Actions/notificationLogic';

const initialState = {
    pendingNotifications: [],
};

export default notification = (state = initialState, action) => {
    switch (action.type) {
        case RECIEVE_NOTIFICATION:
            const newPending = state.pendingNotifications;
            const data = action.data;
            data.data.extraData = JSON.parse(data.data.extraData)

            //check to see if notif is already pending 
            state.pendingNotifications.map((notif) => {
                if (notif.data.extraData.id === data.data.extraData.id) return;
            })
 
            newPending.push(action.data);
            return Object.assign({}, state, {
                pendingNotifications: newPending
            });
        case REMOVE_NOTIFICATION: 
            const updatedPending = state.pendingNotifications;
            updatedPending = updatedPending.filter((element) => element.data._id !== action._id);

            return Object.assign({}, state, {
                pendingNotifications: updatedPending
            });
        default:
            return state
    }
}
