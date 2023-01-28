const MyCoin = artifacts.require("MyCoin")

require('dotenv').config({ path: '../.env' })

module.exports = async function(deployer) {
    await deployer.deploy(MyCoin, process.env.INITIAL_COINS)
}