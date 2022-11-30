function calculate_sodiumpercentage(cations) {
    let Na_per=0;
    Na_per= (cations[0]*100)/(cations[1]+cations[2]+cations[0]+cations[3])
    return Na_per;
 }
 
 module.exports = calculate_sodiumpercentage;