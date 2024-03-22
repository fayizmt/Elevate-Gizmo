const otpVerification = async (otpTime) => {
    try {
        console.log('milliseconds is: ' + otpTime);
        const cDateTime = new Date();
        console.log('Current Date and Time: ' + cDateTime);

        const differenceValue = (otpTime - cDateTime.getTime()) / 1000;
        const minutes = Math.abs(differenceValue/60);

        console.log(`Expired minutes: ${minutes}`);

        if (minutes > 2) {
            return true;
        }
        else{
            return false;
        }
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = otpVerification 