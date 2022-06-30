const ingestion_rate = {
    male: 1.5,
    female: 1.5,
    child: 0.7
}
const exposure_freq = 365;
const exposure_duration = {
    male: 30,
    female: 30,
    child: 12
};
const body_weight = {
    male: 65,
    female: 55,
    child: 18.5
};
const avg_exposure_time = {
    male: 10950,
    female: 10950,
    child: 4380
};
const ref_dosages = {
    no3: 1.6,
    f: 0.4
};

function calculateHazardIndex(va) {
    let intake_oral = {};
    let hazard_quotients = {};
    let del = [];
    let hazard_index = {
        male: 0,
        female: 0,
        child: 0
    };

    for (let i in va) {
        if (isNaN(va[i])) {
            del.push(i);
        }
    }
    
    del.forEach((item) => {
        delete va[item];
    });

    for (let i in ingestion_rate) {
        for (let j in va) {
            let temp = ((va[j] * ingestion_rate[i] * exposure_freq * exposure_duration[i]) / (body_weight[i] * avg_exposure_time[i]));
            intake_oral[j] = temp;
        }

        for (let j in va) {
            temp = ((intake_oral[j]) / (ref_dosages[j]));
            hazard_quotients[j] = temp;
        }
    
        for (let j in va) {
            hazard_index[i] += hazard_quotients[j];
        }
        hazard_index[i] = parseFloat(hazard_index[i]).toFixed(4);
    }
    return hazard_index;
}

module.exports = calculateHazardIndex;