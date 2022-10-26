function calculate_sar(cations) {
   let sar=0;
   sar= cations[0]/(Math.sqrt((cations[1]+cations[2])/2))
   return sar
}

module.exports = calculate_sar;