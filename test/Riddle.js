"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_network_helpers_1 = require("@nomicfoundation/hardhat-network-helpers");
const chai_1 = require("chai");
const hardhat_1 = require("hardhat");
describe("Riddle", function () {
    async function deployRiddleFixture() {
        const questions = ["When did Columbus discover a new continent?", "What's the capital of Slovenia?"];
        const answers = ["1492", "Ljubljana"];
        const couponCodes = ["couponA", "couponB"];
        const couponKeys = ["c0e43d8755f201b715fd5a9ce0034c568442543ae0a0ee1aec2985ffe40edb99", "1628c0d075975e217ff8e245d6c0d438e8a16878fa0db26d88d9d0bcadfec2a9"];
        const Riddle = await hardhat_1.ethers.getContractFactory("Riddle");
        const riddle = await Riddle.deploy(questions, answers, couponCodes, couponKeys);
        return { riddle, questions, answers, couponCodes, couponKeys };
    }
    it("Should return question", async function () {
        const { riddle, questions, answers, couponCodes } = await (0, hardhat_network_helpers_1.loadFixture)(deployRiddleFixture);
        let [coupons, claimable] = await riddle.countCoupons();
        (0, chai_1.expect)(coupons).to.equal(2);
        (0, chai_1.expect)(claimable).to.equal(0);
        await (0, chai_1.expect)(riddle.getQuestion("some invalid coupon")).to.be.revertedWith("Invalid coupon");
        (0, chai_1.expect)(await riddle.getQuestion(couponCodes[0])).to.equal(questions[1]);
    });
    it("Should check the answer", async function () {
        const { riddle, questions, answers, couponCodes, couponKeys } = await (0, hardhat_network_helpers_1.loadFixture)(deployRiddleFixture);
        await (0, chai_1.expect)(riddle.submitAnswer("some invalid coupon", "123")).to.be.revertedWith("Invalid coupon");
        await (0, chai_1.expect)(riddle.submitAnswer(couponCodes[0], "123")).to.be.revertedWith("Wrong answer");
        await (await riddle.submitAnswer(couponCodes[0], answers[1])).wait();
        const [coupons, claimable] = await riddle.countCoupons();
        (0, chai_1.expect)(coupons).to.equal(2);
        (0, chai_1.expect)(claimable).to.equal(1);
    });
    it("Should add new coupon", async function () {
        const { riddle, questions, answers, couponCodes, couponKeys } = await (0, hardhat_network_helpers_1.loadFixture)(deployRiddleFixture);
        const [_owner, addr1] = await hardhat_1.ethers.getSigners();
        await (0, chai_1.expect)(riddle.connect(addr1).addCoupon("newCoupon", "somePrivKey")).to.be.revertedWith("Access forbidden by contract policy");
        await (await riddle.addCoupon("newCoupon", "somePrivKey")).wait();
        const [coupons, claimable] = await riddle.countCoupons();
        (0, chai_1.expect)(coupons).to.equal(3);
        (0, chai_1.expect)(claimable).to.equal(0);
        await (await riddle.submitAnswer("newCoupon", answers[0])).wait();
        (0, chai_1.expect)(await riddle.claimReward("newCoupon")).to.equal("somePrivKey");
    });
    it("Should reclaim award", async function () {
        const { riddle, questions, answers, couponCodes, couponKeys } = await (0, hardhat_network_helpers_1.loadFixture)(deployRiddleFixture);
        await (0, chai_1.expect)(riddle.claimReward("some invalid coupon")).to.be.revertedWith("Invalid coupon");
        await (0, chai_1.expect)(riddle.claimReward(couponCodes[0])).to.be.revertedWith("Invalid coupon");
        await (await riddle.submitAnswer(couponCodes[0], answers[1])).wait();
        (0, chai_1.expect)(await riddle.claimReward(couponCodes[0])).to.equal(couponKeys[0]);
    });
    it("Should connect to existing contract", async function () {
        const { riddle, questions, answers, couponCodes, couponKeys } = await (0, hardhat_network_helpers_1.loadFixture)(deployRiddleFixture);
        const addr = riddle.address;
        let riddle2 = new hardhat_1.ethers.Contract(addr, [
            "function getQuestion(string memory coupon) external view returns (string memory)",
            "function submitAnswer(string memory coupon, string memory answer) external",
            "function claimReward(string memory coupon) external view returns (string memory)",
        ], (await hardhat_1.ethers.getSigners())[0]);
        await (await riddle2.submitAnswer(couponCodes[0], answers[1])).wait();
        (0, chai_1.expect)(await riddle2.claimReward(couponCodes[0])).to.equal(couponKeys[0]);
    });
});
