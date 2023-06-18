const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Denial of Service", function () {
    it("After being declared the winner, Attack.sol should not allow anyone else to become the winner", async function () {
        // Deploy the good contract
        const Good = await ethers.getContractFactory("Good");
        const goodContract = await Good.deploy();
        await goodContract.waitForDeployment();
        console.log("Good Contract's Address:", goodContract.getAddress());

        // Deploy the Attack contract
        const Attack = await ethers.getContractFactory("Attack");
        const attackContract = await Attack.deploy(
            await goodContract.getAddress()
        );
        await attackContract.waitForDeployment();
        console.log("Attack Contract's Address", attackContract.getAddress());

        // Now let's attack the good contract
        // Get two addresses
        const [_, addr1, addr2] = await ethers.getSigners();

        // Initially let addr1 become the current winner of the auction
        let tx = await goodContract.connect(addr1).setCurrentAuctionPrice({
            value: ethers.parseEther("1"),
        });
        await tx.wait();

        // Start the attack and make Attack.sol the current winner of the auction
        tx = await attackContract.attack({
            value: ethers.parseEther("3"),
        });
        await tx.wait();

        // Now let's trying making addr2 the current winner of the auction
        tx = await goodContract.connect(addr2).setCurrentAuctionPrice({
            value: ethers.parseEther("4"),
        });
        await tx.wait();

        // Now let's check if the current winner is still attack contract
        expect(await goodContract.currentWinner()).to.equal(
            await attackContract.getAddress()
        );
    });
});
