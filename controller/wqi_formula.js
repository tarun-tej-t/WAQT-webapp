/* 
   vs => standard values
   vi => ideal values 
*/

const vs = {
    ph: 9.06,
    turbidity: 5,
    temperature: 25,
    electrical_conductivity: 1500,
    hardness: 500,
    alkalinity: 120,
    dissolved_oxygen: 8,
    biological_oxygen_demand: 4,
    chemical_oxygen_demand: 25,
    ammonium: 0.2,
    nitrate: 5,
    nitrite: 1,
    phosphate: 0.65,
    fluoride: 1
};

const vi = {
    ph: 7,
    turbidity: 0,
    temperature: 0,
    electrical_conductivity: 0,
    hardness: 0,
    alkalinity: 0,
    dissolved_oxygen: 14.6,
    biological_oxygen_demand: 0,
    chemical_oxygen_demand: 0,
    ammonium: 0,
    nitrate: 0,
    nitrite: 0,
    phosphate: 0,
    fluoride: 0
};

function calculate_wqi(va) {
    // wi => unit weight
    // qi => quality rating
    // pro_sum_qi_wi => sum(qi * wi)
    // sum_wi => sum(wi)

    let wi = {};
    let qi = {};
    let del = [];
    let sum_wi = 0;
    let pro_sum_qi_wi = 0;
    let k = 0;

    delete va["latitude"];
    delete va["longitude"];
    delete va["date"];
    delete va["sodiumion"];
    delete va["calciumion"];
    delete va["magnesiumion"]
    
    for (let i in va) {
        if (isNaN(va[i])) {
            del.push(i);
        }
    }
    
    del.forEach((item) => {
        delete va[item];
    });

    for (let i in va) {
        k += Math.pow(vs[i], -1);
    }
    k = Math.pow(k, -1);
    for (let i in va) {
        let temp = (k/vs[i]);
        temp = Number(temp.toFixed(6));
        wi[i] = temp;
    }

    for (let i in va) {
        let temp = ((( va[i] - vi[i] )/( vs[i] - vi[i] )) * 100);
        temp = Number(temp.toFixed(6));
        qi[i] = temp;
    }

    for (let i in va) {
        sum_wi += wi[i];
        pro_sum_qi_wi += (qi[i] * wi[i]);
    }
    return (pro_sum_qi_wi/sum_wi).toFixed(2);
}

module.exports = calculate_wqi;