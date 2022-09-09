import { getLimit } from './limit';
import { limit } from './var';

export default {
    test: {
        x: () => {
            return getLimit()
        },
        y: () => {
            return limit + multiplier
        }
    }
}

const multiplier = 7
