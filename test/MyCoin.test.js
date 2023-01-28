const MyCoin = artifacts.require('MyCoin')
const truffleAssert = require('truffle-assertions')

require('dotenv').config({ path: '../.env' })

contract("MyCoin", (accounts) => {

    const [deployerAccount,  recipient] = accounts

    var myCoinInstance = null

    const initialTotalSupply = web3.utils.toBN(process.env.INITIAL_COINS + '000000000000000000')

    beforeEach(async () => {
        myCoinInstance = await MyCoin.new(process.env.INITIAL_COINS)
    })

    it('Name of token should be Filicoin', async () => {
        const name = await myCoinInstance.name()

        assert.equal(name, 'Filicoin', 'Wrong token name')
    })

    it('Symbol of token should be FLC', async () => {
        const symbol = await myCoinInstance.symbol()

        assert.equal(symbol, 'FLC', 'Wrong token name')
    })

    it('Initial total supply should be 1000000 Filicoins', async () => {
        const totalSupply = await myCoinInstance.totalSupply()

        assert.equal(totalSupply.toString(), initialTotalSupply.toString(), 'Wrong total supply')
    })

    it('Balance of first account should be equal to total balance', async () => {
        const totalSupply = await myCoinInstance.totalSupply()
        const balance = await myCoinInstance.balanceOf(deployerAccount)

        assert.equal(balance.toString(), totalSupply.toString(), 'Wrong balance of first account')
    })

    it('Transferring 100 Filicoins', async () => {
        const transferCoins = web3.utils.toBN('100000000000000000000')
        const totalSupply = await myCoinInstance.totalSupply()

        const deployerBalanceBefore = await myCoinInstance.balanceOf(deployerAccount)
        const recipientBalanceBefore = await myCoinInstance.balanceOf(recipient)
        

        assert.equal(deployerBalanceBefore.toString(), totalSupply.toString(), 'Wrong balance of first account before transfer')
        assert.equal(recipientBalanceBefore.toString(), '0', 'Wrong balance of second account before transfer')

        const txResult = await myCoinInstance.transfer(recipient, transferCoins)

        truffleAssert.eventEmitted(txResult, 'Transfer', {from: deployerAccount, to: recipient, value: transferCoins})

        const deployerBalanceAfter = await myCoinInstance.balanceOf(deployerAccount)
        const recipientBalanceAfter = await myCoinInstance.balanceOf(recipient)

        assert.equal(deployerBalanceAfter.toString(), totalSupply.sub(transferCoins).toString(), 'Wrong balance of first account after transfer')
        assert.equal(recipientBalanceAfter.toString(), transferCoins.toString(), 'Wrong balance of second account after transfer')
    })

    it('Transferring more than total supply', async () => {
        const totalSupply = await myCoinInstance.totalSupply()
        const transferCoins = totalSupply.add(web3.utils.toBN(1))

        const deployerBalance = await myCoinInstance.balanceOf(deployerAccount)
        const recipientBalance = await myCoinInstance.balanceOf(recipient)

        assert.equal(deployerBalance.toString(), totalSupply.toString(), 'Wrong balance of first account before transfer')
        assert.equal(recipientBalance.toString(), '0', 'Wrong balance of second account before transfer')

        try {
            await myCoinInstance.transfer(recipient, transferCoins)
        } catch(error) {
            assert.equal(
                error.toString(), 
                "Error: VM Exception while processing transaction: revert ERC20: transfer amount exceeds balance -- Reason given: ERC20: transfer amount exceeds balance.", 
                'Wrong exception'
            )
        }

        assert.equal(deployerBalance.toString(), totalSupply.toString(), 'Wrong balance of first account before transfer')
        assert.equal(recipientBalance.toString(), '0', 'Wrong balance of second account before transfer')
    })
})