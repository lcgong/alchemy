
import { createSelector } from 'reselect'


it('reselect', () => {

    let state = {'a':[1,2,3,4]};

    // let getData = (state) => (console.log('getdata'), state);

    let getData = createSelector(state => state, (data)=> {
        console.log('getdata');
        return data;
    });
    

    console.log(123, getData(state));


    let getItemA = createSelector(getData, (data)=>{
        console.log('getItemA');
        return data['a'];
    })

    console.log(124, getItemA(state));
    
    state = {
        ...state,
        'a' : [...state['a'], 5],
    }

    console.log(124, getItemA(state));


    let getResult = createSelector(getItemA, (data)=>{
        console.log('getResult');
        return data;
    })

    state = {
        ...state,
        'a' : [...state['a'], 5],
    }

    console.log(3333, getResult(state));

    // // data['b'] = [10,20];
    // data = {
    //     ...data,
    //     'a' : [...data['a'], 5],
    // }

    // console.log(3334, getResult(state));

});