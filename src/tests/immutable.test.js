import { fromJS } from 'immutable/dist/immutable';

console.log(fromJS)

// import {Immutable} from 'immutable/immutable';

// const { fromJS } = require('immutable')
// const nested = fromJS({ a: { b: { c: [3, 4, 5] } } })


it('reselect', () => {
    //

    let d = fromJS({
        a: {
            b: {
                c: [1, 2]
            }
        }
    });


    console.log(d.get('a'))


    let n1 = d.set('x', 12);
    console.log('n1=', n1.getIn(['a','b']))

    console.log(n1.getIn(['a','b']) === d.getIn(['a','b']))

    // console.log(d);


    // console.log(d.get('a'));

});
