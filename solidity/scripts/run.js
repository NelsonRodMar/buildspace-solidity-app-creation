const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();
    const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
    const waveContract = await waveContractFactory.deploy();
    await waveContract.deployed();
    console.log("Contract deployed to:", waveContract.address);
    console.log("Contract by :", owner.address);

    let waveCount;
    waveCount = await waveContract.getTotalWaves();
    console.log("Total waves : " + waveCount);

    let waveTxn = await waveContract.wave();
    await waveTxn.wait();

    waveCount = await waveContract.getTotalWaves();
    console.log("Total waves : " + waveCount);

    try {

        waveTxn = await waveContract.connect(randomPerson).wave();
        await waveTxn.wait();
    } catch (error){
        console.log(" Il y as eu une erreur ");
    }

    waveTxn = await waveContract.setNewOwner(randomPerson.address);
    await waveTxn.wait();

    waveTxn = await waveContract.connect(randomPerson).wave();
    await waveTxn.wait();

    waveCount = await waveContract.getTotalWaves();
    console.log("Total waves : " + waveCount);
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