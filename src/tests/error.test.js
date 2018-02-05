async function fnA(data) {
    console.log('fnA:', data);

    return data * 100;
}

async function fnB(data) {
    console.log('fnB:', data);

    throw 123;

    return data + 100;
}

async function fnC(data) {
    console.log('fnC:', data);

    return data + 3000;
}

async function someHellComputation(initialData) {
    const a = await fnA(initialData)
        .catch((exc) => {
            console.log('catched fnA', exc);
            throw 'errored on A';
        });

    const b = await fnB(a)
        .catch((exc) => {
            console.log('catched fnB', typeof exc, exc);
            throw 'errored on B';
        });

    const c = await fnC(b)
        .catch(() => {
            console.log('catched fnC');
            throw 'errored on C'
        });

    return c;
}


it('error ', () => {

    someHellComputation(10)
        .then(console.log)
        .catch(console.error);

});
