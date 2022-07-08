const main = async () => {
    const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
    const wavePrice = {value: ethers.utils.parseEther("0.015")}
    const waveContract = await waveContractFactory.deploy({
        //value: hre.ethers.utils.parseEther("0.1"),
    });
    await waveContract.deployed();
    console.log("Contract address:", waveContract.address);

    /*
     * Get Contract balance
     */
    let contractBalance = await hre.ethers.provider.getBalance(
        waveContract.address
    );
    console.log(
        "Contract balance:",
        hre.ethers.utils.formatEther(contractBalance)
    );

    /*
     * Unpause contract
     */
    let unapausedTxn = await waveContract.changeIsPausedState();
    await unapausedTxn.wait();
    let getIsPaused = await waveContract.getIsPaused();
    console.log("Contract IsPaused status : " + getIsPaused);


    /*
     * Send Wave
     */
    let waveTxn = await waveContract.wave("A message!", wavePrice);
    await waveTxn.wait();

    /*
     * Second Wave that will fail
     */
    try {
        waveTxn = await waveContract.wave("A message!", wavePrice);
        await waveTxn.wait();
    } catch (e) {
        console.log("Transaction failed : ", e.message);
    }

    /*
     * Get Contract balance to see what happened!
     */
    contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log(
        "Contract balance:",
        hre.ethers.utils.formatEther(contractBalance)
    );

    let allWaves = await waveContract.getAllWaves();
    console.log(allWaves);

    /*
     * Pause contract
     */
    unapausedTxn = await waveContract.changeIsPausedState();
    await unapausedTxn.wait();
    getIsPaused = await waveContract.getIsPaused();
    console.log("Contract IsPaused status : " + getIsPaused);

};

const runMain = async () => {
    try {
        await main();
        process.exit(0); // exit Node process without error
    } catch (error) {
        console.log(error);
        process.exit(1); // exit Node process while indicating 'Uncaught Fatal Exception' error
    }
    // Read more about Node exit ('process.exit(num)') status codes here: https://stackoverflow.com/a/47163396/7974948
};

runMain();