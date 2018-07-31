import Dimensions from 'Dimensions';

let dimen = Dimensions.get('window');
export const IS_X =  (dimen.height === 812 || dimen.width === 812);